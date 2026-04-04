import React, { useState } from 'react';
import axios from 'axios';
import { 
  MdDashboard, MdUpload, MdTimeline, MdHistory, 
  MdLocationOn, MdDescription, MdQrCode, MdReportProblem, 
  MdRadar, MdLayers, MdAnalytics, MdViewInAr, MdSettings, MdCompare, MdWarning
} from "react-icons/md";

// --- MAP ENGINE IMPORTS ---
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const NGROK_URL = "https://merna-dividable-josefa.ngrok-free.dev"; 
const api = axios.create({ baseURL: NGROK_URL, headers: { "ngrok-skip-browser-warning": "true" } });

const SSS_RANGE = [
  { level: 1, label: "Monitor Only", color: "#22c55e" },
  { level: 2, label: "Standard Inspect", color: "#84cc16" },
  { level: 3, label: "Schedule Repair", color: "#eab308" },
  { level: 4, label: "Urgent Assess", color: "#f97316" },
  { level: 5, label: "CLOSE NOW", color: "#ef4444" }
];

export default function App() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [qrData, setQrData] = useState(null); // Linked to /qr
  const [alertStatus, setAlertStatus] = useState(null); // Linked to /alert
  const [narrative, setNarrative] = useState("");
  const [preview, setPreview] = useState(null);

  const [blur, setBlur] = useState(151);
  const [opacity, setOpacity] = useState(60);
  const [rotation, setRotation] = useState({ x: 20, y: 0 });

  const handleMouseMove = (e) => {
    if (activeView !== "Heatmap Overlay") return;
    const x = (window.innerHeight / 2 - e.pageY) / 35;
    const y = (window.innerWidth / 2 - e.pageX) / -35;
    setRotation({ x: 20 + x, y: y });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setPreview(URL.createObjectURL(files[0]));
    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      // 1. Core Analysis
      const res = await api.post("/analyze", formData);
      setData(res.data);
      
      const reportPayload = { 
        defects: res.data.defects, 
        heatmap_path: res.data.heatmap_path 
      };

      // 2. Fetch QR Deployment Card
      const qrRes = await api.post("/qr", reportPayload);
      setQrData(qrRes.data);

      // 3. Fetch Safety Alert Status
      const alertRes = await api.post("/alert", reportPayload);
      setAlertStatus(alertRes.data);

      // 4. Temporal comparison logic
      if (files.length >= 2) {
          const forecastRes = await api.post("/forecast", formData);
          setForecast(forecastRes.data);
      }

      const narRes = await api.post("/narrative", reportPayload);
      setNarrative(narRes.data.narrative);
    } catch (err) {
      setNarrative("⚠️ AI Narrative Offline. Manual structural validation required.");
    }
    setLoading(false);
  };

  const primary = data?.defects?.[0] || {};

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans" onMouseMove={handleMouseMove}>
      
      <aside className="w-64 bg-[#1e293b] border-r border-slate-800 p-6 flex flex-col shrink-0 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <MdRadar className="text-2xl text-[#38bdf8]" />
          <h1 className="text-2xl font-bold text-white tracking-tighter">SiteSense</h1>
        </div>

        <nav className="space-y-1 flex-grow overflow-y-auto">
          {[
            { id: "Dashboard", icon: <MdDashboard /> },
            { id: "Heatmap Overlay", icon: <MdLayers /> },
            { id: "Crack Growth Forecast", icon: <MdTimeline /> },
            { id: "GPS Defect Map", icon: <MdLocationOn /> },
            { id: "QR Inspection", icon: <MdQrCode /> },
            { id: "Auto-Alerts", icon: <MdReportProblem /> }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeView === item.id ? 'bg-[#38bdf8] text-[#0f172a] font-bold shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.id}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-[#0f172a] to-[#020617]">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{activeView}</h2>
            <p className="text-[10px] text-[#38bdf8] font-bold uppercase tracking-widest mt-1">SC02 Analytics Pro</p>
          </div>
          
          {activeView === "Dashboard" && (
            <div className="flex gap-4 bg-[#1e293b] p-2 rounded-xl border border-slate-800">
               <div className="px-4 text-center border-r border-slate-700">
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Class</p>
                  <p className="text-lg font-bold text-white uppercase">{primary.class_name || "IDLE"}</p>
               </div>
               <div className="px-4 text-center border-r border-slate-700">
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Confidence</p>
                  <p className="text-lg font-bold text-[#38bdf8]">{primary.confidence ? `${(primary.confidence * 100).toFixed(0)}%` : "0%"}</p>
               </div>
               <div className="px-4 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Max Depth</p>
                  <p className="text-lg font-bold text-white">{primary.depth_max ? `${primary.depth_max.toFixed(2)}mm` : "0mm"}</p>
               </div>
            </div>
          )}
        </header>

        {activeView === "Dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 bg-[#1e293b] rounded-3xl p-6 border border-slate-800 shadow-xl h-80">
                <h4 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Input Feed</h4>
                <div className="h-56 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                  {preview ? <img src={preview} className="h-full w-full object-cover" /> : <MdUpload className="text-4xl text-slate-700" />}
                </div>
              </div>
              <div className="col-span-5 bg-[#1e293b] rounded-3xl p-6 border border-slate-800 shadow-xl h-80">
                <h4 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Severity Distribution</h4>
                <div className="h-56 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                   {data?.heatmap_b64 ? <img src={`data:image/jpeg;base64,${data.heatmap_b64}`} className="h-full w-full object-contain" alt="Heatmap" /> : <p className="text-slate-700 text-xs font-bold uppercase">Pending Analysis</p>}
                </div>
              </div>
              <div className="col-span-3 space-y-4">
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-800 h-52 flex flex-col items-center justify-center shadow-xl">
                   <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90">
                         <circle cx="56" cy="56" r="48" stroke="#0f172a" strokeWidth="8" fill="transparent" />
                         <circle cx="56" cy="56" r="48" stroke={data?.max_sss >= 4 ? "#ef4444" : "#38bdf8"} strokeWidth="8" fill="transparent" strokeDasharray={301} strokeDashoffset={301 - (301 * (data?.max_sss || 0) / 5)} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold text-white">{data?.max_sss || "0"}</span></div>
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Severity Score</p>
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-800 space-y-1.5 shadow-xl">
                   {SSS_RANGE.map(r => (
                     <div key={r.level} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{background: r.color}} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{r.label}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b] rounded-3xl p-8 border border-slate-800 shadow-xl border-l-4 border-l-[#38bdf8]">
              <h4 className="text-[10px] font-black text-[#38bdf8] uppercase tracking-widest mb-4">Engineering Narrative</h4>
              <p className="text-xl text-slate-200 italic leading-relaxed font-medium">"{narrative || "System ready. Upload drone imagery to begin multi-modal structural reasoning."}"</p>
            </div>
            <div className="flex justify-center gap-6">
               <label className="flex-1 max-w-xs bg-[#38bdf8] hover:bg-white text-[#0f172a] h-16 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all font-bold uppercase text-xs tracking-widest shadow-lg">
                  <MdUpload className="text-xl" /> Start Analysis
                  <input type="file" multiple className="hidden" onChange={handleUpload} />
               </label>
            </div>
          </div>
        )}

        {/* --- QR INSPECTION VIEW --- */}
        {activeView === "QR Inspection" && (
          <div className="h-[700px] animate-in fade-in duration-500 flex items-center justify-center">
             <div className="bg-[#1e293b] rounded-[48px] p-12 border border-slate-800 shadow-2xl text-center max-w-md w-full">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Unit ID Deployment</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-10">Field Personnel Sync Card</p>
                <div className="bg-white p-8 rounded-[32px] inline-block shadow-[0_0_50px_rgba(56,189,248,0.2)] mb-8">
                   {qrData?.qr_b64 ? (
                      <img src={`data:image/png;base64,${qrData.qr_b64}`} className="w-64 h-64" alt="Scan QR" />
                   ) : (
                      <div className="w-64 h-64 flex flex-col items-center justify-center bg-slate-100 rounded-2xl">
                         <MdQrCode className="text-7xl text-slate-300 animate-pulse mb-4" />
                         <p className="text-[9px] text-slate-400 font-black uppercase">Upload for ID Sync</p>
                      </div>
                   )}
                </div>
                <div className="bg-[#0f172a] rounded-2xl p-6 border border-slate-800 text-left space-y-2">
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500 uppercase">Status:</span>
                      <span className={`uppercase ${qrData?.action === "CLOSE NOW" ? "text-red-500" : "text-[#38bdf8]"}`}>{qrData?.action || "Idle"}</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500 uppercase">Sync Code:</span>
                      <span className="text-white font-mono">{primary.id?.substring(0,8) || "SC02-N/A"}</span>
                   </div>
                </div>
                <button onClick={() => window.print()} className="mt-8 text-[10px] font-black text-[#38bdf8] uppercase tracking-widest hover:text-white transition-all">Print deployment card</button>
             </div>
          </div>
        )}

        {/* --- AUTO-ALERTS VIEW --- */}
        {activeView === "Auto-Alerts" && (
          <div className="h-[700px] animate-in fade-in duration-500 flex flex-col gap-6">
             <div className={`p-8 rounded-[48px] border-2 flex items-center gap-8 transition-all ${alertStatus?.alert ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 ${alertStatus?.alert ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-slate-700'}`}>
                   <MdWarning className="text-4xl text-white" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Emergency Signal Protocol</h3>
                   <p className={`text-sm font-bold mt-1 uppercase ${alertStatus?.alert ? 'text-red-400' : 'text-slate-500'}`}>
                      {alertStatus?.message || "Autonomous alert engine initialized and standby."}
                   </p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 flex-grow">
                <div className="bg-[#1e293b] rounded-[48px] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Tactical SMS Log</p>
                   <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 h-64 font-mono text-[11px] leading-relaxed">
                      {alertStatus?.alert ? (
                         <div className="text-red-400">
                            <span className="text-slate-600">[OUTGOING]: </span>
                            "CRITICAL: SSS-5 REACHED AT PILLAR B. IMMEDIATE CLOSURE INITIATED. COORDINATES: 18.06, 73.41."
                         </div>
                      ) : (
                         <p className="text-slate-700 text-center mt-20 italic">No Outgoing Signal Detection</p>
                      )}
                   </div>
                </div>
                <div className="bg-[#1e293b] rounded-[48px] p-10 border border-slate-800 shadow-2xl flex flex-col justify-center items-center opacity-40">
                   <MdReportProblem className="text-6xl text-slate-700 mb-4" />
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email Notification Engine Offline</p>
                </div>
             </div>
          </div>
        )}

        {/* Crack Growth, GPS Map, and Heatmap Overlay remain same */}
        {activeView === "Crack Growth Forecast" && (
           <div className="space-y-6 animate-in fade-in duration-500">
             <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4 bg-[#1e293b] rounded-[32px] p-8 border border-slate-800 shadow-2xl flex flex-col justify-between h-[500px]">
                   <div><h3 className="text-xl font-black text-[#38bdf8] italic uppercase">Structural Lifespan</h3><p className="text-[10px] text-slate-400 font-bold uppercase">Regression Projection</p></div>
                   <div className="text-center py-6"><p className="text-[10px] font-black text-slate-500 uppercase mb-2">Days to Failure</p><h1 className="text-8xl font-black text-white">{forecast?.remaining_days ?? "---"}</h1><div className={`mt-4 inline-block px-4 py-1 rounded-full border text-[10px] font-black uppercase ${forecast?.remaining_days < 60 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{forecast ? forecast.status : "Awaiting Comparison Pair"}</div></div>
                   <div className="bg-[#0f172a] rounded-2xl p-6 border border-slate-800"><div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Growth Rate</span><span className="text-xs font-black text-[#38bdf8]">+{forecast?.velocity || "0"} px²/mo</span></div></div>
                </div>
                <div className="col-span-8 bg-[#1e293b] rounded-[32px] p-8 border border-slate-800 shadow-2xl relative flex flex-col">
                   <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Degradation Curve</h3><label className="bg-[#38bdf8] hover:bg-white text-[#0f172a] px-6 py-2 rounded-full text-[9px] font-black uppercase cursor-pointer transition-all shadow-lg flex items-center gap-2"><MdCompare /> UPLOAD PAIR<input type="file" multiple className="hidden" onChange={handleUpload} /></label></div>
                   <div className="flex-grow w-full bg-[#0f172a] rounded-2xl border border-slate-800 relative flex items-end p-10 overflow-hidden"><svg className="w-full h-full" viewBox="0 0 600 300"><line x1="0" y1="50" x2="600" y2="50" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" /><path d={forecast ? "M 50 250 L 150 210 L 250 170 L 550 40" : "M 50 250 L 550 250"} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" className="transition-all duration-1000"/><circle cx="50" cy="250" r="5" fill="#38bdf8" /><circle cx="250" cy="170" r="5" fill="#38bdf8" className="animate-pulse" /></svg></div>
                </div>
             </div>
           </div>
        )}

        {activeView === "GPS Defect Map" && (
           <div className="h-[750px] animate-in fade-in duration-500 flex flex-col gap-4">
             <div className="bg-[#1e293b] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl relative flex-grow">
                <MapContainer center={[18.0656, 73.4147]} zoom={15} style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%)' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{data?.defects?.map((d, idx) => d.gps && (<Marker key={idx} position={[d.gps.lat, d.gps.lon]}><Popup><div className="p-2 font-sans"><p className="text-xs font-black uppercase text-red-600 border-b pb-1">{d.class_name}</p><p className="text-[10px] text-slate-800 font-bold mt-1">SSS: {d.sss}/5</p></div></Popup></Marker>))}</MapContainer>
             </div>
           </div>
        )}

        {activeView === "Heatmap Overlay" && (
          <div className="flex gap-6 h-[850px] animate-in fade-in zoom-in duration-500">
            <div className="flex-grow bg-[#1e293b] rounded-[48px] p-10 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Tactical 3D Hub</h3><label className="bg-[#38bdf8] text-[#0f172a] px-10 py-3 rounded-full text-xs font-black cursor-pointer shadow-lg tracking-widest">SCAN INVENTORY<input type="file" multiple className="hidden" onChange={handleUpload} /></label></div>
              <div className="flex-grow bg-[#050a18] rounded-[40px] border border-slate-800 relative group overflow-hidden shadow-inner" style={{ perspective: "2000px" }}>{data?.heatmap_b64 ? (<div className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.4)`, filter: `blur(${(151 - blur) / 25}px) opacity(${opacity}%)` }}><img src={`data:image/jpeg;base64,${data.heatmap_b64}`} className="max-h-full max-w-full rounded-lg shadow-[0_80px_150px_rgba(56,189,248,0.25)]" alt="3D" /></div>) : (<div className="h-full flex flex-col items-center justify-center gap-4 text-slate-700"><MdViewInAr className="text-8xl animate-bounce" /><p className="text-xs font-black uppercase tracking-[0.5em]">Awaiting Geometry Reconstruction</p></div>)}</div>
            </div>
            <div className="w-80 flex flex-col gap-4">
              <div className="bg-[#1e293b] rounded-[32px] p-8 border border-slate-800 shadow-xl"><p className="text-[11px] font-black text-[#38bdf8] uppercase tracking-widest mb-8 flex items-center gap-2"><MdSettings className="text-xl" /> Parameters</p><div className="space-y-8"><div><div className="flex justify-between mb-3"><span className="text-[10px] text-slate-400 font-bold uppercase">Heat Diffusion</span><span className="text-[10px] text-white font-mono">{blur}px</span></div><input type="range" min="50" max="250" value={blur} onChange={(e) => setBlur(e.target.value)} className="w-full accent-[#38bdf8] bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer" /></div><div><div className="flex justify-between mb-3"><span className="text-[10px] text-slate-400 font-bold uppercase">Alpha Intensity</span><span className="text-[10px] text-white font-mono">{opacity}%</span></div><input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full accent-[#38bdf8] bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer" /></div></div></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}