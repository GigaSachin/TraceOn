import os
from pathlib import Path

import pytest

from search.serpapi_lens import SerpApiLens


ROOT = Path(__file__).resolve().parent


@pytest.mark.integration
@pytest.mark.skipif(not os.getenv("SERPAPI_KEY"), reason="SERPAPI_KEY is not configured")
def test_google_lens_search_returns_visual_matches():
    searcher = SerpApiLens()
    results = searcher.search(str(ROOT / "test.jpg"))

    assert "visual_matches" in results
    assert isinstance(results["visual_matches"], list)