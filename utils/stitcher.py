import cv2
import numpy as np
import os

def stitch_images(image_paths: list) -> str:
    try:
        if len(image_paths) == 1:
            return image_paths[0]

        images = []
        for path in image_paths:
            img = cv2.imread(path)
            if img is not None:
                images.append(img)

        if len(images) < 2:
            return image_paths[0]

        stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        status, stitched = stitcher.stitch(images)

        if status == cv2.Stitcher_OK:
            output_path = "outputs/orthomosaic.jpg"
            cv2.imwrite(output_path, stitched)
            print(f"✅ Stitched {len(images)} images → {output_path}")
            return output_path
        else:
            print(f"⚠️ Stitching failed (status {status}), using first image")
            return image_paths[0]

    except Exception as e:
        print(f"❌ Stitcher error: {e}")
        return image_paths[0]

def get_image_dimensions(image_path: str) -> dict:
    try:
        img = cv2.imread(image_path)
        h, w = img.shape[:2]
        return {"width": w, "height": h}
    except:
        return {"width": 0, "height": 0}
