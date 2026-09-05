from pathlib import Path

from face.encoder import FaceEncoder
from matching.matcher import FaceMatcher


ROOT = Path(__file__).resolve().parent


def test_same_person_match_is_not_no_match():
    encoder = FaceEncoder()
    matcher = FaceMatcher()

    input_result = encoder.encode(str(ROOT / "test.jpg"))
    same_result = encoder.encode(str(ROOT / "test_same.jpg"))

    result = matcher.compare(
        input_result["embedding"],
        same_result["embedding"],
    )

    assert result["similarity"] >= matcher.uncertain_threshold
    assert result["decision"] in {"POTENTIAL_MATCH", "UNCERTAIN"}


def test_different_person_match_is_no_match():
    encoder = FaceEncoder()
    matcher = FaceMatcher()

    input_result = encoder.encode(str(ROOT / "test.jpg"))
    different_result = encoder.encode(str(ROOT / "test_different_1.jpg"))

    result = matcher.compare(
        input_result["embedding"],
        different_result["embedding"],
    )

    assert result["decision"] == "NO_MATCH"