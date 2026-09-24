import io
import unittest
from PIL import Image, ImageDraw
from feature_extractor import ImageFeatureExtractor
from fastapi.testclient import TestClient
from main import app

class TestImageSimilarityService(unittest.TestCase):

    def setUp(self):
        self.extractor = ImageFeatureExtractor()
        self.client = TestClient(app)

        # Create synthetic test images
        # Image A: Blue square on white background
        img1 = Image.new("RGB", (200, 200), color="white")
        draw1 = ImageDraw.Draw(img1)
        draw1.rectangle([50, 50, 150, 150], fill="blue")
        buf1 = io.BytesIO()
        img1.save(buf1, format="PNG")
        self.img1_bytes = buf1.getvalue()
        self.img1 = img1

        # Image B: Identical to Image A (Blue square)
        img2 = Image.new("RGB", (200, 200), color="white")
        draw2 = ImageDraw.Draw(img2)
        draw2.rectangle([50, 50, 150, 150], fill="blue")
        buf2 = io.BytesIO()
        img2.save(buf2, format="PNG")
        self.img2_bytes = buf2.getvalue()

        # Image C: Red circle on black background (Completely different)
        img3 = Image.new("RGB", (200, 200), color="black")
        draw3 = ImageDraw.Draw(img3)
        draw3.ellipse([40, 40, 160, 160], fill="red")
        buf3 = io.BytesIO()
        img3.save(buf3, format="PNG")
        self.img3_bytes = buf3.getvalue()

    def test_feature_vector_dimension_and_norm(self):
        vec = self.extractor.extract_features(self.img1)
        self.assertIsInstance(vec, list)
        self.assertGreater(len(vec), 0)

    def test_identical_image_similarity(self):
        vec1 = self.extractor.extract_features(self.img1)
        score = self.extractor.calculate_similarity(vec1, vec1)
        self.assertAlmostEqual(score, 100.0, delta=0.5)

    def test_different_image_similarity(self):
        img_diff = self.extractor.load_image_from_bytes(self.img3_bytes)
        vec1 = self.extractor.extract_features(self.img1)
        vec3 = self.extractor.extract_features(img_diff)
        score = self.extractor.calculate_similarity(vec1, vec3)
        self.assertLess(score, 70.0)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data["status"], "ok")
        self.assertIn("service", json_data)

    def test_compare_images_endpoint(self):
        files = {
            "image1": ("laptop1.png", self.img1_bytes, "image/png"),
            "image2": ("laptop2.png", self.img2_bytes, "image/png"),
        }
        response = self.client.post("/compare-images", files=files)
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertIn("similarityScore", json_data)
        self.assertIn("confidence", json_data)
        self.assertGreaterEqual(json_data["similarityScore"], 95.0)

    def test_invalid_image_upload_handling(self):
        files = {
            "image1": ("corrupt.png", b"not an image data string", "image/png"),
            "image2": ("laptop2.png", self.img2_bytes, "image/png"),
        }
        response = self.client.post("/compare-images", files=files)
        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

if __name__ == "__main__":
    unittest.main()
