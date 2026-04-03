from transformers import pipeline
from PIL import Image
import numpy as np

print("⏳ Loading Depth Anything V2...")
_depth_pipe = pipeline(
    "depth-estimation",
    model="depth-anything/Depth-Anything-V2-Small-hf"
)
print("✅ Depth model ready")

def get_depth_map(image_path: str) -> np.ndarray:
    try:
        image = Image.open(image_path).convert("RGB")
        orig_width, orig_height = image.size

        result = _depth_pipe(image)
        depth = result["depth"]  # PIL Image

        # Resize depth map to match original image size
        depth_resized = depth.resize((orig_width, orig_height), Image.BILINEAR)

        # Convert to numpy and normalize 0-1
        depth_array = np.array(depth_resized, dtype=np.float32)
        d_min, d_max = depth_array.min(), depth_array.max()

        if d_max - d_min > 0:
            depth_array = (depth_array - d_min) / (d_max - d_min)
        else:
            depth_array = np.zeros_like(depth_array)

        return depth_array

    except Exception as e:
        print(f"❌ Depth estimation error: {e}")
        # Return a flat zero map as fallback
        img = Image.open(image_path)
        w, h = img.size
        return np.zeros((h, w), dtype=np.float32)

