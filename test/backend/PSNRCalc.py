#!/usr/bin/env python3
"""
Enhanced PSNR Calculator with robust error handling and input validation.
Provides multi-codec video encoding and PSNR calculation with comprehensive error handling.
"""

import subprocess
import sys
import shutil
import re
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PSNRError(Exception):
    """Custom exception for PSNR calculation errors."""
    pass


class EncoderNotFoundError(PSNRError):
    """Exception raised when required encoder is not available."""
    pass


# ==============================================================================
# INTERNAL HELPER FUNCTIONS
# ==============================================================================

def _run_ffmpeg_command(command: list, description: str) -> subprocess.CompletedProcess:
    """A helper to run ffmpeg commands and handle errors."""
    logger.info(f"Starting: {description}")
    
    try:
        # Validate command
        if not command or not isinstance(command, list):
            raise PSNRError(f"Invalid command for {description}")
        
        # Log command for debugging
        command_str = ' '.join(f'"{arg}"' if ' ' in arg else arg for arg in command)
        logger.debug(f"Executing: {command_str}")
        
        process = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=300  # 5 minute timeout
        )
        
        logger.info(f"Completed: {description}")
        return process
        
    except subprocess.TimeoutExpired as e:
        logger.error(f"Timeout during: {description}")
        raise PSNRError(f"Command timed out: {description}")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Error during: {description}")
        command_str = ' '.join(f'"{arg}"' if ' ' in arg else arg for arg in e.cmd)
        logger.error(f"Command: {command_str}")
        logger.error(f"Stderr: {e.stderr}")
        raise PSNRError(f"FFmpeg failed during {description}: {e.stderr}")
        
    except Exception as e:
        logger.error(f"Unexpected error during: {description}: {e}")
        raise PSNRError(f"Unexpected error during {description}: {e}")

def _is_valid_video_file(video_path: Path) -> bool:
    """Check if a video file exists and is valid using ffprobe."""
    if not video_path.exists():
        return False
    
    try:
        # Use ffprobe to check if the file is a valid video
        command = [
            "/usr/bin/ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=codec_name,width,height,duration",
            "-of", "csv=p=0",
            str(video_path)
        ]
        
        process = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        
        # If ffprobe succeeds and returns output, the file is valid
        output = process.stdout.strip()
        if output and len(output.split(',')) >= 3:  # Should have codec_name, width, height at minimum
            return True
        return False
        
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def _get_expected_output_path(codec: str, input_path: Path, output_base_path: Path) -> Path:
    """Get the expected output path for a given codec."""
    extension = ".webm" if codec == "av1" else ".mp4"
    return output_base_path / f"{input_path.stem}_{codec}{extension}"

def _encode_video(codec: str, input_path: Path, output_base_path: Path) -> Path:
    """Encodes the source video to a specified codec using NVENC."""
    output_file = _get_expected_output_path(codec, input_path, output_base_path)
    
    # Check if file already exists and is valid
    if _is_valid_video_file(output_file):
        print(f"⏭️  Skipping encoding: {output_file.name} already exists and is valid")
        return output_file
    
    # --- CORRECTED FFMPEG COMMAND STRUCTURE FOR NVENC ---
    # Global options must come first, followed by input, followed by codec-specific options.
    
    # 1. Global and Input options
    input_options = ["-y", "-i", str(input_path)]

    # 2. Codec selection and its private options
    # These options are specific to the NVENC encoders with correct syntax.
    
    if codec == 'h264':
        encoder_selection = ["-c:v", "h264_nvenc"]
        encoder_private_options = [
            "-preset", "medium",      # NVENC presets: default, slow, medium, fast, hp, hq, bd, ll, llhq, llhp, lossless
            "-rc", "vbr",           # Rate control: constqp, vbr, cbr, cbr_ld_hq, cbr_hq, vbr_hq
            "-cq", "40",            # Constant Quality level (lower is better, 0-51)
            "-qmin", "0",
            "-qmax", "51",
            "-b:v", "0"             # Required for VBR mode
        ]
    elif codec == 'h265':
        encoder_selection = ["-c:v", "hevc_nvenc"]
        encoder_private_options = [
            "-preset", "medium",      # NVENC presets for HEVC
            "-rc", "vbr",           # Rate control
            "-cq", "40",            # Constant Quality level
            "-qmin", "0",
            "-qmax", "51",
            "-b:v", "0"             # Required for VBR mode
        ]
    elif codec == 'av1':
        encoder_selection = ["-c:v", "av1_nvenc"]
        encoder_private_options = [
            "-preset", "medium",      # AV1 NVENC presets
            "-rc", "vbr",           # Rate control
            "-cq", "40",            # Constant Quality level
            "-qmin", "0",
            "-qmax", "63",          # AV1 uses 0-63 range
            "-b:v", "0"             # Required for VBR mode
        ]
    else:
        raise ValueError(f"Unsupported codec: {codec}")
    # After encoder_options and before output path
    extra_options = []
    if output_file.suffix == ".mp4":
        extra_options = ["-movflags", "+faststart"]
    # 3. Assemble the command in the correct order
    command = [
        "/usr/bin/ffmpeg",
        *input_options,
        *encoder_selection,         # Must come before encoder options
        *encoder_private_options,   # These apply to the codec chosen above
        *extra_options,
        str(output_file)
    ]
    
    _run_ffmpeg_command(command, f"Encoding to {codec.upper()}")
    return output_file

