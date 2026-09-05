import os

import requests


class CandidateCollector:

    def __init__(self, output_dir="uploads/candidates"):
        self.output_dir = output_dir

        os.makedirs(
            self.output_dir,
            exist_ok=True
        )

    def extract_candidates(self, results, limit=10):

        visual_matches = results.get(
            "visual_matches",
            []
        )

        seen_urls = set()
        candidates = []

        for match in visual_matches:

            if not isinstance(match, dict):
                continue

            image_url = match.get("image") or match.get("thumbnail")
            source_url = match.get("link")
            title = (match.get("title") or "Unknown").strip() or "Unknown"
            source = (match.get("source") or "Unknown").strip() or "Unknown"

            if not image_url:
                continue

            image_url = image_url.strip()
            if not image_url:
                continue

            normalized_url = image_url.lower()
            if normalized_url in seen_urls:
                continue

            seen_urls.add(normalized_url)

            candidates.append({
                "id": len(candidates) + 1,
                "title": title,
                "source": source,
                "source_url": source_url,
                "image_url": image_url,
            })

            if len(candidates) >= limit:
                break

        return candidates

    def download_image(
        self,
        image_url,
        candidate_id
    ):

        try:

            response = requests.get(
                image_url,
                timeout=15,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )

            response.raise_for_status()

            content_type = response.headers.get(
                "Content-Type",
                ""
            )

            if "image" not in content_type:
                return None

            extension = self._get_extension(
                content_type
            )

            filename = (
                f"candidate_{candidate_id}"
                f"{extension}"
            )

            filepath = os.path.join(
                self.output_dir,
                filename
            )

            with open(
                filepath,
                "wb"
            ) as file:

                file.write(
                    response.content
                )

            return filepath

        except Exception as error:

            print(
                f"[DOWNLOAD FAILED] "
                f"Candidate {candidate_id}: "
                f"{error}"
            )

            return None

    def _get_extension(
        self,
        content_type
    ):

        if "png" in content_type:
            return ".png"

        if "webp" in content_type:
            return ".webp"

        if "gif" in content_type:
            return ".gif"

        return ".jpg"
