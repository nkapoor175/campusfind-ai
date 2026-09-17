import io
import math
import numpy as np
from PIL import Image, ImageOps

class ImageFeatureExtractor:
    """
    Feature extractor for lost & found item images.
    Uses PyTorch pre-trained model (ResNet18 / MobileNetV3) if available,
    or falls back to an optimized spatial color & texture grid embedding (PIL + NumPy).
    """

    def __init__(self):
        self.use_torch = False
        self.model = None
        self.transform = None

        try:
            import torch
            import torchvision.models as models
            import torchvision.transforms as transforms

            # Load lightweight MobileNetV3 Small for fast, accurate feature extraction
            base_model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
            # Remove classification head, keep feature backbone + avgpool
            base_model.classifier = torch.nn.Identity()
            base_model.eval()

            self.model = base_model
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            self.use_torch = True
            print("Successfully loaded PyTorch MobileNetV3 feature extractor.")
        except Exception as e:
            print(f"PyTorch not available or model loading deferred ({e}). Using NumPy + PIL feature extractor.")
            self.use_torch = False

    def load_image_from_bytes(self, image_bytes: bytes) -> Image.Image:
        """Decode raw image bytes into PIL Image (RGB)"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image)
            return image.convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid or corrupt image data: {str(e)}")

    def extract_features(self, image: Image.Image) -> list[float]:
        """
        Extract a normalized feature vector from a PIL Image.
        Returns a list of float values.
        """
        if self.use_torch and self.model is not None:
            import torch
            with torch.no_grad():
                tensor = self.transform(image).unsqueeze(0)
                embedding = self.model(tensor).squeeze(0).numpy()
                # Normalize vector to unit length
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                return embedding.tolist()
        else:
            # Fallback: Spatial 8x8 RGB grid + HSV histogram + edge intensity
            resized = image.resize((64, 64))
            arr = np.array(resized, dtype=np.float32) / 255.0

            # 1. Spatial RGB Grid Features (64 * 64 * 3 = 12288 -> pooled to 8x8x3 = 192 features)
            grid = resized.resize((8, 8), Image.Resampling.BILINEAR)
            grid_feat = np.array(grid, dtype=np.float32).flatten() / 255.0

            # 2. HSV Color Histogram (32 bins for H, 16 for S, 16 for V = 64 features)
            hsv_image = image.convert("HSV")
            hsv_arr = np.array(hsv_image)
            h_hist, _ = np.histogram(hsv_arr[:, :, 0], bins=32, range=(0, 256), density=True)
            s_hist, _ = np.histogram(hsv_arr[:, :, 1], bins=16, range=(0, 256), density=True)
            v_hist, _ = np.histogram(hsv_arr[:, :, 2], bins=16, range=(0, 256), density=True)
            hist_feat = np.concatenate([h_hist, s_hist, v_hist])

            # Combine features into final embedding vector
            feature_vector = np.concatenate([grid_feat, hist_feat])
            norm = np.linalg.norm(feature_vector)
            if norm > 0:
                feature_vector = feature_vector / norm

            return feature_vector.tolist()

    @staticmethod
    def calculate_similarity(vec1: list[float], vec2: list[float]) -> float:
        """
        Calculate cosine similarity between two feature vectors.
        Returns percentage score (0.0 to 100.0).
        """
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)

        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        cosine_sim = np.dot(v1, v2) / (norm1 * norm2)
        # Clip to valid cosine range [-1.0, 1.0] to handle floating-point precision
        cosine_sim = max(-1.0, min(1.0, float(cosine_sim)))

        # Convert cosine similarity (-1.0 to 1.0 or 0.0 to 1.0) to percentage (0% to 100%)
        # For non-negative feature vectors, cosine sim is in [0, 1]
        percentage = max(0.0, cosine_sim) * 100.0
        return round(percentage, 2)


# Singleton instance
feature_extractor = ImageFeatureExtractor()
