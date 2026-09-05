import os
import sys
import io

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# backend/ ko Python path mein add karo
BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


from face.encoder import FaceEncoder  # pyright: ignore[reportMissingImports]
from search.serpapi_lens import SerpApiLens  # pyright: ignore[reportMissingImports]
from search.candidate_collector import CandidateCollector  # pyright: ignore[reportMissingImports]
from matching.matcher import FaceMatcher


class VerifaiPipeline:

    def __init__(self):

        print("\n[INIT] Loading VERIFAI components...")

        self.encoder = FaceEncoder()
        self.searcher = SerpApiLens()
        self.collector = CandidateCollector(
            output_dir=os.path.join(
                BACKEND_DIR,
                "uploads",
                "candidates"
            )
        )
        self.matcher = FaceMatcher()

        print("[INIT] VERIFAI ready!")


    def run(self, input_image, candidate_limit=10):

        print("\n========================================")
        print("        VERIFAI PIPELINE START")
        print("========================================")

        # ====================================================
        # 1. Validate input
        # ====================================================

        if not os.path.exists(input_image):
            raise FileNotFoundError(
                f"Input image not found: {input_image}"
            )

        print("\n[1/6] INPUT IMAGE")
        print(input_image)


        # ====================================================
        # 2. Face encoding
        # ====================================================

        print("\n[2/6] FACE DETECTION + EMBEDDING")

        input_face = self.encoder.encode(
            input_image
        )

        input_embedding = input_face["embedding"]

        print(
            "[FACE] Face detected successfully"
        )

        print(
            "[FACE] Detection score:",
            round(input_face["det_score"], 4)
        )

        print(
            "[FACE] Embedding dimensions:",
            len(input_embedding)
        )


        # ====================================================
        # 3. Google Lens search
        # ====================================================

        print("\n[3/6] GOOGLE LENS SEARCH")

        lens_results = self.searcher.search(
            input_image
        )

        candidates = self.collector.extract_candidates(
            lens_results,
            limit=candidate_limit
        )

        print(
            "[SEARCH] Candidates found:",
            len(candidates)
        )


        if not candidates:
            return {
                "status": "NO_CANDIDATES",
                "message": "No visual search candidates found."
            }


        # ====================================================
        # 4. Download + face matching
        # ====================================================

        print("\n[4/6] CANDIDATE FACE MATCHING")

        matches = []

        for candidate in candidates:

            candidate_id = candidate["id"]

            print(
                f"\n[CANDIDATE {candidate_id}] "
                f"{candidate['title']}"
            )

            image_path = self.collector.download_image(
                candidate["image_url"],
                candidate_id
            )

            if not image_path:

                print(
                    "[MATCH] Image download failed"
                )

                continue


            # Detect ALL faces
            candidate_faces = self.encoder.encode_all(
                image_path
            )

            if not candidate_faces:

                print(
                    "[MATCH] No face detected"
                )

                continue


            best_face = None
            best_result = None


            # Compare input face with every face
            for face in candidate_faces:

                result = self.matcher.compare(
                    input_embedding,
                    face["embedding"]
                )

                if (
                    best_result is None
                    or result["similarity"]
                    > best_result["similarity"]
                ):

                    best_result = result
                    best_face = face


            if best_result is None or best_face is None:
                continue


            match_data = {
                "candidate_id": candidate_id,
                "title": candidate["title"],
                "source": candidate["source"],
                "source_url": candidate["source_url"],
                "image_url": candidate["image_url"],
                "image_path": image_path,
                "face_index": best_face["face_index"],
                "similarity": best_result["similarity"],
                "percentage": best_result["percentage"],
                "decision": best_result["decision"]
            }

            matches.append(match_data)


            print(
                "[MATCH] Similarity:",
                best_result["percentage"],
                "%"
            )

            print(
                "[MATCH] Decision:",
                best_result["decision"]
            )


        # ====================================================
        # 5. Select best candidate
        # ====================================================

        print("\n[5/6] SELECTING BEST RESULT")

        if not matches:

            return {
                "status": "NO_FACE_MATCHES",
                "message": "Candidates found, but no usable faces detected."
            }


        matches.sort(
            key=lambda x: x["similarity"],
            reverse=True
        )

        best_match = matches[0]

        ranked_matches = []
        for rank, match in enumerate(matches, start=1):
            ranked_matches.append({
                "rank": rank,
                "candidate_id": match["candidate_id"],
                "title": match["title"],
                "source": match["source"],
                "source_url": match["source_url"],
                "image_url": match["image_url"],
                "similarity": match["similarity"],
                "percentage": match["percentage"],
                "decision": match["decision"],
                "confidence": match.get("confidence", self.matcher.confidence_level(match["similarity"])),
            })

        summary = {
            "total_candidates": len(matches),
            "best_rank": 1,
            "best_decision": best_match["decision"],
            "best_confidence": best_match.get("confidence", self.matcher.confidence_level(best_match["similarity"])),
            "best_similarity": best_match["similarity"],
            "best_percentage": best_match["percentage"],
        }

        print(
            "\n========================================"
        )

        print("BEST CANDIDATE")

        print(
            "========================================"
        )

        print(
            "Candidate:",
            best_match["title"]
        )

        print(
            "Source:",
            best_match["source"]
        )

        print(
            "Similarity:",
            best_match["percentage"],
            "%"
        )

        print(
            "Decision:",
            best_match["decision"]
        )

        print(
            "Confidence:",
            best_match.get("confidence", self.matcher.confidence_level(best_match["similarity"]))
        )

        # ====================================================
        # 6. Final result
        # ====================================================

        print("\n[6/6] PIPELINE COMPLETE")

        return {
            "status": "SUCCESS",
            "input_image": input_image,
            "best_match": best_match,
            "all_matches": matches,
            "ranked_matches": ranked_matches,
            "summary": summary,
            "match_count": len(matches),
            "confidence": summary["best_confidence"],
        }