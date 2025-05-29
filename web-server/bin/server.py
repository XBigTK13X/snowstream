import os
from log import log
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

import auth
import routes
from settings import config
from transcode import transcode

transcode.register_cleanup()

# This should only happen inside a deployed docker container
if os.environ.get("SNOWSTREAM_WEB_API_URL"):
    frontend_content = ""
    log.info(
        f"Token swapping web api url [{config.web_api_url}] into the frontend static resources"
    )
    for root, dirs, files in os.walk("/app/prod-frontend"):
        for f in files:
            if f.endswith(".js"):
                file_path = os.path.join(root, f)
                log.info(f"Found frontend file to token swap [{file_path}]")
                js_content = ""
                with open(file_path, "r") as read_handle:
                    js_content = read_handle.read()
                js_content = js_content.replace(
                    "SNOWSTREAM_WEB_API_URL", f'"{config.web_api_url}"'
                )
                with open(file_path, "w") as write_handle:
                    write_handle.write(js_content)

app = FastAPI(
    title="snowstream",
    version=f"{config.server_version}",
    swagger_ui_parameters={
        "syntaxHighlight": False,
        "operationsSorter": "alpha",
        "apisSorter": 'alpha',
        "tryItOutEnabled": True
    },
    openapi_url="/api/docs/openapi.json",
    docs_url="/api/docs/swagger",
    redoc_url="/api/docs/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Taken from https://github.com/fastapi/fastapi/issues/3361#issuecomment-1168303468
# Gives developer friendly info when a bad request comes from the client
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    log.error(f"{request}: {exc_str}")
    content = {'status_code': 10422, 'message': exc_str, 'data': None}
    return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

api_router = APIRouter(prefix="/api")

if not os.environ.get("SNOWSTREAM_WEB_API_URL"):
    @app.get("/", response_class=RedirectResponse, include_in_schema=False)
    def serve_web_app():
        return config.frontend_url


auth.register(router=api_router)
routes.register(router=api_router)

app.include_router(api_router)
