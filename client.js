// ============================================================
//  api/client.js
//  ALL backend calls live here.
//  Your FastAPI runs on http://localhost:8000
//  Vite proxies /api → http://localhost:8000 automatically
//  so you never get CORS errors in development.
// ============================================================

import axios from 'axios'

// Base axios instance — every request uses this
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s — ML inference can be slow
})

// ── ENDPOINTS ──────────────────────────────────────────────

/**
 * Upload drone images for analysis.
 * @param {File[]} files  - Array of image files from the dropzone
 * @param {Function} onProgress - Called with 0-100 as upload progresses
 * @returns Backend response with defects array and severity scores
 *
 * Expected backend response shape:
 * {
 *   job_id: "abc123",
 *   defects: [
 *     {
 *       id: 1,
 *       type: "crack",
 *       severity: 5,
 *       depth_mm: 18.4,
 *       area_px: 2340,
 *       growth_rate: 2.1,
 *       section: "A3",
 *       bbox: [x, y, w, h],        // pixel coords on the image
 *       lat: 18.5204,              // from GPS EXIF
 *       lng: 73.8567
 *     }
 *   ],
 *   orthomosaic_url: "/outputs/ortho_abc123.jpg",
 *   heatmap_url:     "/outputs/heatmap_abc123.jpg",
 *   bridge_health:   42
 * }
 */
export async function analyzeImages(files, onProgress) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))

  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
  return response.data
}

/**
 * Compare current inspection to a historical one.
 * @param {string} currentJobId   - job_id from analyzeImages()
 * @param {string} historicalJobId - job_id from a previous run
 * @returns Crack growth rates and trend data
 */
export async function compareInspections(currentJobId, historicalJobId) {
  const response = await api.post('/compare', {
    current_job_id: currentJobId,
    historical_job_id: historicalJobId,
  })
  return response.data
}

/**
 * Generate a PDF inspection report.
 * @param {string} jobId - job_id from analyzeImages()
 * @returns Blob that can be downloaded as a PDF file
 */
export async function generateReport(jobId) {
  const response = await api.post(
    '/report',
    { job_id: jobId },
    { responseType: 'blob' }  // important: tells axios to treat response as a file
  )
  return response.data
}

/**
 * Get list of all past inspections (for history view).
 */
export async function getHistory() {
  const response = await api.get('/history')
  return response.data
}

// ── MOCK DATA (used when backend is not running yet) ────────
// During development, import this instead of the real API calls
// to see the UI with realistic data immediately.

export const MOCK_RESULT = {
  job_id: 'mock_001',
  bridge_health: 42,
  defects: [
    { id: 1, type: 'Deep Structural Crack', severity: 5, depth_mm: 18.4, section: 'A3', growth_rate: 2.1,  bbox: [120, 90, 80, 55],  lat: 18.5204, lng: 73.8567 },
    { id: 2, type: 'Spalling + Rebar',      severity: 5, depth_mm: 32.0, section: 'B1', growth_rate: 0,    bbox: [280, 100, 70, 50], lat: 18.5206, lng: 73.8570 },
    { id: 3, type: 'Diagonal Tension Crack',severity: 4, depth_mm: 9.6,  section: 'C2', growth_rate: 1.4,  bbox: [410, 95, 60, 45],  lat: 18.5201, lng: 73.8573 },
    { id: 4, type: 'Surface Delamination',  severity: 3, depth_mm: 4.2,  section: 'D4', growth_rate: 0,    bbox: [200, 115, 50, 35], lat: 18.5208, lng: 73.8565 },
    { id: 5, type: 'Hairline Surface Crack',severity: 2, depth_mm: 1.1,  section: 'E1', growth_rate: 0.2,  bbox: [340, 110, 40, 30], lat: 18.5202, lng: 73.8569 },
  ],
  orthomosaic_url: null,
  heatmap_url: null,
}
