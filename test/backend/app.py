# ==============================================================================
# 1. IMPORTS & SETUP
# ==============================================================================
import mimetypes
import os
import re
import shutil
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from demo.backend import MAPPINGS
from demo.backend.DecodeFlow import DecodeFlow
from demo.backend.EncodeFlow import EncodeFlow
from demo.backend.PSNRCalc import process_video, PSNRError
from demo.backend.VectorSearchFlow import VectorSearchFlow
from demo.backend.base_flow import FlowError
from pathlib import Path

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("./demo/backend/data/")


# ==============================================================================
# 2. STARTUP EVENT & CACHE CLEARING
# ==============================================================================
# @app.on_event("startup")
# def clear_cache_on_startup():
#     """
#     Deletes the entire data directory to clear all cache from previous runs,
#     then recreates it to be ready for the new session.
#     """
#     print("--- Server starting up: Clearing cache directory ---")
#     if DATA_DIR.exists() and DATA_DIR.is_dir():
#         try:
#             shutil.rmtree(DATA_DIR)
#             print(f"Successfully cleared cache directory: {DATA_DIR}")
#         except Exception as e:
#             print(f"Error clearing cache directory {DATA_DIR}: {e}")
    
#     try:
#         # Recreate the directory to ensure it exists for the application
#         DATA_DIR.mkdir(parents=True, exist_ok=True)
#         print(f"Successfully created empty cache directory: {DATA_DIR}")
#     except Exception as e:
#         print(f"FATAL: Could not create cache directory {DATA_DIR}: {e}")


# ==============================================================================
# 3. CORE LOGIC & HELPER FUNCTIONS
# ==============================================================================

# Global flow storage - each key maps to its own set of flows
flow_instances: Dict[str, Dict[str, Any]] = {}

def get_or_create_flows(key: str) -> Dict[str, Any]:
    """Get or create flow instances for a given key."""
    if key not in flow_instances:
        flow_instances[key] = {
            'encode_flow': EncodeFlow(),
            'decode_flow': DecodeFlow(),
            'vector_search_flow': VectorSearchFlow(),
            'uploaded_filename': None
        }
    return flow_instances[key]

def validate_key(key: Optional[str]) -> str:
    """Validate that a key exists in our flow instances."""
    if not key:
        raise HTTPException(status_code=400, detail="Key parameter is required")
    if key not in flow_instances:
        raise HTTPException(status_code=404, detail="Invalid key - no flows found for this key")
    return key

def get_video_file_info(base_name: str) -> Dict[str, Any]:
    """Get information about an existing video file."""
    video_dir = DATA_DIR / base_name
    if not video_dir.exists():
        return None
    
    # Find the video file in the directory
    for file_path in video_dir.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in ['.mp4', '.avi', '.mov', '.mkv', '.webm']:
            file_stat = file_path.stat()
            mime_type = mimetypes.guess_type(str(file_path))[0] or 'video/mp4'
            
            return {
                "filename": file_path.name,
                "saved_path": str(file_path),
                "content_type": mime_type,
                "file_size": file_stat.st_size,
                "modified_time": file_stat.st_mtime
            }
    
    return None


# ==============================================================================
# 4. FILE & SESSION MANAGEMENT ENDPOINTS
# ==============================================================================

