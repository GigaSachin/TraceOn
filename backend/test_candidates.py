from search.candidate_collector import CandidateCollector


def test_extract_candidates_uses_visual_matches_and_preserves_fields():
    collector = CandidateCollector(output_dir="uploads/candidates")
    results = {
        "visual_matches": [
            {
                "image": "https://example.com/image.jpg",
                "thumbnail": "https://example.com/thumb.jpg",
                "link": "https://example.com/page",
                "title": "Example title",
                "source": "Example source",
            }
        ]
    }

    candidates = collector.extract_candidates(results, limit=1)

    assert len(candidates) == 1
    assert candidates[0]["id"] == 1
    assert candidates[0]["image_url"] == "https://example.com/image.jpg"
    assert candidates[0]["source_url"] == "https://example.com/page"
    assert candidates[0]["title"] == "Example title"


def test_extract_candidates_filters_invalid_and_duplicate_entries():
    collector = CandidateCollector(output_dir="uploads/candidates")
    results = {
        "visual_matches": [
            {
                "image": "https://example.com/image.jpg",
                "thumbnail": "https://example.com/thumb.jpg",
                "link": "https://example.com/page1",
                "title": "Title",
                "source": "Source",
            },
            {
                "image": "https://example.com/image.jpg",
                "thumbnail": "https://example.com/thumb.jpg",
                "link": "https://example.com/page2",
                "title": "Title",
                "source": "Source",
            },
            {
                "image": "",
                "thumbnail": "",
                "link": "https://example.com/invalid",
                "title": "Missing image",
                "source": "Source",
            },
            {
                "image": "https://example.com/another.jpg",
                "thumbnail": "https://example.com/another-thumb.jpg",
                "link": "https://example.com/page3",
                "title": "Another",
                "source": "Source",
            },
        ]
    }

    candidates = collector.extract_candidates(results, limit=10)

    assert len(candidates) == 2
    assert {candidate["image_url"] for candidate in candidates} == {
        "https://example.com/image.jpg",
        "https://example.com/another.jpg",
    }