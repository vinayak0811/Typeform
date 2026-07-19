from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.api import auth, forms, questions, public, responses, analytics

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-style REST API for a Typeform clone (Phase 1 + Phase 2).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(responses.router)
app.include_router(analytics.router)
app.include_router(public.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Validation failed", "errors": exc.errors()},
    )


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