@app.post("/upload_video")
async def upload_video(file: UploadFile = File(...)):
    """
    Uploads a video file and returns a key for future operations.
    This creates a new directory in `DATA_DIR` named after the video
    (e.g., 'video1.mp4' -> 'DATA_DIR/video1/').
    The original video is saved inside this directory.
    
    Note: You can check if a key exists first using /check_key endpoint
    to avoid unnecessary uploads.
    """
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")

    try:
        base_name = Path(file.filename).stem
        
        # Generate a unique key for this upload session
        # Using base_name as key, but you could use UUID if you want truly unique keys
        key = base_name
        
        # Check if key already exists and file is already uploaded
        if key in flow_instances:
            flows = flow_instances[key]
            video_dir = DATA_DIR / base_name
            expected_file_path = video_dir / file.filename
            
            # If file already exists, return success without re-uploading
            if expected_file_path.exists():
                return {
                    "result": "ok",
                    "key": key,
                    "filename": file.filename,
                    "saved_path": str(expected_file_path),
                    "content_type": file.content_type,
                    "message": "File already exists, skipped upload"
                }
        
        # Get or create flows for this key
        flows = get_or_create_flows(key)
        
        video_dir = DATA_DIR / base_name

        # If a new video is uploaded with the same key, reset the flows
        if flows['uploaded_filename'] != base_name:
            print(f"New video uploaded with key '{key}': {file.filename}. Resetting flows for this key.")
            flows['encode_flow'].reset()
            flows['decode_flow'].reset()
            flows['vector_search_flow'].reset()
            # Optionally, clean up the old directory
            if os.path.exists(video_dir):
                shutil.rmtree(video_dir)

        # Create directory for the video
        video_dir.mkdir(parents=True, exist_ok=True)
        file_path = video_dir / file.filename

        # Save the video file chunk by chunk
        with open(file_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):  # Read in 1MB chunks
                buffer.write(content)

        # Update the state of the encode flow with the new base name
        flows['encode_flow'].uploaded_filename = base_name
        flows['uploaded_filename'] = base_name

        return {
            "result": "ok",
            "key": key,
            "filename": file.filename,
            "saved_path": str(file_path),
            "content_type": file.content_type,
            "message": "File uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")

