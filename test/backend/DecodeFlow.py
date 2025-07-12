from typing import Optional, Any, Dict, List
from .base_flow import BaseFlow, FlowError, validate_file_exists
from demo.backend import MAPPINGS


class DecodeFlow(BaseFlow):
    def __init__(self):
        super().__init__("DecodeFlow", timeout=600.0)  # 10 minute timeout for decode
        
        # Decode-specific state
        self.metadata: Optional[Dict[str, Any]] = None
        self.tree_batch_index = {"TreeA": 0, "TreeB": 0}
        self.total_batches: Optional[int] = None
        self._progress_log: List[Dict[str, float]] = []
        self.uploaded_filename: Optional[str] = None
        
    def start_decode(self, filename: str = ""):
        """Start the decode process for the given filename."""
        self.uploaded_filename = filename
        self.start(filename)
    def _validate_inputs(self, filename: str) -> None:
        """Validate decode inputs."""
        if not filename:
            raise FlowError("Filename is required for decode")
        
        mapping = MAPPINGS.get_video_model_paths(filename)
        if not mapping:
            raise FlowError(f"No mapping found for filename: {filename}")
        
        # Validate checkpoint exists
        validate_file_exists(mapping["model_path"], "Checkpoint file")
        validate_file_exists(mapping["raw_path"], "Raw video file")

    def _build_command(self, filename: str) -> List[str]:
        """Build the decode command."""
        mapping = MAPPINGS.get_video_model_paths(filename)
        output_dir = f"./demo/backend/data/{filename}"

        return [
            "python",
            "scripts/enhanced_multi_res_inference.py",
            "--config", "configs/enhanced_multi_res_codec.yaml",
            "--checkpoint", mapping["model_path"],
            "--video_path", mapping["raw_path"],
            "--output-dir", output_dir,
            "--hd-resolution", "1920", "1080",
            "--batch-size", "4",
            "--video-quality", "high",
            "--flow", "decode",
        ]

    def _process_log_line(self, log_obj: Dict[str, Any]) -> None:
        """Process decode-specific log lines."""
        log_type = log_obj.get("type")
        
        if log_type == "decode_start":
            with self._lock:
                self.start_time = log_obj.get("start_time")

        elif log_type == "decode":
            tree = log_obj.get("tree_name")
            batch_index = int(log_obj.get("batch_index", 0))
            total_batches = int(log_obj.get("total_batches", 0))
            timestamp = float(log_obj.get("time"))

            with self._lock:
                if tree in self.tree_batch_index:
                    self.tree_batch_index[tree] = batch_index
                self.total_batches = total_batches
                self._progress_log.append({
                    "time": timestamp,
                    "batch_sum": self.tree_batch_index["TreeA"] + self.tree_batch_index["TreeB"],
                })

        elif log_type == "decode_end":
            with self._lock:
                self.end_time = log_obj.get("end_time")
                self.metadata = log_obj.copy()

    # Backward compatibility methods
    def is_decode_started(self) -> bool:
        return self.is_started()

    def is_decode_finished(self) -> bool:
        return self.is_finished()

    def get_start_time(self) -> Optional[float]:
        with self._lock:
            return self.start_time

    def get_end_time(self) -> Optional[float]:
        with self._lock:
            return self.end_time

    def get_decode_progress(self) -> Optional[float]:
        """Calculate decode progress percentage."""
        with self._lock:
            if self.total_batches is None or self.total_batches == 0:
                return None
            completed = self.tree_batch_index["TreeA"] + self.tree_batch_index["TreeB"]
            total = 2 * self.total_batches
            percent = round((completed / total) * 100, 2)
            return 100.0 if percent >= 99.1 else percent

    def get_decode_eta_seconds(self) -> Optional[float]:
        """Calculate estimated time to completion."""
        with self._lock:
            if self.total_batches is None or self.total_batches == 0:
                return None
            if len(self._progress_log) < 2:
                return None

            first = self._progress_log[0]
            last = self._progress_log[-1]
            batch_delta = last["batch_sum"] - first["batch_sum"]
            time_delta = last["time"] - first["time"]

            if batch_delta <= 0 or time_delta <= 0:
                return None

            avg_time_per_batch = time_delta / batch_delta
            total_batches = 2 * self.total_batches
            remaining_batches = total_batches - last["batch_sum"]
            eta_seconds = remaining_batches * avg_time_per_batch
            return round(eta_seconds, 1)

    def get_metadata(self) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.metadata

    def reset(self) -> None:
        """Reset decode-specific state and call parent reset."""
        with self._lock:
            self.metadata = None
            self.tree_batch_index = {"TreeA": 0, "TreeB": 0}
            self.total_batches = None
            self._progress_log.clear()
            self.uploaded_filename = None
        
        super().reset()