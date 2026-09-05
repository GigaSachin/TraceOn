import os

import serpapi
from dotenv import load_dotenv


load_dotenv()


class SerpApiLens:

    def __init__(self):
        api_key = os.getenv("SERPAPI_KEY")

        if not api_key:
            raise ValueError(
                "SERPAPI_KEY not found in .env"
            )

        self.client = serpapi.Client(
            api_key=api_key
        )

    def search(self, image_path: str):

        print("[SEARCH] Uploading image...")

        upload = self.client.upload_image(image_path)

        if "error" in upload:
            raise RuntimeError(
                f"Image upload failed: {upload['error']}"
            )

        image_id = upload["image_id"]

        print("[SEARCH] Image uploaded")
        print("[SEARCH] Image ID:", image_id)

        print("[SEARCH] Searching Google Lens...")

        results = self.client.search({
            "engine": "google_lens",
            "image_id": image_id,
            "type": "all"
        })

        if "error" in results:
            raise RuntimeError(
                f"Google Lens search failed: {results['error']}"
            )

        print("[SEARCH] Search successful")

        return results
