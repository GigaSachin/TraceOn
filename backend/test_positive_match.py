from pathlib import Path

from face.encoder import FaceEncoder
from matching.matcher import FaceMatcher


ROOT = Path(__file__).resolve().parent


def test_same_person_images_match_above_threshold():
    encoder = FaceEncoder()
    matcher = FaceMatcher()

    input_result = encoder.encode(str(ROOT / "test.jpg"))
    same_person_result = encoder.encode(str(ROOT / "test_same.jpg"))

    result = matcher.compare(
        input_result["embedding"],
        same_person_result["embedding"],
    )

    assert result["similarity"] >= matcher.match_threshold
    assert result["decision"] == "POTENTIAL_MATCH"