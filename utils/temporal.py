import cv2
import numpy as np

def compare_inspections(old_image_path: str, new_image_path: str) -> dict:
    try:
        old_img = cv2.imread(old_image_path, cv2.IMREAD_GRAYSCALE)
        new_img = cv2.imread(new_image_path, cv2.IMREAD_GRAYSCALE)

        if old_img is None or new_img is None:
            raise ValueError("Could not read one or both images")

        # Resize new to match old
        if old_img.shape != new_img.shape:
            new_img = cv2.resize(new_img, (old_img.shape[1], old_img.shape[0]))

        # Edge detection on both
        old_edges = cv2.Canny(old_img, 50, 150)
        new_edges = cv2.Canny(new_img, 50, 150)

        old_area = int(np.sum(old_edges > 0))
        new_area = int(np.sum(new_edges > 0))

        if old_area > 0:
            growth_percent = round(((new_area - old_area) / old_area) * 100, 2)
        else:
            growth_percent = 0.0

        if growth_percent < 5:
            assessment = "Stable — no significant change detected"
        elif growth_percent < 20:
            assessment = "Moderate growth — increase inspection frequency"
        elif growth_percent < 50:
            assessment = "Significant growth — schedule repair soon"
        else:
            assessment = "Critical growth — immediate intervention required"

        return {
            "growth_percent": growth_percent,
            "old_area": old_area,
            "new_area": new_area,
            "assessment": assessment,
            "change_detected": abs(growth_percent) > 5
        }

    except Exception as e:
        print(f"❌ Temporal comparison error: {e}")
        return {
            "growth_percent": 0.0,
            "old_area": 0,
            "new_area": 0,
            "assessment": "Comparison failed — check image paths",
            "change_detected": False
        }
