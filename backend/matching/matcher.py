import numpy as np


class FaceMatcher:

    def __init__(
        self,
        match_threshold=0.38,
        uncertain_threshold=0.25
    ):
        self.match_threshold = match_threshold
        self.uncertain_threshold = uncertain_threshold

    def classify(self, similarity):
        if similarity >= self.match_threshold:
            return "POTENTIAL_MATCH"
        if similarity >= self.uncertain_threshold:
            return "UNCERTAIN"
        return "NO_MATCH"

    def confidence_level(self, similarity):
        if similarity >= self.match_threshold:
            return "HIGH"
        if similarity >= self.uncertain_threshold:
            return "MEDIUM"
        return "LOW"

    def explain(self, similarity):
        decision = self.classify(similarity)
        return {
            "decision": decision,
            "confidence": self.confidence_level(similarity),
            "thresholds": {
                "match": self.match_threshold,
                "uncertain": self.uncertain_threshold,
            },
        }


    # ==========================================
    # COSINE SIMILARITY
    # ==========================================

    def cosine_similarity(
        self,
        embedding1,
        embedding2
    ):

        embedding1 = np.asarray(
            embedding1
        )

        embedding2 = np.asarray(
            embedding2
        )

        similarity = np.dot(
            embedding1,
            embedding2
        ) / (
            np.linalg.norm(embedding1)
            *
            np.linalg.norm(embedding2)
        )

        return float(similarity)


    # ==========================================
    # COMPARE TWO FACES
    # ==========================================

    def compare(
        self,
        input_embedding,
        candidate_embedding
    ):

        similarity = self.cosine_similarity(
            input_embedding,
            candidate_embedding
        )

        percentage = round(
            similarity * 100,
            2
        )

        decision_info = self.explain(similarity)

        return {
            "similarity": similarity,
            "percentage": percentage,
            "decision": decision_info["decision"],
            "confidence": decision_info["confidence"],
            "thresholds": decision_info["thresholds"],
        }