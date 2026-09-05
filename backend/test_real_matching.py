import os
from pathlib import Path

from face.encoder import FaceEncoder
from matching.matcher import FaceMatcher


ROOT = Path(__file__).resolve().parent
CANDIDATE_DIR = ROOT / "uploads" / "candidates"


def test_real_matching_handles_available_candidate_images():
    if not CANDIDATE_DIR.exists():
        return

    candidate_files = [
        path for path in CANDIDATE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]

    if not candidate_files:
        return

    encoder = FaceEncoder()
    matcher = FaceMatcher()
    input_embedding = encoder.encode(str(ROOT / "test.jpg"))["embedding"]

    for image_path in candidate_files[:3]:
        candidate_faces = encoder.encode_all(str(image_path))
        if not candidate_faces:
            continue

        best_score = max(
            matcher.compare(input_embedding, face["embedding"])["similarity"]
            for face in candidate_faces
        )
        assert isinstance(best_score, float)
        assert -1.0 <= best_score <= 1.0