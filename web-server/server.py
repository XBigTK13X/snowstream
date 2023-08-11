from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse

app = FastAPI()

api_router = APIRouter(prefix="/api")

# TODO - For dev, use the web client watch server
#        For prod, deploy a static bundle
@app.get("/", response_class=RedirectResponse)
def serve_web_app():
    return "http://localhost:3000"

@api_router.get("/config")
def get_config():
    return {'config': 'this is it'}

app.include_router(api_router)

# Default route - Serve the web_app if nothing else matched
@app.get("/{full_path:path}", response_class=RedirectResponse)
def capture_routes(request: Request, full_path: str):
    return "/"

