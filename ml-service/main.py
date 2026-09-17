import urllib.request
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from feature_extractor import feature_extractor

app = FastAPI(
    title="CampusFind AI – Image Similarity Service",
    description="ML microservice for lost-and-found image feature extraction and cosine similarity scoring",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema for image URL comparison
class ImageUrlCompareRequest(BaseModel):
    image1_url: str
    image2_url: str

# ---------------------------------------------------------------------------
# Health-Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "image-similarity-service",
        "version": "1.0.0",
        "engine": "PyTorch MobileNetV3" if feature_extractor.use_torch else "NumPy/PIL Feature Extractor",
    }

# ---------------------------------------------------------------------------
# Image Comparison Endpoint (Multipart Form Upload)
# ---------------------------------------------------------------------------
@app.post("/compare-images")
async def compare_images(
    image1: UploadFile = File(..., description="First image file (Lost item)"),
    image2: UploadFile = File(..., description="Second image file (Found item)"),
):
    """
    Compare two image files uploaded via multipart/form-data.
    Returns cosine similarity score (0.0 to 100.0) and match confidence level.
    """
    try:
        content1 = await image1.read()
        content2 = await image2.read()

        if not content1 or len(content1) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image1 file is empty",
            )
        if not content2 or len(content2) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image2 file is empty",
            )

        img1 = feature_extractor.load_image_from_bytes(content1)
        img2 = feature_extractor.load_image_from_bytes(content2)

        vec1 = feature_extractor.extract_features(img1)
        vec2 = feature_extractor.extract_features(img2)

        score = feature_extractor.calculate_similarity(vec1, vec2)

        confidence = "High" if score >= 75.0 else ("Medium" if score >= 50.0 else "Low")

        return {
            "similarityScore": score,
            "confidence": confidence,
            "image1_filename": image1.filename,
            "image2_filename": image2.filename,
            "featureVectorDim": len(vec1),
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comparing images: {str(err)}",
        )

# ---------------------------------------------------------------------------
# Image Comparison Endpoint (URL Inputs)
# ---------------------------------------------------------------------------
@app.post("/compare-image-urls")
async def compare_image_urls(payload: ImageUrlCompareRequest):
    """
    Compare two images fetched from URLs.
    Returns cosine similarity score (0.0 to 100.0).
    """
    try:
        req_headers = {"User-Agent": "CampusFind-AI-Image-Service/1.0"}

        req1 = urllib.request.Request(payload.image1_url, headers=req_headers)
        with urllib.request.urlopen(req1, timeout=10) as resp1:
            bytes1 = resp1.read()

        req2 = urllib.request.Request(payload.image2_url, headers=req_headers)
        with urllib.request.urlopen(req2, timeout=10) as resp2:
            bytes2 = resp2.read()

        img1 = feature_extractor.load_image_from_bytes(bytes1)
        img2 = feature_extractor.load_image_from_bytes(bytes2)

        vec1 = feature_extractor.extract_features(img1)
        vec2 = feature_extractor.extract_features(img2)

        score = feature_extractor.calculate_similarity(vec1, vec2)
        confidence = "High" if score >= 75.0 else ("Medium" if score >= 50.0 else "Low")

        return {
            "similarityScore": score,
            "confidence": confidence,
            "image1_url": payload.image1_url,
            "image2_url": payload.image2_url,
            "featureVectorDim": len(vec1),
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch or process images from URLs: {str(err)}",
        )

# ---------------------------------------------------------------------------
# Extract Features Endpoint
# ---------------------------------------------------------------------------
@app.post("/extract-features")
async def extract_features(
    image: UploadFile = File(..., description="Image file to extract features from"),
):
    """
    Extract normalized feature vector for a single image.
    """
    try:
        content = await image.read()
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file is empty",
            )

        img = feature_extractor.load_image_from_bytes(content)
        feature_vector = feature_extractor.extract_features(img)

        return {
            "filename": image.filename,
            "dimensions": len(feature_vector),
            "featureVector": feature_vector[:10],  # Truncated preview of first 10 dims
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting features: {str(err)}",
        )
