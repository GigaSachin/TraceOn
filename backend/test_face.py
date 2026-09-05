from pathlib import Path

from face.encoder import FaceEncoder


ROOT = Path(__file__).resolve().parent


def test_face_encoder_detects_face_and_returns_embedding():
    encoder = FaceEncoder()
    result = encoder.encode(str(ROOT / "test.jpg"))

    assert "embedding" in result
    assert "bbox" in result
    assert "det_score" in result
    assert len(result["embedding"]) == 512
    assert len(result["bbox"]) == 4
    assert 0.0 <= result["det_score"] <= 1.0