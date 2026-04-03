'''
%%writefile /content/main.py
import os, uuid, threading
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List

os.makedirs("/content/uploads", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

app = FastAPI(title="SC02 Infrastructure Inspector")
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*", "ngrok-skip-browser-warning"])

from models.detector import detect_defects
from models.depth import get_depth_map
from models.severity import calculate_sss
from utils.stitcher import stitch_images
from utils.heatmap import generate_heatmap
from utils.temporal import compare_inspections
from utils.pdf_report import generate_pdf

@app.get("/health")
def health():
    return {"status": "ok", "message": "SC02 Inspector running"}

@app.post("/analyze")
async def analyze(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(400, "No files")

    saved = []
    for file in files:
        data = await file.read()
        print(f"📁 {file.filename} — {len(data)} bytes")
        if len(data) == 0:
            raise HTTPException(400, f"{file.filename} is empty")
        ext = os.path.splitext(file.filename)[-1].lower() or ".jpg"
        path = f"/content/uploads/{uuid.uuid4().hex}{ext}"
        with open(path, "wb") as f:
            f.write(data)
        saved.append(path)

    try:
        img = stitch_images(saved) if len(saved) > 1 else saved[0]
        raw = detect_defects(img)
        depth = get_depth_map(img)

        scored = []
        for_heatmap = []
        for d in raw:
            s = calculate_sss(d, depth)
            combined = {**d, **s}
            pixels = combined.pop("mask_pixels", [])
            scored.append(combined)
            for_heatmap.append({"mask_pixels": pixels, "sss": s["sss"]})

        heatmap = generate_heatmap(img, for_heatmap)
        max_sss = max((d["sss"] for d in scored), default=0)

        return {
            "defects": scored,
            "heatmap_path": heatmap,
            "total_defects": len(scored),
            "max_sss": max_sss,
            "status": "success"
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(500, str(e))
    finally:
        for p in saved:
            if os.path.exists(p): os.remove(p)
    
    import cv2, base64, numpy as np

# Convert depth array to colorized image and base64 encode it
depth_uint8 = (depth * 255).astype(np.uint8)
depth_colored = cv2.applyColorMap(depth_uint8, cv2.COLORMAP_PLASMA)
_, buf = cv2.imencode('.jpg', depth_colored)
depth_b64 = base64.b64encode(buf).decode('utf-8')

# Also encode heatmap as base64
heatmap_img = cv2.imread(heatmap)
_, hbuf = cv2.imencode('.jpg', heatmap_img)
heatmap_b64 = base64.b64encode(hbuf).decode('utf-8')

"depth_image_b64": depth_b64,
"heatmap_b64": heatmap_b64,

@app.post("/compare")
async def compare(old_image: UploadFile = File(...),
                  new_image: UploadFile = File(...)):
    paths = []
    for f in [old_image, new_image]:
        data = await f.read()
        ext = os.path.splitext(f.filename)[-1] or ".jpg"
        p = f"/content/uploads/{uuid.uuid4().hex}{ext}"
        with open(p, "wb") as fp: fp.write(data)
        paths.append(p)
    try:
        return compare_inspections(paths[0], paths[1])
    finally:
        for p in paths:
            if os.path.exists(p): os.remove(p)

class ReportRequest(BaseModel):
    defects: list
    heatmap_path: str

@app.post("/report")
async def report(req: ReportRequest):
    path = generate_pdf(req.defects, req.heatmap_path)
    if not path or not os.path.exists(path):
        raise HTTPException(500, "PDF failed")
    return FileResponse(path, media_type="application/pdf",
                        filename="inspection_report.pdf")
@app.get("/image")
async def get_image(path: str):
    if not os.path.exists(path):
        raise HTTPException(404, "Image not found")
    return FileResponse(path, media_type="image/jpeg")
'''


import os, uuid, threading, cv2, base64, numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List

os.makedirs("/content/uploads", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

app = FastAPI(title="SC02 Infrastructure Inspector")
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*", "ngrok-skip-browser-warning"])

from models.detector import detect_defects
from models.depth import get_depth_map
from models.severity import calculate_sss
from utils.stitcher import stitch_images
from utils.heatmap import generate_heatmap
from utils.temporal import compare_inspections
from utils.pdf_report import generate_pdf

@app.get("/health")
def health():
    return {"status": "ok", "message": "SC02 Inspector running"}

@app.post("/analyze")
async def analyze(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(400, "No files")

    saved = []
    for file in files:
        data = await file.read()
        print(f"📁 {file.filename} — {len(data)} bytes")
        if len(data) == 0:
            raise HTTPException(400, f"{file.filename} is empty")
        ext = os.path.splitext(file.filename)[-1].lower() or ".jpg"
        path = f"/content/uploads/{uuid.uuid4().hex}{ext}"
        with open(path, "wb") as f:
            f.write(data)
        saved.append(path)

    try:
        img = stitch_images(saved) if len(saved) > 1 else saved[0]
        raw = detect_defects(img)
        depth = get_depth_map(img)

        scored = []
        for_heatmap = []
        for d in raw:
            s = calculate_sss(d, depth)
            combined = {**d, **s}
            pixels = combined.pop("mask_pixels", [])
            scored.append(combined)
            for_heatmap.append({"mask_pixels": pixels, "sss": s["sss"]})

        heatmap = generate_heatmap(img, for_heatmap)
        max_sss = max((d["sss"] for d in scored), default=0)

        # Encode depth map as base64 for frontend 3D viewer
        depth_uint8 = (depth * 255).astype(np.uint8)
        depth_colored = cv2.applyColorMap(depth_uint8, cv2.COLORMAP_PLASMA)
        _, buf = cv2.imencode('.jpg', depth_colored)
        depth_b64 = base64.b64encode(buf).decode('utf-8')

        # Encode heatmap as base64
        heatmap_img = cv2.imread(heatmap)
        _, hbuf = cv2.imencode('.jpg', heatmap_img)
        heatmap_b64 = base64.b64encode(hbuf).decode('utf-8')

        return {
            "defects": scored,
            "heatmap_path": heatmap,
            "heatmap_b64": heatmap_b64,
            "depth_image_b64": depth_b64,
            "total_defects": len(scored),
            "max_sss": max_sss,
            "status": "success"
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(500, str(e))
    finally:
        for p in saved:
            if os.path.exists(p): os.remove(p)

@app.post("/compare")
async def compare(old_image: UploadFile = File(...),
                  new_image: UploadFile = File(...)):
    paths = []
    for f in [old_image, new_image]:
        data = await f.read()
        ext = os.path.splitext(f.filename)[-1] or ".jpg"
        p = f"/content/uploads/{uuid.uuid4().hex}{ext}"
        with open(p, "wb") as fp: fp.write(data)
        paths.append(p)
    try:
        return compare_inspections(paths[0], paths[1])
    finally:
        for p in paths:
            if os.path.exists(p): os.remove(p)

class ReportRequest(BaseModel):
    defects: list
    heatmap_path: str

@app.post("/report")
async def report(req: ReportRequest):
    path = generate_pdf(req.defects, req.heatmap_path)
    if not path or not os.path.exists(path):
        raise HTTPException(500, "PDF failed")
    return FileResponse(path, media_type="application/pdf",
                        filename="inspection_report.pdf")

@app.get("/image")
async def get_image(path: str):
    if not os.path.exists(path):
        raise HTTPException(404, "Image not found")
    return FileResponse(path, media_type="image/jpeg")
