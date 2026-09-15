"""
CampusFind AI - text similarity microservice.

Scores how similar a lost-item report and a found-item report are, using
TF-IDF + cosine similarity over a combined text field (description +
category/brand/color). Called by the Node backend's match routes; if this
service is down, Node falls back to a local stub scorer instead of failing.

Image similarity (Parthvi's half) is not implemented here.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="CampusFind AI - Text Similarity Service")


class ItemFields(BaseModel):
    category: str | None = None
    brand: str | None = None
    color: str | None = None
    description: str | None = None


class SimilarityRequest(BaseModel):
    lost: ItemFields
    found: ItemFields


class SimilarityResponse(BaseModel):
    score: float


def build_text(item: ItemFields) -> str:
    parts = [item.category, item.brand, item.color, item.description]
    return " ".join(p for p in parts if p).strip()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/similarity", response_model=SimilarityResponse)
def similarity(payload: SimilarityRequest):
    lost_text = build_text(payload.lost)
    found_text = build_text(payload.found)

    if not lost_text or not found_text:
        return SimilarityResponse(score=0.0)

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([lost_text, found_text])
    score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    return SimilarityResponse(score=round(float(score), 2))
