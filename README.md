#  SiteSense

### Hybrid AI for Drone Image-Based 3D Infrastructure Defect Detection & Severity Scoring

> **SC02 · Ignisia AI Hackathon 2026 · MIT-WPU Pune**



---

## 🧭 Overview

SiteSense is an end-to-end AI pipeline that transforms raw drone footage of infrastructure (bridges, dams, retaining walls) into actionable **3D defect maps with severity scores**. Unlike existing 2D crack detection systems, SiteSense fuses **YOLOv11 instance segmentation** with **Depth Anything V2** monocular depth estimation to produce a *Structural Severity Score (SSS)* on a 1–5 scale — enabling engineers to distinguish a cosmetic water stain from a 15mm structural fracture using nothing but a standard drone camera.

**The problem:** India has 1.7 lakh+ bridges, many past their design lifespan. Manual inspection costs ₹2–5 lakh per cycle and is blind to depth. The 2019 Savitri Bridge collapse showed the cost of missed defects.

**Our solution:** Upload drone images → stitch into orthomosaic → detect defects → score severity in 3D → export PDF inspection report.

---

## 🖼️ Screenshots

| Dashboard
<img width="1891" height="915" alt="image" src="https://github.com/user-attachments/assets/b4e09f0a-cc4d-4f4c-b46a-40d823ce603e" />
 | GPS Defect Mapping
 <img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/b6a6f0e8-3d03-4e5b-9f0e-65c26e7bdc38" />
 | Temporal Analysis
 <img width="1600" height="773" alt="image" src="https://github.com/user-attachments/assets/6cd8bd24-4120-492f-9e65-08ca4dfdc247" />




---

## ⚙️ Architecture & Pipeline

```
Drone Images (multiple passes)
        │
        ▼
┌─────────────────────┐
│  Stage 1            │  ORB Feature Matching + Homography
│  Image Stitching    │  → Single Orthomosaic (OpenCV)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 2            │  YOLOv11-seg fine-tuned on
│  Instance Segm.     │  CODEBRIM + CrackForest datasets
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 3            │  Depth Anything V2 (ViT-S)
│  Depth Estimation   │  → Relative depth map per pixel
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 4            │  Fuse mask + depth map
│  Severity Scoring   │  → Structural Severity Score 1–5
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 5            │  Align historical vs current
│  Temporal Analysis  │  → Crack growth % calculation
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Stage 6            │  React dashboard + auto-generated
│  Dashboard + PDF    │  PDF inspection report
└─────────────────────┘
```

Architecture Diagram
<img width="1327" height="592" alt="Screenshot (233)" src="https://github.com/user-attachments/assets/3e5a579e-db06-402d-9e28-3c80882ff03a" />


### Structural Severity Score (SSS) Formula

The core intellectual contribution — a weighted composite score calibrated to IS:456-2000 (Indian Standard for concrete crack classification):

```python
# For each detected defect mask:
mask_area  = pixel count of segmented defect
depth_mean = mean(depth_map[mask_pixels])    # 0–1 normalized
depth_max  = max(depth_map[mask_pixels])     # worst point depth
crack_len  = skeleton length of mask (skimage.morphology.skeletonize)

raw_score  = (0.4 × depth_max) + (0.3 × depth_mean) + (0.2 × log(mask_area)) + (0.1 × log(crack_len))

SSS = clamp(ceil(raw_score × 5), 1, 5)   # Maps to 1–5 scale
```

| Score | Label | Action |
|-------|-------|--------|
| 1 | Low | Monitor only |
| 2 | Moderate | Inspect soon |
| 3 | Significant | Schedule repair |
| 4 | High | Urgent repair |
| 5 | Critical | **Close immediately** |

---

## ✨ Features

