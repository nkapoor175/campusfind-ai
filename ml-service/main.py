from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CampusFind AI – Image Similarity Service",
    description="ML microservice for lost-and-found image matching",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS – allow the Node backend to call this service
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health-check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "CampusFind AI ML service is running",
    }
