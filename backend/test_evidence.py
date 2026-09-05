from evidence.evidence import EvidenceBuilder


def test_evidence_builder_creates_canonical_record_and_hash():
    builder = EvidenceBuilder()

    result = builder.build(
        candidate="candidate_1.webp",
        similarity=0.704815,
        decision="POTENTIAL_MATCH",
        source="Instagram",
        source_url="https://example.com/post",
        image_url="https://example.com/image.jpg",
    )

    assert result["record"]["candidate"] == "candidate_1.webp"
    assert result["record"]["decision"] == "POTENTIAL_MATCH"
    assert result["record"]["source"] == "Instagram"
    assert len(result["sha256"]) == 64
    assert result["canonical_json"] == builder.canonical_json(result["record"])
    assert result["sha256"] == builder.calculate_hash(result["record"])