from face.encoder import FaceEncoder
from matching.matcher import FaceMatcher


INPUT_IMAGE = "test.jpg"


print()
print("=" * 60)
print("              VERIFAI MATCH CALIBRATION")
print("=" * 60)


# ==========================================
# Initialize
# ==========================================

encoder = FaceEncoder()
matcher = FaceMatcher()


# ==========================================
# TEST 1 - SAME IMAGE
# ==========================================

print()
print("[TEST 1] Same image vs same image")

result1 = encoder.encode(INPUT_IMAGE)
result2 = encoder.encode(INPUT_IMAGE)


match_same = matcher.compare(
    result1["embedding"],
    result2["embedding"]
)


print(
    "Similarity:",
    round(match_same["similarity"], 6)
)

print(
    "Percentage:",
    round(
        match_same["similarity"] * 100,
        2
    ),
    "%"
)


# ==========================================
# TEST 2 - INPUT vs CANDIDATES
# ==========================================

import os


CANDIDATE_DIR = "uploads/candidates"


print()
print("[TEST 2] Input vs downloaded candidates")


candidate_files = []

for filename in os.listdir(CANDIDATE_DIR):

    if filename.lower().endswith(
        (
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        )
    ):

        candidate_files.append(
            os.path.join(
                CANDIDATE_DIR,
                filename
            )
        )


for candidate_path in candidate_files:

    filename = os.path.basename(
        candidate_path
    )

    try:

        candidate_result = encoder.encode(
            candidate_path
        )

        match = matcher.compare(
            result1["embedding"],
            candidate_result["embedding"]
        )

        print(
            filename,
            "->",
            round(match["similarity"], 6),
            "(",
            round(
                match["similarity"] * 100,
                2
            ),
            "%)"
        )

    except Exception as error:

        print(
            filename,
            "-> ERROR:",
            error
        )


# ==========================================
# END
# ==========================================

print()
print("=" * 60)
print("             CALIBRATION TEST END")
print("=" * 60)