@app.post("/get_or_create_key")
async def get_or_create_key(request: Request):
    """
    Get or create a key for a video file. If the video already exists on disk,
    it will create/return the key without requiring upload.
    
    Expected body: {"filename": "video.mp4"}
    
    Returns the same structure as upload_video but without actual file upload.
    """
    try:
        body = await request.json()
        filename = body.get("filename")
        
        if not filename:
            raise HTTPException(status_code=400, detail="filename parameter is required")
        
        base_name = Path(filename).stem
        key = base_name
        
        # Check if file exists on disk
        video_info = get_video_file_info(base_name)
        
        if video_info:
            # File exists, get or create flows
            flows = get_or_create_flows(key)
            
            # Update the state
            flows['encode_flow'].uploaded_filename = base_name
            flows['uploaded_filename'] = base_name
            
            return {
                "result": "ok",
                "key": key,
                "filename": video_info["filename"],
                "saved_path": video_info["saved_path"],
                "content_type": video_info["content_type"],
                "file_size": video_info["file_size"],
                "message": "Key created for existing video file"
            }
        else:
            # File doesn't exist
            return {
                "result": "not_found",
                "key": key,
                "filename": filename,
                "message": f"Video file '{filename}' not found. Please upload the video first."
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/reset_file_upload")
async def reset_file_upload(request: Request):
    """
    Resets flows for a specific key and deletes the associated video data.
    """
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        
        flows = flow_instances[key]
        
        # Reset all stateful flow objects for this key
        flows['encode_flow'].reset()
        flows['decode_flow'].reset()
        flows['vector_search_flow'].reset()
        
        # Clean up the video directory for this key
        if flows['uploaded_filename']:
            video_dir = DATA_DIR / flows['uploaded_filename']
            if video_dir.exists() and video_dir.is_dir():
                shutil.rmtree(video_dir)
        
        # Remove the flows from memory
        del flow_instances[key]

        return {
            "result": "ok",
            "message": f"Flows for key '{key}' have been reset and uploaded files deleted."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during reset: {str(e)}"
        )

@app.get("/check_key")
def check_key(key: str):
    """
    Check if a key exists in the flow map.
    Returns the status and associated filename if it exists.
    """
    if key in flow_instances:
        flows = flow_instances[key]
        return {
            "result": "ok",
            "exists": True,
            "key": key,
            "uploaded_filename": flows['uploaded_filename'],
            "message": f"Key '{key}' exists and is ready for operations"
        }
    else:
        return {
            "result": "ok",
            "exists": False,
            "key": key,
            "uploaded_filename": None,
            "message": f"Key '{key}' does not exist. Upload a video to create this key."
        }

@app.post("/check_key")
async def check_key_post(request: Request):
    """
    Check if a key exists in the flow map (POST version).
    Accepts key in request body.
    """
    try:
        body = await request.json()
        key = body.get("key")
        
        if not key:
            return {"result": "error", "message": "Key parameter is required"}
        
        if key in flow_instances:
            flows = flow_instances[key]
            return {
                "result": "ok",
                "exists": True,
                "key": key,
                "uploaded_filename": flows['uploaded_filename'],
                "message": f"Key '{key}' exists and is ready for operations"
            }
        else:
            return {
                "result": "ok",
                "exists": False,
                "key": key,
                "uploaded_filename": None,
                "message": f"Key '{key}' does not exist. Upload a video to create this key."
            }
    except Exception as e:
        return {"result": "error", "message": f"Error checking key: {str(e)}"}

@app.get("/list_keys")
def list_keys():
    """
    List all active keys and their associated filenames.
    """
    return {
        "result": "ok",
        "keys": {
            key: flows['uploaded_filename'] 
            for key, flows in flow_instances.items()
        }
    }

@app.get("/reset_all")
def reset_all(key: str):
    """
    Reset all flows for a specific key.
    """
    try:
        validate_key(key)
        flows = flow_instances[key]
        
        flows['encode_flow'].reset()
        flows['decode_flow'].reset()
        flows['vector_search_flow'].reset()
        
        return {"result": "ok", "message": f"All flows for key '{key}' have been reset."}
    except Exception as e:
        return {"result": "error", "message": str(e)}


# ==============================================================================
# 5. ENCODE ENDPOINTS
# ==============================================================================

@app.post("/start_encode")
async def start_encode(request: Request):
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        flows = flow_instances[key]
        
        filename: str = body.get("filename")
        if not filename:
            return {"result": "error", "message": "filename parameter is required"}

        base_name = os.path.splitext(filename)[0]
        
        # Only reset if filename is different from current one
        if flows['encode_flow'].uploaded_filename != base_name:
            flows['encode_flow'].reset()
            flows['decode_flow'].reset()
            flows['vector_search_flow'].reset()
        
        flows['encode_flow'].start_encode(base_name)
        return {"result": "ok"}

    except FlowError as e:
        return {"result": "error", "message": f"Flow error: {str(e)}"}
    except Exception as e:
        return {"result": "error", "message": f"Unexpected error: {str(e)}"}

@app.get("/poll_encode_started")
def poll_encode_started(key: str):
    validate_key(key)
    flows = flow_instances[key]
    result = flows['encode_flow'].get_start_time()
    return {"result": result}

@app.get("/poll_encode")
def poll_encode(key: str):
    validate_key(key)
    flows = flow_instances[key]
    
    end_time = flows['encode_flow'].get_end_time()
    start_time = flows['encode_flow'].get_start_time()

    if start_time is None:
        return {
            "result": {
                "end_time": end_time,
                "eta": None,
                "progress": 0
            }
        }

    return {
        "result": {
            "end_time": end_time,
            "eta": "N/A",
            "progress": "N/A"
        }
    }

@app.get("/metadata_encode")
def metadata_encode(key: str):
    validate_key(key)
    flows = flow_instances[key]
    result = flows['encode_flow'].get_metadata()
    return {"result": result}

@app.post("/reset_encode")
async def reset_encode(request: Request):
    """
    Resets the state of the encoding, decoding, and search processes for a specific key.
    """
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        flows = flow_instances[key]
        
        # Preserve the currently uploaded filename
        current_filename = flows['uploaded_filename']

        # Reset all stateful flow objects for this key
        flows['encode_flow'].reset()
        flows['decode_flow'].reset()
        flows['vector_search_flow'].reset()

        # Restore the filename
        if current_filename:
            flows['encode_flow'].uploaded_filename = current_filename
            flows['uploaded_filename'] = current_filename

        return {
            "result": "ok",
            "message": f"Encode, decode, and vector search flows for key '{key}' have been reset. The uploaded file is preserved."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while resetting the flows: {str(e)}"
        )

@app.post("/encode_and_psnr")
async def encode_and_psnr(request: Request):
    """
    Encode a video file with H.264, H.265, and AV1 codecs and return PSNR compared to original.
    """
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        flows = flow_instances[key]
       
        filename = flows['uploaded_filename']
       
        if not filename:
            return {"result": "error", "message": "No video file uploaded for this key"}
       
        mappings = MAPPINGS.get_video_model_paths(filename)
        if not mappings:
            return {"result": "error", "message": f"No mapping found for filename: {filename}"}
       
        print(f"Starting multi-codec encoding for key '{key}'")
       
        # Use the enhanced process_video function with better error handling
        try:
            result = process_video(mappings["raw_path"], DATA_DIR)
        except PSNRError as e:
            return {"result": "error", "message": f"PSNR calculation failed: {str(e)}"}
        except Exception as e:
            return {"result": "error", "message": f"Video processing failed: {str(e)}"}
       
        # Helper function to get file size
        def get_file_size(file_path):
            try:
                if file_path and Path(file_path).exists():
                    return Path(file_path).stat().st_size
                return 0
            except:
                return 0
        
        # Get original file size for compression ratio calculations
        original_size = get_file_size(result["base_file_path"])
        
        # Format the response data
        response_data = {
            "original_path": result["base_file_path"],
            "output_base_path": result["output_base_path"],
            "codecs": {}
        }
        
        # Process each codec result
        for codec_name, codec_data in result["codecs"].items():
            if codec_name == "base":
                # Original file
                response_data["codecs"][codec_name] = {
                    "path": f"{codec_data['path']}?key={key}",
                    "psnr": codec_data["psnr"],
                    "file_size": original_size,
                    "compression_ratio": 1.0,  # Original is 1:1
                    "status": "original"
                }
            else:
                # Encoded files
                encoded_size = get_file_size(codec_data["path"]) if codec_data["path"] not in ["ERROR", "SKIPPED", "NO_ENCODER"] else 0
                compression_ratio = original_size / encoded_size if encoded_size > 0 else 0
                
                # Determine status
                if codec_data["path"] == "ERROR":
                    status = "error"
                elif codec_data["path"] == "SKIPPED":
                    status = "skipped"
                elif codec_data["path"] == "NO_ENCODER":
                    status = "no_encoder"
                else:
                    status = "success"
                
                response_data["codecs"][codec_name] = {
                    "path": f"{codec_data['path']}?key={key}",
                    "psnr": codec_data["psnr"],
                    "file_size": encoded_size,
                    "compression_ratio": compression_ratio,
                    "status": status
                }
        
        return {
            "result": "ok",
            "data": response_data
        }
   
    except Exception as e:
        return {"result": "error", "message": f"Unexpected error: {str(e)}"}

# ==============================================================================
# 6. DECODE & HLS STREAMING ENDPOINTS
# ==============================================================================

@app.get("/start_decode")
async def start_decode(key: str):
    try:
        validate_key(key)
        flows = flow_instances[key]
        
        if not flows['uploaded_filename'] or flows['uploaded_filename'] == "":
            return {"result": "error", "message": "No filename available for decode"}
        
        flows['decode_flow'].start_decode(flows['uploaded_filename'])
        return {"result": "ok"}

    except FlowError as e:
        return {"result": "error", "message": f"Flow error: {str(e)}"}
    except Exception as e:
        return {"result": "error", "message": f"Unexpected error: {str(e)}"}

@app.get("/poll_decode_started")
def poll_decode_started(key: str):
    validate_key(key)
    flows = flow_instances[key]
    result = flows['decode_flow'].get_start_time()
    return {"result": result}

@app.get("/poll_decode")
def poll_decode(key: str):
    validate_key(key)
    flows = flow_instances[key]
    
    result = flows['decode_flow'].get_end_time()
    return {
        "result": {
            "end_time": result,
            "eta": flows['decode_flow'].get_decode_eta_seconds(),
            "progress": flows['decode_flow'].get_decode_progress(),
        }
    }

@app.get("/metadata_decode")
def metadata_decode(key: str):
    validate_key(key)
    flows = flow_instances[key]
    result = flows['decode_flow'].get_metadata()
    return {"result": result}

@app.post("/reset_decode")
async def reset_decode(request: Request):
    """
    Resets the state of the decoding process for a specific key.
    """
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        flows = flow_instances[key]
        
        # Reset only the decode flow's internal state
        flows['decode_flow'].reset()
        flows['vector_search_flow'].reset()

        return {
            "result": "ok",
            "message": f"Decode flow for key '{key}' has been reset."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while resetting the decode flow: {str(e)}"
        )

@app.get("/hls/{video_name}/decoded/stream.m3u8")
def combined_playlist(video_name: str, key: str = None):
    """
    Combined playlist endpoint for HLS streaming.
    
    The key parameter is optional and can be provided as a query parameter.
    If no key is provided, it will look for a key that matches the video_name.
    This allows HLS players to work without knowing about our key system.
    """
    # If no key provided, try to find a key that matches the video_name
    if not key:
        # Look for a key that has this video_name as uploaded_filename
        matching_key = None
        for k, flows in flow_instances.items():
            if flows['uploaded_filename'] == video_name:
                matching_key = k
                break
        
        if not matching_key:
            raise HTTPException(
                status_code=404, 
                detail=f"No active session found for video '{video_name}'. Please ensure the video is uploaded and processing has started."
            )
        key = matching_key
    else:
        # If key is provided, validate it
        validate_key(key)
    
    streamA = DATA_DIR / video_name / "decoded" / "TreeA_output.m3u8"
    streamB = DATA_DIR / video_name / "decoded" / "TreeB_output.m3u8"

    combined_lines = []
    end_written = False
    streamA_reached_end = False

    if not streamA.exists():
        raise HTTPException(status_code=404, detail="Decoding stream have not started yet.")

    a_lines = streamA.read_text().splitlines()
    b_lines = streamB.read_text().splitlines() if streamB.exists() else []

    # Copy header and segments from streamA
    for line in a_lines:
        if line == "#EXT-X-ENDLIST":
            streamA_reached_end = True
            continue  # skip A's ENDLIST
        elif line.startswith("#EXTM3U") or line.startswith("#EXT-X"):
            combined_lines.append(line)
        elif line.endswith(".ts") or line.startswith("#EXTINF"):
            combined_lines.append(line)

    if b_lines and streamA_reached_end:
        combined_lines.append("#EXT-X-DISCONTINUITY")
        for line in b_lines:
            if line.endswith(".ts") or line.startswith("#EXTINF"):
                combined_lines.append(line)
            elif line == "#EXT-X-ENDLIST":
                combined_lines.append(line)
                end_written = True

    if not end_written and streamA_reached_end:
        combined_lines.append("#EXT-X-ENDLIST")

    return PlainTextResponse("\n".join(combined_lines), media_type="application/vnd.apple.mpegurl")

app.mount("/hls", StaticFiles(directory=DATA_DIR), name="hls")


# ==============================================================================
# 7. VECTOR SEARCH ENDPOINTS
# ==============================================================================

@app.post("/upload_vector_image")
async def upload_vector_image(request: Request, file: UploadFile = File(...)):
    """
    Upload an image to be used for vector search. Saves it to the session's data directory.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    try:
        # Get key from form data
        form_data = await request.form()
        key = form_data.get("key")
        validate_key(key)
        flows = flow_instances[key]

        # Ensure a video has been uploaded for this session to create a directory
        if not flows['uploaded_filename']:
            raise HTTPException(status_code=400, detail=f"No video uploaded for key '{key}'. Please upload a video first.")

        # Define the target directory inside DATA_DIR using the video's base name
        session_dir = DATA_DIR / flows['uploaded_filename']
        session_dir.mkdir(parents=True, exist_ok=True) # Ensure the directory exists

        # Define the final path for the image file within the session directory
        file_location = session_dir / file.filename

        # Save the file
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)

        return {
            "result": "ok", 
            "filename": file.filename, 
            "path": str(file_location), 
            "video_path": flows['uploaded_filename']
        }
    except HTTPException as e:
        # Re-raise HTTPExceptions to preserve status code and detail
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
@app.post("/start_vector_search")
async def start_vector_search(request: Request):
    """
    Start vector search with video and image paths.
    """
    try:
        body = await request.json()
        key = validate_key(body.get("key"))
        flows = flow_instances[key]
        
        flows['vector_search_flow'].reset()
        
        video_path = body.get("video_path")
        images_path = body.get("images_path")
        
        if not video_path or not images_path:
            return {"result": "error", "message": "video_path and images_path parameters are required"}
        
        flows['vector_search_flow'].start_search(video_path, images_path)
        return {"result": "ok"}
    
    except FlowError as e:
        return {"result": "error", "message": f"Flow error: {str(e)}"}
    except Exception as e:
        return {"result": "error", "message": f"Unexpected error: {str(e)}"}

@app.get("/poll_vector_search")
def poll_vector_search(key: str):
    """
    Poll the status of vector search operation.
    """
    validate_key(key)
    flows = flow_instances[key]
    
    is_finished = flows['vector_search_flow'].is_search_finished()
    return {
        "result": {
            "finished": is_finished,
            "in_progress": not is_finished
        }
    }

@app.get("/vector_search_results")
def vector_search_results(key: str):
    """
    Get vector search results.
    """
    validate_key(key)
    flows = flow_instances[key]
    
    results = flows['vector_search_flow'].get_results()
    if not results:
        return {"result": "no_results", "message": "No results available yet"}
    
    data = []
    for item in results:
        for result in item["top_results"]:
            result["timestamp"] = result["timestamp"] * (30/7)
        data.append(item)
    
    return {
        "result": "ok", 
        "data": data, 
        "metadata": flows['vector_search_flow'].get_preprocessing_info()
    }


# ==============================================================================
# 8. GENERAL UTILITY & STREAMING ENDPOINTS
# ==============================================================================

@app.get("/")
def read_root():
    return {"message": "Hello, World"}
from starlette.status import HTTP_206_PARTIAL_CONTENT

@app.get("/stream/{file_path:path}")
async def stream_video(file_path: str, key: str, request: Request):
    """
    Stream video files with byte-range support. A valid 'key' must be provided.
    """
    validate_key(key)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    file_size = os.path.getsize(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    range_header = request.headers.get("range")
    if range_header:
        # Example Range: bytes=1000-
        range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if range_match:
            start = int(range_match.group(1))
            end = range_match.group(2)
            end = int(end) if end else file_size - 1
            chunk_size = (end - start) + 1

            def range_gen(start, end):
                with open(file_path, "rb") as f:
                    f.seek(start)
                    remaining = chunk_size
                    while remaining > 0:
                        chunk = f.read(min(1024 * 1024, remaining))
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk

            return StreamingResponse(
                range_gen(start, end),
                status_code=HTTP_206_PARTIAL_CONTENT,
                media_type=mime_type,
                headers={
                    "Content-Range": f"bytes {start}-{end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(chunk_size),
                },
            )

    # No Range header - return full file
    def full_file():
        with open(file_path, "rb") as f:
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                yield chunk

    return StreamingResponse(
        full_file(),
        media_type=mime_type,
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
        },
    )