def _calculate_psnr(encoded_video_path: Path, original_video_path: Path) -> float:
    """Calculates the average PSNR between an encoded video and the original."""
    command = [
        "/usr/bin/ffmpeg",
        "-i", str(encoded_video_path),
        "-i", str(original_video_path),
        "-lavfi", "psnr=stats_file=-", # Pipe stats to stdout/stderr
        "-f", "null",
        "-"
    ]
    process = _run_ffmpeg_command(command, f"Calculating PSNR for {encoded_video_path.name}")
    
    psnr_output = process.stderr
    match = re.search(r"average:(\d+\.?\d*)", psnr_output)
    
    if match:
        return float(match.group(1))
    
    print(f"⚠️ Could not parse PSNR from ffmpeg output for {encoded_video_path.name}", file=sys.stderr)
    return 0.0

def _process_one_codec(codec: str, input_path: Path, output_base_path: Path) -> dict:
    """Encodes and calculates PSNR for a single codec."""
    encoded_path = _encode_video(codec, input_path, output_base_path)
    psnr = _calculate_psnr(encoded_path, input_path)
    return {
        "path": str(encoded_path.resolve()),
        "psnr": psnr
    }

# ==============================================================================
# FALLBACK FUNCTIONS FOR SYSTEMS WITHOUT NVENC
# ==============================================================================

def _check_encoder_support():
    """Check what encoders are actually available."""
    try:
        result = subprocess.run(
            ["/usr/bin/ffmpeg", "-encoders"],
            capture_output=True,
            text=True,
            check=True
        )
        output = result.stdout
        
        # Check for various encoder types
        encoders = {
            'h264_nvenc': 'h264_nvenc' in output,
            'hevc_nvenc': 'hevc_nvenc' in output,
            'av1_nvenc': 'av1_nvenc' in output,
            'libx264': 'libx264' in output,
            'libx265': 'libx265' in output,
            'libaom_av1': 'libaom-av1' in output,
            'libsvtav1': 'libsvtav1' in output,
            'mpeg4': 'mpeg4' in output,
            'libxvid': 'libxvid' in output,
            'h264': ' h264 ' in output,  # Built-in H.264
            'hevc': ' hevc ' in output,  # Built-in HEVC
        }
        
        return encoders
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {}

