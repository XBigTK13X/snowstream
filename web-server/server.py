from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse
from settings import config
import routes

app = FastAPI(
    swagger_ui_parameters={"syntaxHighlight": False},
    openapi_url="/api/docs/openapi.json",
    docs_url="/api/docs/swagger",
    redoc_url="/api/docs/redoc"
)

api_router = APIRouter(prefix="/api")


@ app.get("/", response_class=RedirectResponse, include_in_schema=False)
def serve_web_app():
    return config.frontend_url


routes.register(api_router)

app.include_router(api_router)

# Default route - Serve the web_app if nothing else matched


@app.get("/{full_path:path}", response_class=RedirectResponse, include_in_schema=False)
def capture_routes(request: Request, full_path: str):
    return "/"