- **Orthomosaic Stitching** — ORB/SIFT feature matching to merge overlapping drone passes into one unified image, eliminating double-counting of defects
- **YOLOv11 Instance Segmentation** — Fine-tuned on CODEBRIM and CrackForest for multi-material defect detection (concrete, asphalt, brick)
- **Monocular Depth Fusion** — Depth Anything V2 (NeurIPS 2024) runs on any standard camera image — no LiDAR required
- **3D Structural Severity Score** — First-of-its-kind depth-weighted scoring system distinguishing cosmetic damage from structural fractures
- **Temporal Crack Growth Analysis** — Compare two inspection datasets to quantify crack growth % and predict time-to-critical
- **Severity Heatmap Overlay** — Color-coded orthomosaic (green → red) showing at-a-glance where attention is needed
- **GPS-Tagged Defect Map** — Leaflet.js map with defect pins extracted from drone image EXIF data
- **LLM Inspection Narrative** — AI-generated plain-English report (e.g., *"Section B shows progressive cracking, recommend epoxy injection within 45 days"*)
- **Auto-Alert for SSS=5** — Immediate "Close for Assessment" notice when a critical defect is detected
- **PDF Report Export** — Auto-generated inspection report ready for PWD/NHAI submission

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Crack Detection | YOLOv11-seg (Ultralytics) |
| Depth Estimation | Depth Anything V2 (ViT-S, HuggingFace Transformers) |
| Image Stitching | OpenCV (ORB + Homography) |
| Temporal Comparison | OpenCV + scikit-image (SSIM, contour diff) |
| Backend API | FastAPI + Uvicorn |
| Frontend | React + Vite + Leaflet.js |
| LLM Narrative | Claude API / Gemini Flash |
| Report Generation | ReportLab / WeasyPrint |
| Model Setup | Jupyter (model_setup.ipynb + server.ipynb) |
| Tunnel / Deployment | ngrok |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Jupyter Notebook / JupyterLab
- ngrok account (free tier)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/sitesense.git
cd sitesense
```

---

### 2. Backend Setup — Model Initialization (Jupyter)

Open and run the notebooks in order. They handle model downloads, dependency installation, and server startup automatically.

```bash
cd backend
pip install -r requirements.txt
jupyter notebook
```

**Step 1 — Run `model_setup.ipynb`**
This notebook downloads and initializes:
- YOLOv11-seg weights (fine-tuned on CODEBRIM + CrackForest)
- Depth Anything V2 (ViT-S) from HuggingFace
- OpenCV stitching pipeline

**Step 2 — Run `server.ipynb`**
This notebook starts the FastAPI server and exposes it via ngrok.

Once running, your backend will be live at:

```
https://merna-dividable-josefa.ngrok-free.app/health   ← Health check
https://merna-dividable-josefa.ngrok-free.app/docs     ← FastAPI auto-docs (Swagger UI)
```

> **Note:** The ngrok URL above is the current tunnel URL. If you restart the server, update the `VITE_API_URL` in `frontend/.env` with the new URL.


---

### 3. Frontend Setup

In a **separate terminal**, run the React frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` by default.

Make sure `frontend/.env` points to your active ngrok backend URL:

```env
VITE_API_URL=https://merna-dividable-josefa.ngrok-free.app
```

---

### 4. Full Setup (Side-by-Side)

```
Terminal 1 (Backend — Jupyter)
  → backend/model_setup.ipynb  [Run All]
  → backend/server.ipynb       [Run All]

Terminal 2 (Frontend)
  → cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser. The dashboard should connect to the FastAPI backend automatically.

---

## 📁 Project Structure

```
sitesense/
├── backend/
│   ├── model_setup.ipynb      # Downloads + initializes all ML models
│   ├── server.ipynb           # Starts FastAPI server via ngrok
│   ├── main.py                # FastAPI app (entry point)
│   ├── pipeline/
│   │   ├── stitcher.py        # ORB orthomosaic stitching
│   │   ├── detector.py        # YOLOv11 segmentation
│   │   ├── depth.py           # Depth Anything V2 inference
│   │   ├── scorer.py          # Structural Severity Score formula
│   │   ├── temporal.py        # Crack growth comparison
│   │   └── reporter.py        # PDF report generation
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Dashboard, Upload, Map, Report
│   │   └── App.jsx
│   ├── .env                   # VITE_API_URL → ngrok URL
│   └── package.json
│
├── docs/
│   └── images/                # README image placeholders
│
└── README.md
```

---

## 🔌 API Endpoints

Once the server is running, explore interactive docs at `/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/upload` | Upload drone images |
| `POST` | `/analyze` | Run full detection + scoring pipeline |
| `POST` | `/compare` | Temporal comparison between two inspection sets |
| `GET` | `/report/{id}` | Download PDF inspection report |
| `GET` | `/docs` | FastAPI Swagger UI |

---

## 📊 Datasets

| Dataset | Description | Use |
|---------|-------------|-----|
| [CODEBRIM](https://zenodo.org/record/2620293) | 5 defect categories on bridge/concrete | YOLOv11 fine-tuning |
| [CrackForest](https://github.com/cuilimeng/CrackForest-dataset) | Pavement crack images | YOLOv11 fine-tuning |
| UAV Building Defects (Nat. Sci. Data 2025) | 14,471 images, 6 structure types | Validation |

---

## 📚 Research Backing

This project is grounded in recent literature:

- **Depth Anything V2** — Yang et al., NeurIPS 2024 (arXiv:2406.09414) — backbone for monocular depth estimation
- **YOLOv11 for Bridge Crack Detection** — YOLO11-BD achieves mAP50 9.1% better than Mask-RCNN (PMC/MDPI Sensors, 2025)
- **UAV Deep Learning for Infrastructure Inspection** — Systematic review identifying 3 open research frontiers (ScienceDirect, June 2025)
- **UAV Building Surface Defect Dataset** — 14,471 images (Nature Scientific Data, November 2025)

SiteSense directly addresses the three unsolved gaps identified in the 2025 systematic review: no depth-based severity scoring, no temporal growth analysis, and no orthomosaic-first stitching.

---

## 👥 Team — Ignisia 2026

| Role | Responsibility |
|------|---------------|
| ML Lead | YOLOv11 pipeline, Depth Anything V2, SSS formula, FastAPI |
| Image Processing | ORB stitching, orthomosaic, heatmap overlay, GPS EXIF |
| Frontend | React dashboard, severity cards, Leaflet map, PDF export |
| Demo & Docs | Presentation, report template, demo dataset, slide deck |

---



**Ignisia AI Hackathon 2026 · SC02 · Smart Cities Track**
MIT-WPU Pune · April 2026

---
