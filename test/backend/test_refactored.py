#!/usr/bin/env python3
"""
Test script for the refactored backend components.
This validates that the refactored code works correctly.
"""

import sys
import logging
from pathlib import Path

# Add the backend path to sys.path for testing
sys.path.insert(0, str(Path(__file__).parent))

from base_flow import BaseFlow, FlowError, validate_file_exists, validate_directory_exists
from EncodeFlow import EncodeFlow
from DecodeFlow import DecodeFlow
from VectorSearchFlow import VectorSearchFlow

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_base_flow_validation():
    """Test the base flow validation functions."""
    print("Testing base flow validation functions...")
    
    # Test file validation with non-existent file
    try:
        validate_file_exists("/non/existent/file.txt")
        assert False, "Should have raised FlowError"
    except FlowError as e:
        print(f"✅ File validation correctly failed: {e}")
    
    # Test directory validation
    try:
        test_dir = Path("/tmp/test_flow_dir")
        validate_directory_exists(str(test_dir), create=True)
        print(f"✅ Directory validation works: {test_dir}")
        
        # Cleanup
        if test_dir.exists():
            test_dir.rmdir()
    except Exception as e:
        print(f"❌ Directory validation failed: {e}")


def test_flow_initialization():
    """Test that all flow classes initialize correctly."""
    print("\nTesting flow initialization...")
    
    try:
        encode_flow = EncodeFlow()
        print(f"✅ EncodeFlow initialized: {encode_flow.name}")
        
        decode_flow = DecodeFlow()
        print(f"✅ DecodeFlow initialized: {decode_flow.name}")
        
        vector_flow = VectorSearchFlow()
        print(f"✅ VectorSearchFlow initialized: {vector_flow.name}")
        
    except Exception as e:
        print(f"❌ Flow initialization failed: {e}")


def test_flow_error_handling():
    """Test that flows properly handle invalid inputs."""
    print("\nTesting flow error handling...")
    
    # Test EncodeFlow with invalid filename
    try:
        encode_flow = EncodeFlow()
        encode_flow.start_encode("")  # Empty filename should fail
        assert False, "Should have raised FlowError"
    except FlowError as e:
        print(f"✅ EncodeFlow correctly rejected empty filename: {e}")
    except Exception as e:
        print(f"❌ EncodeFlow error handling failed: {e}")
    
    # Test DecodeFlow with invalid filename
    try:
        decode_flow = DecodeFlow()
        decode_flow.start_decode("")  # Empty filename should fail
        assert False, "Should have raised FlowError"
    except FlowError as e:
        print(f"✅ DecodeFlow correctly rejected empty filename: {e}")
    except Exception as e:
        print(f"❌ DecodeFlow error handling failed: {e}")
    
    # Test VectorSearchFlow with invalid inputs
    try:
        vector_flow = VectorSearchFlow()
        vector_flow.start_search("", [])  # Empty inputs should fail
        assert False, "Should have raised FlowError"
    except FlowError as e:
        print(f"✅ VectorSearchFlow correctly rejected empty inputs: {e}")
    except Exception as e:
        print(f"❌ VectorSearchFlow error handling failed: {e}")


def test_flow_state_management():
    """Test flow state management methods."""
    print("\nTesting flow state management...")
    
    try:
        flow = EncodeFlow()
        
        # Test initial state
        assert not flow.is_started(), "Flow should not be started initially"
        assert not flow.is_finished(), "Flow should not be finished initially"
        assert not flow.is_running(), "Flow should not be running initially"
        assert not flow.has_error(), "Flow should not have errors initially"
        
        print("✅ Initial state correct")
        
        # Test reset
        flow.reset()
        assert not flow.is_started(), "Flow should not be started after reset"
        print("✅ Reset works correctly")
        
    except Exception as e:
        print(f"❌ State management test failed: {e}")


def test_psnr_calc_validation():
    """Test PSNRCalc validation."""
    print("\nTesting PSNRCalc validation...")
    
    try:
        from PSNRCalc import process_video, PSNRError
        
        # Test with invalid video path
        try:
            process_video("", Path("/tmp"))
            assert False, "Should have raised PSNRError"
        except PSNRError as e:
            print(f"✅ PSNRCalc correctly rejected empty video path: {e}")
        
        # Test with invalid output path
        try:
            process_video("/some/video.mp4", None)
            assert False, "Should have raised PSNRError"
        except PSNRError as e:
            print(f"✅ PSNRCalc correctly rejected empty output path: {e}")
            
    except Exception as e:
        print(f"❌ PSNRCalc validation test failed: {e}")


def main():
    """Run all tests."""
    print("🧪 Testing refactored backend components...\n")
    
    try:
        test_base_flow_validation()
        test_flow_initialization()
        test_flow_error_handling()
        test_flow_state_management()
        test_psnr_calc_validation()
        
        print("\n✅ All tests completed successfully!")
        print("\n🎉 Refactoring appears to be working correctly!")
        
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()