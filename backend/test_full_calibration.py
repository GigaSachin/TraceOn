from pathlib import Path

from face.encoder import FaceEncoder
from matching.matcher import FaceMatcher


ROOT = Path(__file__).resolve().parent

POSITIVE_IMAGES = [
    ROOT / "test_same.jpg",
    ROOT / "test_same_2.jpg",
    ROOT / "test_same_3.jpg",
]
NEGATIVE_IMAGES = [
    ROOT / "test_different_1.jpg",
    ROOT / "test_different_2.jpg",
]


def test_same_person_scores_are_higher_than_different_person_scores():
    encoder = FaceEncoder()
    matcher = FaceMatcher()

    reference = encoder.encode(str(ROOT / "test.jpg"))
    reference_embedding = reference["embedding"]

    positive_scores = []
    for image_path in POSITIVE_IMAGES:
        candidate = encoder.encode(str(image_path))
        match = matcher.compare(reference_embedding, candidate["embedding"])
        positive_scores.append(match["similarity"])

    negative_scores = []
    for image_path in NEGATIVE_IMAGES:
        candidate = encoder.encode(str(image_path))
        match = matcher.compare(reference_embedding, candidate["embedding"])
        negative_scores.append(match["similarity"])

    assert positive_scores
    assert negative_scores
    assert max(positive_scores) > max(negative_scores)
    assert min(positive_scores) > max(negative_scores)