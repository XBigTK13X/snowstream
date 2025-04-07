import threading
import subprocess
import sys
from log import log
import os
from passlib.context import CryptContext


def run_cli(command, raw_output=False, background=False, log_path=None):
    stdout_target = subprocess.PIPE
    stderr_target = subprocess.PIPE
    if log_path:
        stdout_target = open(log_path+'.stdout', 'w')
        stdout_target.write(command)
        stderr_target = open(log_path+'.stderr', 'w')
        stderr_target.write(command)
    if background:
        return subprocess.Popen(
            command,
            shell=True,
            stdout=stdout_target,
            stderr=stderr_target,
            executable="/bin/bash",
        )
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=stdout_target,
        stderr=stderr_target,
        executable="/bin/bash",
    )
    stdout, stderr = process.communicate()
    result = process.returncode    
    if result != 0:
        log.error(f"An error occurred while running [{command}]")
        log.error(f"stdout: [{stdout}]")
        log.error(f"stderr: [{stderr}]")
        sys.exit(1)
    if raw_output:
        return {
        "result": result,
        "stdout": stdout.decode("utf-8"),
        "stderr": stderr.decode("utf-8"),
    }
    return {
        "result": result,
        "stdout": stdout.decode("utf-8").split("\n"),
        "stderr": stderr.decode("utf-8").split("\n"),
    }


# Taken from https://github.com/salesforce/decorator-operations/blob/master/decoratorOperations/debounce_functions/debounce.py#L6


def debounce(wait_seconds):

    def decorator(function):
        def debounced(*args, **kwargs):
            def call_function():
                debounced._timer = None
                return function(*args, **kwargs)

            if debounced._timer is not None:
                debounced._timer.cancel()

            debounced._timer = threading.Timer(wait_seconds, call_function)
            debounced._timer.start()

        debounced._timer = None
        return debounced

    return decorator

#https://github.com/pyca/bcrypt/issues/684
import bcrypt
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)
