import React, { useState } from 'react';
import { Shield, Plane, Activity, Settings, AlertTriangle, Database, FileText, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDView from './components/ThreeDView';

export default function SiteSenseDashboard() {
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, RESULT

  const startAnalysis = () => {
    setStatus('SCANNING');
    setTimeout(() => setStatus('RESULT'), 3000); // Simulated AI Processing
  };

  return (
    <div className="flex h-screen w-full bg-[#05070A] text-slate-200 font-sans overflow-hidden">
      
      {/* 1. CYBER SIDEBAR */}
      <aside className="w-20 flex flex-col items-center py-8 border-r border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mb-12 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"><Shield size={32} /></div>
        <div className="flex flex-col gap-10">
          <button className="text-blue-400"><Plane size={24} /></button>
          <button className="text-slate-600 hover:text-white transition-all"><Activity size={24} /></button>
          <button className="text-slate-600 hover:text-white transition-all"><Database size={24} /></button>
          <button className="text-slate-600 hover:text-white mt-auto transition-all"><Settings size={24} /></button>
        </div>
      </aside>

      {/* 2. MAIN OPERATION CENTER */}
      <main className="flex-1 flex flex-col p-6 relative">
        
        {/* Dynamic Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic">SITESENSE <span className="text-blue-500">PRO</span></h1>
            <div className="flex gap-2 items-center text-[10px] uppercase tracking-widest text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> SYSTEM_LIVE // NODE_01
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="text-[9px] text-slate-500 uppercase">Latency</p>
                <p className="text-xs font-mono text-blue-400">14MS</p>
             </div>
             <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="text-[9px] text-slate-500 uppercase">AI Confidence</p>
                <p className="text-xs font-mono text-emerald-400">98.2%</p>
             </div>
          </div>
        </div>

        {/* VIEWPORT AREA */}
        <div className="flex-1 bg-[#090B11] border border-white/10 rounded-2xl relative overflow-hidden group">
          
          {/* HUD CORNERS */}
          <div className="absolute top-4 left-4 z-20 border-l border-t border-blue-500/50 w-10 h-10"></div>
          <div className="absolute bottom-4 right-4 z-20 border-r border-b border-blue-500/50 w-10 h-10"></div>

          <AnimatePresence mode="wait">
            {status === 'IDLE' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center mb-6 bg-white/[0.02]">
                  <Cpu size={48} className="text-slate-700" />
                </div>
                <button onClick={startAnalysis} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95">
                  INITIALIZE 3D ANALYSIS
                </button>
              </motion.div>
            )}

            {status === 'SCANNING' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center">
                <div className="relative">
                  <RefreshCw className="animate-spin text-blue-500 mb-4" size={64} />
                  <motion.div animate={{scale:[1,1.5,1], opacity:[0.5,0,0.5]}} transition={{repeat:Infinity, duration:2}} className="absolute inset-0 bg-blue-500 rounded-full blur-xl" />
                </div>
                <p className="font-mono text-blue-400 tracking-[0.5em] animate-pulse">EXTRACTING DEPTH MAP</p>
              </motion.div>
            )}

            {status === 'RESULT' && (
              <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="h-full w-full">
                <ThreeDView />
                <div className="absolute top-10 right-10 bg-black/60 backdrop-blur-md p-4 border border-white/10 rounded-xl text-[10px] font-mono text-blue-300">
                  <p>POINT_CLOUD: GENERATED</p>
                  <p>MESH_STATUS: STABLE</p>
                  <p>DEFECTS: 02 DETECTED</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. SEVERITY ANALYTICS PANEL */}
      <aside className="w-80 p-6 bg-black/20 border-l border-white/5 flex flex-col gap-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Telemetry</h2>
        
        {/* Severity Card */}
        <motion.div whileHover={{x:-5}} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-red-500/20 text-red-500 rounded-bl-xl"><AlertTriangle size={14}/></div>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Critical Defect</p>
          <h3 className="text-white font-bold mt-1 text-sm italic">Structural Fissure #09</h3>
          <div className="mt-4 flex items-end justify-between">
            <div>
               <p className="text-[9px] text-slate-500">Severity Score</p>
               <p className="text-2xl font-black text-red-500">8.4<span className="text-xs text-slate-600">/10</span></p>
            </div>
            <button className="p-2 bg-blue-600 rounded-lg text-white"><Zap size={14}/></button>
          </div>
        </motion.div>

        <button className="mt-auto w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
          <FileText size={16} className="text-blue-500"/> Export Technical Report
        </button>
      </aside>

    </div>
  );
}

// Small missing icon import
import { RefreshCw } from 'lucide-react';