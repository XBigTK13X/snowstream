from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse
import routes

app = FastAPI()

api_router = APIRouter(prefix="/api")

# TODO - For dev, use the web client watch server
#        For prod, deploy a static bundle
@app.get("/", response_class=RedirectResponse, include_in_schema=False)
def serve_web_app():
    return "http://localhost:3000"

routes.register(api_router)

app.include_router(api_router)

# Default route - Serve the web_app if nothing else matched
@app.get("/{full_path:path}", response_class=RedirectResponse, include_in_schema=False)
def capture_routes(request: Request, full_path: str):
    return "/"

