import subprocess
import sys
from log import log


def run_cli(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, executable="/bin/bash")
    stdout, stderr = process.communicate()
    result = process.returncode
    if result != 0:
        log.error(f"An error occurred while running [{command}]")
        log.error(f"stdout: [{stdout}]")
        log.error(f"stderr: [{stderr}]")
        sys.exit(1)
    return {
        "result": result,
        "stdout": stdout.decode('utf-8').split('\n'),
        "stderr": stderr.decode('utf-8').split('\n')
    }
