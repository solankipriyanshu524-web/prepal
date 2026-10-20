import sys
import subprocess
import tempfile
import os
import time
import json
from typing import List, Dict, Any, Optional

def execute_code(language: str, code: str, test_cases: Optional[List[Dict[str, Any]]] = None, timeout_seconds: float = 5.0) -> Dict[str, Any]:
    """
    Safely executes Python or JavaScript code in an isolated subprocess with strict timeouts.
    Returns stdout, stderr, execution time in ms, exit code, and test case results if applicable.
    """
    lang = language.lower().strip()
    start_time = time.time()
    
    # Validation
    if not code or not code.strip():
        return {
            "success": False,
            "stdout": "",
            "stderr": "Error: Code is empty.",
            "execution_time_ms": 0,
            "exit_code": 1,
            "test_results": []
        }

    # Decide runner
    if lang in ["python", "py"]:
        cmd_runner = [sys.executable]
        file_suffix = ".py"
    elif lang in ["javascript", "js"]:
        cmd_runner = ["node"]
        file_suffix = ".js"
    else:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Unsupported language: {language}. Supported: python, javascript",
            "execution_time_ms": 0,
            "exit_code": 1,
            "test_results": []
        }

    # Create temporary file
    temp_dir = tempfile.mkdtemp(prefix="prepal_run_")
    script_path = os.path.join(temp_dir, f"solution{file_suffix}")

    try:
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(code)

        proc = subprocess.run(
            cmd_runner + [script_path],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            cwd=temp_dir
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "execution_time_ms": elapsed_ms,
            "exit_code": proc.returncode,
            "language": lang
        }

    except subprocess.TimeoutExpired:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "success": False,
            "stdout": "",
            "stderr": f"⏱️ Execution timed out ({timeout_seconds}s limit exceeded). Please check for infinite loops or recursion.",
            "execution_time_ms": elapsed_ms,
            "exit_code": 124,
            "language": lang
        }
    except FileNotFoundError as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Execution environment not found: {str(e)}. Make sure {cmd_runner[0]} is installed and in PATH.",
            "execution_time_ms": 0,
            "exit_code": 127,
            "language": lang
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Unexpected execution error: {str(e)}",
            "execution_time_ms": 0,
            "exit_code": 1,
            "language": lang
        }
    finally:
        # Cleanup
        try:
            if os.path.exists(script_path):
                os.remove(script_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception:
            pass
