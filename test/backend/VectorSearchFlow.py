from typing import Optional, Any, Dict, List
from .base_flow import BaseFlow, FlowError, validate_file_exists
from demo.backend import MAPPINGS


class VectorSearchFlow(BaseFlow):
    def __init__(self):
        super().__init__("VectorSearchFlow", timeout=900.0)  # 15 minute timeout
        
        # Vector search specific state
        self.video_src: Optional[str] = None
        self.img_srcs: Optional[List[str]] = None
        self.results: List[Dict[str, Any]] = []
        self.video_id: Optional[str] = None
        self.preprocessing_duration: Optional[float] = None
        self.processed_frames: Optional[int] = None
        self.resolution: Optional[str] = None

    def start_search(self, video_src: str, img_srcs: List[str]):
        """Start the vector search process."""
        self.video_src = video_src
        self.img_srcs = img_srcs
        self.start(video_src, img_srcs)

    def _validate_inputs(self, video_src: str, img_srcs: List[str]) -> None:
        """Validate vector search inputs."""
        if not video_src:
            raise FlowError("Video source is required")
        
        if not img_srcs or not isinstance(img_srcs, list):
            raise FlowError("Image sources list is required")
        
        # Validate video mapping exists
        mapping = MAPPINGS.get_video_model_paths(video_src)
        if not mapping:
            raise FlowError(f"No mapping found for video: {video_src}")
        
        # Validate video file exists
        validate_file_exists(mapping["raw_path"], "Video file")
        
        # Validate image files exist
        for img_src in img_srcs:
            validate_file_exists(img_src, "Image file")

    def _build_command(self, video_src: str, img_srcs: List[str]) -> List[str]:
        """Build the vector search command."""
        mapping = MAPPINGS.get_video_model_paths(video_src)
        src = mapping["raw_path"]
        
        return [
            "python",
            "integration_example.py",
            "video",
            src,
        ] + img_srcs

    def _process_log_line(self, log_obj: Dict[str, Any]) -> None:
        """Process vector search specific log lines."""
        log_type = log_obj.get("type")

        if log_type == "vector_search_preprocessing":
            with self._lock:
                self.video_id = log_obj.get("video_id")
                self.preprocessing_duration = log_obj.get("duration_seconds")
                self.processed_frames = log_obj.get("processed_frames")
                self.resolution = log_obj.get("resolution")

        elif log_type == "vector_search_ended":
            with self._lock:
                self.results.append(log_obj)

    # Backward compatibility methods
    def is_search_started(self) -> bool:
        return self.is_started()

    def is_search_finished(self) -> bool:
        return self.is_finished()

    def get_results(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self.results)

    def get_preprocessing_info(self) -> Dict[str, Any]:
        """Get preprocessing information."""
        with self._lock:
            return {
                "video_id": self.video_id,
                "duration_seconds": self.preprocessing_duration,
                "processed_frames": self.processed_frames,
                "resolution": self.resolution,
            }

    def reset(self) -> None:
        """Reset vector search specific state and call parent reset."""
        with self._lock:
            self.results.clear()
            self.video_src = None
            self.img_srcs = None
            self.video_id = None
            self.preprocessing_duration = None
            self.processed_frames = None
            self.resolution = None
        
        super().reset()