def _encode_video_adaptive(codec: str, input_path: Path, output_base_path: Path, available_encoders: dict) -> Path:
    """Adaptively choose the best available encoder for the codec."""
    output_file = _get_expected_output_path(codec, input_path, output_base_path)
    
    # Check if file already exists and is valid
    if _is_valid_video_file(output_file):
        print(f"⏭️  Skipping encoding: {output_file.name} already exists and is valid")
        return output_file
    
    input_options = ["-y", "-i", str(input_path)]
    
    # Try to find the best available encoder for each codec
    if codec == 'h264':
        if available_encoders.get('h264_nvenc'):
            encoder_selection = ["-c:v", "h264_nvenc"]
            encoder_options = ["-preset", "slow", "-rc", "vbr", "-cq", "24", "-b:v", "0"]
        elif available_encoders.get('libx264'):
            encoder_selection = ["-c:v", "libx264"]
            encoder_options = ["-preset", "slow", "-crf", "24"]
        elif available_encoders.get('h264'):
            encoder_selection = ["-c:v", "h264"]
            encoder_options = ["-b:v", "2M"]  # Simple bitrate
        else:
            raise ValueError("No H.264 encoder available")
            
    elif codec == 'h265':
        if available_encoders.get('hevc_nvenc'):
            encoder_selection = ["-c:v", "hevc_nvenc"]
            encoder_options = ["-preset", "slow", "-rc", "vbr", "-cq", "24", "-b:v", "0"]
        elif available_encoders.get('libx265'):
            encoder_selection = ["-c:v", "libx265"]
            encoder_options = ["-preset", "slow", "-crf", "24"]
        elif available_encoders.get('hevc'):
            encoder_selection = ["-c:v", "hevc"]
            encoder_options = ["-b:v", "1M"]  # Simple bitrate
        else:
            raise ValueError("No H.265 encoder available")
            
    elif codec == 'av1':
        if available_encoders.get('av1_nvenc'):
            encoder_selection = ["-c:v", "av1_nvenc"]
            encoder_options = ["-preset", "slow", "-rc", "vbr", "-cq", "24", "-b:v", "0"]
        elif available_encoders.get('libsvtav1'):
            encoder_selection = ["-c:v", "libsvtav1"]
            encoder_options = ["-crf", "24"]
        elif available_encoders.get('libaom_av1'):
            encoder_selection = ["-c:v", "libaom-av1"]
            encoder_options = ["-crf", "24", "-b:v", "0"]
        else:
            # Use a simple format conversion if no AV1 encoder
            print(f"⚠️ No AV1 encoder available, skipping AV1 encoding")
            raise ValueError("No AV1 encoder available")
    else:
        raise ValueError(f"Unsupported codec: {codec}")

    # After encoder_options and before output path
    extra_options = []
    if output_file.suffix == ".mp4":
        extra_options = ["-movflags", "+faststart"]
        
    command = [
        "/usr/bin/ffmpeg",
        *input_options,
        *encoder_selection,
        *encoder_options,
        *extra_options,
        str(output_file)
    ]
    
    encoder_name = encoder_selection[1]
    _run_ffmpeg_command(command, f"Encoding to {codec.upper()} using {encoder_name}")
    return output_file

def _process_one_codec_adaptive(codec: str, input_path: Path, output_base_path: Path, available_encoders: dict) -> dict:
    """Process one codec using the best available encoder."""
    try:
        encoded_path = _encode_video_adaptive(codec, input_path, output_base_path, available_encoders)
        psnr = _calculate_psnr(encoded_path, input_path)
        return {
            "path": str(encoded_path.resolve()),
            "psnr": psnr
        }
    except Exception as e:
        print(f"❌ {codec.upper()} processing failed: {e}")
        return {"path": "ERROR", "psnr": 0.0}

# ==============================================================================
# PUBLIC API FUNCTION
# ==============================================================================

