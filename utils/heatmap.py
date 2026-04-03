import cv2
import numpy as np

SSS_COLORS = {
    1: (0, 200, 0),      # green
    2: (0, 200, 100),    # yellow-green
    3: (0, 200, 200),    # yellow
    4: (0, 140, 255),    # orange
    5: (0, 0, 255)       # red
}

SSS_LABELS = {
    1: "SSS 1 - Monitor",
    2: "SSS 2 - Inspect",
    3: "SSS 3 - Repair",
    4: "SSS 4 - Urgent",
    5: "SSS 5 - CLOSE"
}

def generate_heatmap(image_path: str, defects: list) -> str:
    try:
        original = cv2.imread(image_path)
        if original is None:
            raise ValueError("Cannot read image")

        h, w = original.shape[:2]
        overlay = np.zeros_like(original)

        for defect in defects:
            sss = defect.get("sss", 1)
            mask_pixels = defect.get("mask_pixels", [])
            color = SSS_COLORS.get(sss, (0, 200, 0))

            if len(mask_pixels) == 0:
                continue

            pixels = np.array(mask_pixels, dtype=np.int32)
            xs = np.clip(pixels[:, 0], 0, w - 1)
            ys = np.clip(pixels[:, 1], 0, h - 1)
            overlay[ys, xs] = color

        # Blend
        result = cv2.addWeighted(original, 0.6, overlay, 0.4, 0)

        # Draw legend bottom-right
        legend_x = w - 200
        legend_y = h - 160
        cv2.rectangle(result, (legend_x - 10, legend_y - 20),
                      (w - 10, h - 10), (30, 30, 30), -1)

        for i, (sss_val, label) in enumerate(SSS_LABELS.items()):
            color = SSS_COLORS[sss_val]
            y = legend_y + i * 26
            cv2.rectangle(result, (legend_x, y), (legend_x + 18, y + 18), color, -1)
            cv2.putText(result, label, (legend_x + 24, y + 14),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        output_path = "outputs/heatmap.jpg"
        cv2.imwrite(output_path, result)
        print(f"✅ Heatmap saved → {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ Heatmap error: {e}")
        return image_path
