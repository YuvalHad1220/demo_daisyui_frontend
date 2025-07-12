from typing import Optional, Any, Dict, List
from .base_flow import BaseFlow, FlowError, validate_file_exists
from demo.backend import MAPPINGS


class EncodeFlow(BaseFlow):
    def __init__(self):
        super().__init__("EncodeFlow", timeout=1800.0)  # 30 minute timeout for encode
        
        # Encode-specific state
        self.metadata: Optional[Dict[str, Any]] = None
        self.uploaded_filename: Optional[str] = None
        self.analysis_result: Optional[Dict[str, Any]] = None

    def start_encode(self, filename: str = ""):
        """Start the encode process for the given filename."""
        self.uploaded_filename = filename
        self.start(filename)

    def _validate_inputs(self, filename: str) -> None:
        """Validate encode inputs."""
        if not filename:
            raise FlowError("Filename is required for encode")
        
        mapping = MAPPINGS.get_video_model_paths(filename)
        if not mapping:
            raise FlowError(f"No mapping found for filename: {filename}")
        
        # Validate checkpoint and video files exist
        validate_file_exists(mapping["model_path"], "Checkpoint file")
        validate_file_exists(mapping["raw_path"], "Raw video file")

    def _build_command(self, filename: str) -> List[str]:
        """Build the encode command."""
        mapping = MAPPINGS.get_video_model_paths(filename)

        return [
            "python",
            "scripts/enhanced_multi_res_inference.py",
            "--config", "configs/enhanced_multi_res_codec.yaml",
            "--checkpoint", mapping["model_path"],
            "--video_path", mapping["raw_path"],
            "--output-dir", "./results",
            "--hd-resolution", "1920", "1080",
            "--batch-size", "4",
            "--video-quality", "high",
            "--flow", "encode",
        ]

    def _process_log_line(self, log_obj: Dict[str, Any]) -> None:
        """Process encode-specific log lines."""
        log_type = log_obj.get("type")

        if log_type == "encode_start":
            with self._lock:
                self.start_time = log_obj.get("start_time")

        elif log_type == "encode_end":
            with self._lock:
                self.end_time = log_obj.get("end_time")
                self.metadata = self._build_metadata()

    # Backward compatibility methods
    def is_encode_started(self) -> bool:
        return self.is_started()

    def is_encode_finished(self) -> bool:
        return self.is_finished()

    def get_start_time(self) -> Optional[float]:
        with self._lock:
            return self.start_time

    def get_end_time(self) -> Optional[float]:
        with self._lock:
            return self.end_time

    def get_encode_time(self) -> Optional[float]:
        """Get encode duration from metadata."""
        with self._lock:
            if self.metadata:
                return self.metadata.get("duration_s")
            return None

    def get_metadata(self) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.metadata

    def reset(self) -> None:
        """Reset encode-specific state and call parent reset."""
        with self._lock:
            self.metadata = None
            self.uploaded_filename = None
            self.analysis_result = None
        
        super().reset()

    def _build_metadata(self) -> Dict[str, Any]:
        """Build metadata from collected logs."""
        metadata = {
            "device_used": self._get_log_value("encode", "device_used"),
            "target_size": self._get_log_value("encode", "target_size"),
            "reconstruction_size": self._get_log_value(
                "encode", "target_size", key_name="reconstruction_size"
            ),
            "low_rank_approximation_psnr": self._get_log_value(
                "encode", "low_rank_approximation_psnr"
            ),
            "mask_density_actual_target": self._get_log_value(
                "encode", "mask_density_actual_target", "mask_density_actual_target"
            ),
            "start_time": self.start_time,
            "end_time": self.end_time,
        }

        encode_end = self._get_log_by_type("encode_end")
        if encode_end:
            for key in [
                "dataset_creation_time_s", "memory_usage_bytes", "video_frames",
                "valid_sequences", "duration_s", "fps", "method", "bitrate_kbps",
                "codec_output", "compression_ratio",
            ]:
                metadata[key] = encode_end.get(key)
        else:
            for key in [
                "dataset_creation_time_s", "memory_usage_bytes", "video_frames",
                "valid_sequences", "duration_s", "fps",
            ]:
                metadata[key] = None

        return metadata

    def _get_log_by_type(self, log_type: str) -> Optional[Dict[str, Any]]:
        """Find log entry by type."""
        for log in self._logs:
            if log.get("type") == log_type:
                return log
        return None

    def _get_log_value(
        self, log_type: str, key: str, key_name: Optional[str] = None
    ) -> Optional[Any]:
        """Extract value from log entry."""
        for log in self._logs:
            if log.get("type") == log_type and log.get("key") == key:
                return log.get(key_name or key)
        return None
