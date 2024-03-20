from log import log
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from settings import config
import routes

import os
import auth

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
                with open(file_path, "r") as read_pointer:
                    js_content = read_pointer.read()
                js_content = js_content.replace(
                    "SNOWSTREAM_WEB_API_URL", f'"{config.web_api_url}"'
                )
                with open(file_path, "w") as write_pointer:
                    write_pointer.write(js_content)

app = FastAPI(
    title="snowstream",
    version="1.0.3",
    swagger_ui_parameters={"syntaxHighlight": False, "operationsSorter": "alpha"},
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

api_router = APIRouter(prefix="/api")

# TODO Could probably use a static route and get rid of nginx now that transcoding is handled via the API

if not os.environ.get("SNOWSTREAM_WEB_API_URL"):

    @app.get("/", response_class=RedirectResponse, include_in_schema=False)
    def serve_web_app():
        return config.frontend_url


auth.register(router=api_router)
routes.register(router=api_router)

app.include_router(api_router)

# Default route - Serve the web_app if nothing else matched


@app.get("/{full_path:path}", response_class=RedirectResponse, include_in_schema=False)
def capture_routes(request: Request, full_path: str):
    return "/"
