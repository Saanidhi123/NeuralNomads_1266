import numpy as np
import math
from skimage.morphology import skeletonize
from skimage.draw import polygon

ACTION_MAP = {
    1: "Monitor Only",
    2: "Inspect Soon",
    3: "Schedule Repair",
    4: "Urgent Repair",
    5: "Close for Immediate Assessment"
}

def calculate_sss(defect: dict, depth_map: np.ndarray) -> dict:
    try:
        mask_pixels = defect.get("mask_pixels", [])
        mask_area = defect.get("mask_area", 0)

        if len(mask_pixels) == 0 or mask_area == 0:
            return {"sss": 1, "action": ACTION_MAP[1], "depth_max": 0.0,
                    "depth_mean": 0.0, "mask_area": 0, "crack_length": 0.0}

        h, w = depth_map.shape
        pixels = np.array(mask_pixels, dtype=np.int32)

        # Clamp coordinates within image bounds
        xs = np.clip(pixels[:, 0], 0, w - 1)
        ys = np.clip(pixels[:, 1], 0, h - 1)

        # Sample depth at mask pixel locations
        depth_values = depth_map[ys, xs]
        depth_max = float(np.max(depth_values))
        depth_mean = float(np.mean(depth_values))

        # Build binary mask for skeletonization
        binary_mask = np.zeros((h, w), dtype=bool)
        binary_mask[ys, xs] = True

        skeleton = skeletonize(binary_mask)
        crack_length = float(np.sum(skeleton))

        # SSS Formula
        raw_score = (
            0.4 * depth_max +
            0.3 * depth_mean +
            0.2 * math.log1p(mask_area) +
            0.1 * math.log1p(crack_length)
        )

        sss = int(min(max(math.ceil(raw_score * 5), 1), 5))

        return {
            "sss": sss,
            "action": ACTION_MAP[sss],
            "depth_max": round(depth_max, 4),
            "depth_mean": round(depth_mean, 4),
            "mask_area": mask_area,
            "crack_length": round(crack_length, 2)
        }

    except Exception as e:
        print(f"❌ SSS error: {e}")
        return {"sss": 1, "action": ACTION_MAP[1], "depth_max": 0.0,
                "depth_mean": 0.0, "mask_area": 0, "crack_length": 0.0}
