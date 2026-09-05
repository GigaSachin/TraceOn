import json
import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from evidence.evidence import EvidenceBuilder
from blockchain.writer import register_evidence


def submit_evidence(
    candidate,
    similarity,
    decision,
    source_url=None,
    image_url=None,
    source=None
):
    builder = EvidenceBuilder()

    result = builder.build(
        candidate=candidate,
        similarity=similarity,
        decision=decision,
        source_url=source_url,
        image_url=image_url,
        source=source
    )

    record = result["record"]
    canonical_json = result["canonical_json"]
    evidence_hash = result["sha256"]

    # Save evidence locally
    evidence_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "evidence"
        )
    )

    os.makedirs(evidence_dir, exist_ok=True)

    evidence_path = os.path.join(
        evidence_dir,
        "latest_evidence.json"
    )

    with open(
        evidence_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            record,
            file,
            indent=2
        )

    print("\n================================")
    print("VERIFAI EVIDENCE")
    print("================================")

    print("Candidate:", candidate)
    print("Similarity:", similarity)
    print("Decision:", decision)

    print("\nSHA-256:")
    print(evidence_hash)

    print("\nEvidence saved:")
    print(evidence_path)

    # Blockchain submission
    tx_hash = register_evidence(
        evidence_hash,
        candidate,
        decision
    )

    print("\n================================")
    print("BLOCKCHAIN SUBMISSION COMPLETE")
    print("================================")

    print("SHA-256:", evidence_hash)
    print("Transaction:", tx_hash)

    return {
        "record": record,
        "canonical_json": canonical_json,
        "sha256": evidence_hash,
        "transaction_hash": tx_hash
    }


if __name__ == "__main__":

    submit_evidence(
        candidate="Google Lens Candidate #1",
        similarity=0.1956,
        decision="NO_MATCH",
        source_url="https://example.com/source",
        image_url="https://example.com/image.jpg",
        source="Google Lens via SerpAPI"
    )