import os
import tempfile
import cv2
import numpy as np
from insightface.app import FaceAnalysis


_SHARED_APP = None

class FaceEncoder:

    def __init__(self):
        global _SHARED_APP
        if _SHARED_APP is None:
            root_dir = os.environ.get("INSIGHTFACE_ROOT", os.path.join(tempfile.gettempdir(), ".insightface"))
            app = FaceAnalysis(
                name="buffalo_l",
                root=root_dir,
                allowed_modules=["detection", "recognition"],
                providers=["CPUExecutionProvider"]
            )
            app.prepare(
                ctx_id=0,
                det_size=(640, 640)
            )
            _SHARED_APP = app
        self.app = _SHARED_APP

    # ---------------------------------------
    # Encode the main/largest face
    # ---------------------------------------

    def encode(self, image_path: str):

        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                f"Could not read image: {image_path}"
            )

        faces = self.app.get(image)

        if not faces:
            raise ValueError("No face detected")

        face = max(
            faces,
            key=lambda f: (
                f.bbox[2] - f.bbox[0]
            ) * (
                f.bbox[3] - f.bbox[1]
            )
        )

        embedding = face.embedding

        embedding = embedding / np.linalg.norm(
            embedding
        )

        return {
            "embedding": embedding,
            "bbox": face.bbox.tolist(),
            "det_score": float(face.det_score)
        }

    # ---------------------------------------
    # Encode ALL detected faces
    # ---------------------------------------

    def encode_all(self, image_path: str):

        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                f"Could not read image: {image_path}"
            )

        faces = self.app.get(image)

        if not faces:
            return []

        results = []

        for index, face in enumerate(faces):

            embedding = face.embedding

            embedding = embedding / np.linalg.norm(
                embedding
            )

            results.append({
                "face_index": index,
                "embedding": embedding,
                "bbox": face.bbox.tolist(),
                "det_score": float(face.det_score)
            })

        return results