def process_video(video_path: str, output_base_path: Path, force_reencode: bool = False) -> Dict[str, Any]:
    """
    Takes a video, encodes it to H.264, H.265, and AV1, calculates PSNR for each,
    and returns a dictionary with file paths and results.

    Args:
        video_path (str): The path to the source video file.
        output_base_path (str): The path to the directory where all encoded
                                files will be saved. It will be created if it
                                doesn't exist.
        force_reencode (bool): If True, forces re-encoding even if output files
                              already exist. If False (default), skips encoding
                              for existing valid files and only recalculates PSNR.

    Returns:
        A dictionary containing the paths and PSNR values.

    Raises:
        PSNRError: If any processing step fails.
        FileNotFoundError: If required files or tools are not found.
    """
    try:
        # Validate inputs
        if not video_path:
            raise PSNRError("Video path cannot be empty")
        
        if not output_base_path:
            raise PSNRError("Output base path cannot be empty")

        # Check for ffmpeg
        if not shutil.which("/usr/bin/ffmpeg"):
            raise PSNRError("ffmpeg not found. Please install ffmpeg and ensure it's in your system's PATH.")

        # Validate input video
        input_path = Path(video_path).resolve()
        if not input_path.exists():
            raise PSNRError(f"Input video not found: {input_path}")
        
        if not input_path.is_file():
            raise PSNRError(f"Input path is not a file: {input_path}")
        
        # Validate video file using ffprobe
        if not _is_valid_video_file(input_path):
            raise PSNRError(f"Input file is not a valid video: {input_path}")

        # Setup output directory
        base_path = Path(output_base_path).resolve()
        try:
            base_path.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            raise PSNRError(f"Permission denied creating directory: {base_path}")
        except Exception as e:
            raise PSNRError(f"Failed to create output directory {base_path}: {e}")

        logger.info(f"Input video: {input_path}")
        logger.info(f"Output directory: {base_path}")
        
        if not force_reencode:
            logger.info("Checking for existing encoded files...")

        # Check what encoders are available
        available_encoders = _check_encoder_support()
        logger.info(f"Available encoders: {[k for k, v in available_encoders.items() if v]}")

        codecs_to_process = []
        
        # Only process codecs that have available encoders
        if any(available_encoders.get(enc, False) for enc in ['h264_nvenc', 'libx264', 'h264']):
            codecs_to_process.append('h264')
        else:
            logger.warning("No H.264 encoder available, skipping H.264")
        
        if any(available_encoders.get(enc, False) for enc in ['hevc_nvenc', 'libx265', 'hevc']):
            codecs_to_process.append('h265')
        else:
            logger.warning("No H.265 encoder available, skipping H.265")
        
        if any(available_encoders.get(enc, False) for enc in ['av1_nvenc', 'libsvtav1', 'libaom_av1']):
            codecs_to_process.append('av1')
        else:
            logger.warning("No AV1 encoder available, skipping AV1")

        if not codecs_to_process:
            logger.error("No suitable encoders found!")
            return {
                "base_file_path": str(input_path),
                "output_base_path": str(base_path),
                "codecs": {
                    "base": {"path": str(input_path), "psnr": -1},
                    "h264": {"path": "NO_ENCODER", "psnr": 0.0},
                    "h265": {"path": "NO_ENCODER", "psnr": 0.0},
                    "av1": {"path": "NO_ENCODER", "psnr": 0.0},
                }
            }

    # If force_reencode is True, remove existing files first
    if force_reencode:
        print("🔄 Force re-encode mode: removing existing files...")
        for codec in codecs_to_process:
            output_file = _get_expected_output_path(codec, input_path, base_path)
            if output_file.exists():
                output_file.unlink()
                print(f"🗑️  Removed: {output_file.name}")

    results = {}

    with ThreadPoolExecutor(max_workers=len(codecs_to_process)) as executor:
        future_to_codec = {
            executor.submit(_process_one_codec_adaptive, codec, input_path, base_path, available_encoders): codec
            for codec in codecs_to_process
        }
        for future in future_to_codec:
            codec = future_to_codec[future]
            try:
                results[codec] = future.result()
            except Exception as exc:
                print(f"❌ {codec} processing generated an exception: {exc}", file=sys.stderr)
                results[codec] = {"path": "ERROR", "psnr": 0.0}

    final_output = {
        "base_file_path": str(input_path),
        "output_base_path": str(base_path),
        "codecs": {
            "base": {
                "path": str(input_path),
                "psnr": -1  # Input file compared to itself = perfect match
            },
            "h264": results.get('h264', {"path": "SKIPPED", "psnr": 0.0}),
            "h265": results.get('h265', {"path": "SKIPPED", "psnr": 0.0}),
            "av1": results.get('av1', {"path": "SKIPPED", "psnr": 0.0}),
        }
    }
    
        return final_output
    
    except PSNRError:
        # Re-raise PSNRError as-is
        raise
    except Exception as e:
        # Wrap any other exceptions
        logger.error(f"Unexpected error in process_video: {e}")
        raise PSNRError(f"Unexpected error during video processing: {e}")

if __name__ == "__main__":
    video_path = "/home/yuval/DEV/sparse_codec/data/raw/sample_1080p30.mp4"
    base_path = "."
    
    # Example usage:
    # Normal mode - will skip encoding if files exist and are valid
    res = process_video(video_path, Path(base_path))
    print("Normal mode results:")
    print(res)
    
    # Force re-encode mode - will re-encode all files regardless
    # res_force = process_video(video_path, base_path, force_reencode=True)
    # print("Force re-encode results:")
    # print(res_force)