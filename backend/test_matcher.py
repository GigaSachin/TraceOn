import numpy as np
import pytest

from matching.matcher import FaceMatcher


def test_matcher_same_embedding_is_potential_match():
    matcher = FaceMatcher()
    rng = np.random.default_rng(42)
    embedding = rng.random(512)
    embedding = embedding / np.linalg.norm(embedding)

    result = matcher.compare(embedding, embedding.copy())

    assert result["decision"] == "POTENTIAL_MATCH"
    assert result["similarity"] == pytest.approx(1.0, abs=1e-6)
    assert result["percentage"] == pytest.approx(100.0, abs=1e-6)