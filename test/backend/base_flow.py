"""
Base flow class with common subprocess management and error handling.
This eliminates code duplication across flow classes.
"""

import subprocess
import json
import threading
import logging
import os
import time
from typing import Optional, Any, Dict, List, Callable
from abc import ABC, abstractmethod
from pathlib import Path
from contextlib import contextmanager


class FlowError(Exception):
    """Custom exception for flow-related errors."""
    pass


class ProcessTimeoutError(FlowError):
    """Exception raised when a process times out."""
    pass


class BaseFlow(ABC):
    """Base class for all flow operations with robust error handling."""
    
    def   __init__(self, name: str, timeout: Optional[float] = None):
        self.name = name
        self.timeout = timeout or 300.0  # 5 minute default timeout
        
        # State management
        self._logs: List[Dict[str, Any]] = []
        self._thread: Optional[threading.Thread] = None
        self._started = False
        self._finished = False
        self._lock = threading.RLock()  # Use RLock to prevent deadlocks
        self._process: Optional[subprocess.Popen] = None
        self._error: Optional[Exception] = None
        
        # Timing
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        
        # Setup logging
        self.logger = logging.getLogger(f"{self.__class__.__name__}")
        
    @abstractmethod
    def _build_command(self, *args, **kwargs) -> List[str]:
        """Build the command to execute. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def _process_log_line(self, log_obj: Dict[str, Any]) -> None:
        """Process a parsed JSON log line. Must be implemented by subclasses."""
        pass
    
    def _validate_inputs(self, *args, **kwargs) -> None:
        """Validate inputs before starting. Override in subclasses if needed."""
        pass
    
    def start(self, *args, **kwargs) -> None:
        """Start the flow operation."""
        with self._lock:
            if self._started and not self._finished:
                raise FlowError(f"{self.name} already started and running")
            
            if self._finished and not self._error:
                self.logger.info(f"{self.name} already completed successfully")
                return
            
            # Validate inputs
            try:
                self._validate_inputs(*args, **kwargs)
            except Exception as e:
                raise FlowError(f"Input validation failed: {e}")
            
            # Reset state for new run
            self._reset_state()
            
            # Start the thread
            self._thread = threading.Thread(
                target=self._run_with_error_handling,
                args=args,
                kwargs=kwargs,
                daemon=True
            )
            self._started = True
            self._thread.start()
    
    def _reset_state(self) -> None:
        """Reset internal state for a new run."""
        self._logs.clear()
        self._finished = False
        self._error = None
        self.start_time = None
        self.end_time = None
    
    def _run_with_error_handling(self, *args, **kwargs) -> None:
        """Wrapper that handles all errors during execution."""
        try:
            self._run_flow(*args, **kwargs)
        except Exception as e:
            with self._lock:
                self._error = e
                self._finished = True
            self.logger.error(f"{self.name} failed: {e}")
    
    def _run_flow(self, *args, **kwargs) -> None:
        """Main execution logic with robust error handling."""
        try:
            # Build command
            cmd = self._build_command(*args, **kwargs)
            self.logger.info(f"Starting {self.name} with command: {' '.join(cmd)}")
            
            # Start process with timeout
            with self._create_process(cmd) as process:
                self._process = process
                self.start_time = time.time()
                
                collected_logs = []
                
                # Process output with timeout
                for line in self._read_output_with_timeout(process):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        log_obj = json.loads(line)
                        if isinstance(log_obj, dict):
                            collected_logs.append(log_obj)
                            self._process_log_line(log_obj)
                            self.logger.debug(f"Processed log: {log_obj.get('type', 'unknown')}")
                    except json.JSONDecodeError:
                        # Log non-JSON output for debugging
                        self.logger.debug(f"Non-JSON output: {line}")
                        continue
                
                # Wait for process completion
                return_code = process.wait()
                if return_code != 0:
                    raise FlowError(f"Process exited with code {return_code}")
                
        except Exception as e:
            raise FlowError(f"{self.name} execution failed: {e}")
        finally:
            with self._lock:
                self._logs = collected_logs
                self.end_time = time.time()
                self._finished = True
                self._process = None
    
    @contextmanager
    def _create_process(self, cmd: List[str]):
        """Create and manage subprocess with proper cleanup."""
        process = None
        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=False,
                env=self._get_environment()
            )
            yield process
        except Exception as e:
            self.logger.error(f"Failed to create process: {e}")
            raise
        finally:
            if process:
                self._cleanup_process(process)
    
    def _get_environment(self) -> Dict[str, str]:
        """Get environment variables for the subprocess."""
        env = os.environ.copy()
        # Add any common environment variables here
        return env
    
    def _read_output_with_timeout(self, process: subprocess.Popen):
        """Read process output with timeout handling."""
        start_time = time.time()
        
        while True:
            # Check timeout
            if time.time() - start_time > self.timeout:
                raise ProcessTimeoutError(f"{self.name} timed out after {self.timeout} seconds")
            
            # Check if process is still running
            if process.poll() is not None:
                # Process finished, read remaining output
                for line in process.stdout:
                    yield line
                break
            
            # Try to read a line with a short timeout
            try:
                line = process.stdout.readline()
                if line:
                    yield line
                else:
                    time.sleep(0.1)  # Brief pause if no output
            except Exception as e:
                self.logger.warning(f"Error reading output: {e}")
                break
    
    def _cleanup_process(self, process: subprocess.Popen) -> None:
        """Safely cleanup a subprocess."""
        if not process:
            return
        
        try:
            if process.poll() is None:  # Process still running
                self.logger.info(f"Terminating {self.name} process...")
                process.terminate()
                
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.logger.warning(f"Force killing {self.name} process...")
                    process.kill()
                    process.wait()
        except Exception as e:
            self.logger.error(f"Error cleaning up process: {e}")
        finally:
            if hasattr(process, 'stdout') and process.stdout:
                try:
                    process.stdout.close()
                except Exception:
                    pass
    
    def reset(self) -> None:
        """Reset the flow to initial state."""
        with self._lock:
            # Cleanup running process
            if self._process:
                self._cleanup_process(self._process)
            
            # Reset all state
            self._process = None
            self._started = False
            self._finished = False
            self._error = None
            self._logs.clear()
            self.start_time = None
            self.end_time = None
            self._thread = None
            
            self.logger.info(f"{self.name} reset completed")
    
    # Status methods
    def is_started(self) -> bool:
        """Check if the flow has been started."""
        with self._lock:
            return self._started
    
    def is_finished(self) -> bool:
        """Check if the flow has finished (successfully or with error)."""
        with self._lock:
            return self._finished
    
    def is_running(self) -> bool:
        """Check if the flow is currently running."""
        with self._lock:
            return self._started and not self._finished
    
    def has_error(self) -> bool:
        """Check if the flow finished with an error."""
        with self._lock:
            return self._error is not None
    
    def get_error(self) -> Optional[Exception]:
        """Get the error if one occurred."""
        with self._lock:
            return self._error
    
    def get_logs(self) -> List[Dict[str, Any]]:
        """Get all collected logs."""
        with self._lock:
            return list(self._logs)
    
    def get_duration(self) -> Optional[float]:
        """Get the execution duration in seconds."""
        with self._lock:
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return None
    
    def wait_for_completion(self, timeout: Optional[float] = None) -> bool:
        """Wait for the flow to complete."""
        if not self._thread:
            return True
        
        self._thread.join(timeout)
        return not self._thread.is_alive()


def validate_file_exists(file_path: str, description: str = "File") -> Path:
    """Utility function to validate file existence."""
    path = Path(file_path)
    if not path.exists():
        raise FlowError(f"{description} not found: {file_path}")
    if not path.is_file():
        raise FlowError(f"{description} is not a file: {file_path}")
    return path


def validate_directory_exists(dir_path: str, create: bool = False) -> Path:
    """Utility function to validate directory existence."""
    path = Path(dir_path)
    if not path.exists():
        if create:
            path.mkdir(parents=True, exist_ok=True)
        else:
            raise FlowError(f"Directory not found: {dir_path}")
    elif not path.is_dir():
        raise FlowError(f"Path is not a directory: {dir_path}")
    return path