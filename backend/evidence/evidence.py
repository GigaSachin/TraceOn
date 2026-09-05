import hashlib
import json
from datetime import datetime, timezone


class EvidenceBuilder:

    def create_record(
        self,
        candidate,
        similarity,
        decision,
        source_url=None,
        image_url=None,
        source=None
    ):
        """
        Create a canonical evidence record.

        The record contains the information required
        to reproduce and verify the matching event.
        """

        record = {
            "version": "1.0",

            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),

            "candidate": candidate,

            "source": source,

            "source_url": source_url,

            "image_url": image_url,

            "face_similarity": round(
                float(similarity),
                6
            ),

            "similarity_percentage": round(
                float(similarity) * 100,
                2
            ),

            "decision": decision
        }

        return record


    def canonical_json(self, record):
        """
        Convert evidence record into deterministic JSON.
        """

        return json.dumps(
            record,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=True
        )


    def calculate_hash(self, record):
        """
        Calculate SHA-256 hash of canonical evidence.
        """

        canonical = self.canonical_json(
            record
        )

        hash_value = hashlib.sha256(
            canonical.encode("utf-8")
        ).hexdigest()

        return hash_value


    def build(self, **kwargs):
        """
        Create record + SHA-256 hash.
        """

        record = self.create_record(
            **kwargs
        )

        evidence_hash = self.calculate_hash(
            record
        )

        return {
            "record": record,
            "canonical_json": self.canonical_json(
                record
            ),
            "sha256": evidence_hash
        }