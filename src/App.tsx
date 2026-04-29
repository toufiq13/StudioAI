/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, Zap, Image as ImageIcon, Box, ChevronRight, Grid3X3, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DesignConcept, AppView, STYLE_PRESETS, StylePreset } from './types';
import { enhancePrompt } from './lib/gemini';
import Viewer3D from './components/Viewer3D';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [view, setView] = useState<AppView>('generator');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<DesignConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<DesignConcept | null>(null);
  const [generationStep, setGenerationStep] = useState('');

  const generateDesign = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setConcepts([]);
    setGenerationStep('Enhancing your vision with AI...');
    
    try {
      // 1. Enhance the prompt using Gemini
      const enhancedBase = await enhancePrompt(prompt, selectedStyle.keywords);
      
      const newConcepts: DesignConcept[] = [];
      const count = 3; // Generating 3 variations
      
      for (let i = 0; i < count; i++) {
        setGenerationStep(`Painting concept ${i + 1} of ${count}...`);
        
        // Slightly vary the prompt for each variation to get variety
        const variations = [
          "Include a wide-angle ceiling and polished floor view.",
          "Capture a complex wide-angle furniture arrangement and material textures.",
          "Show a bright wide-angle room layout with detailed window views."
        ];
        
        const finalPrompt = `${enhancedBase} ${variations[i]}`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: finalPrompt }],
          },
        });
        
        let imageUrl = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
        
        if (imageUrl) {
          newConcepts.push({
            id: crypto.randomUUID(),
            url: imageUrl,
            prompt: finalPrompt,
            style: selectedStyle.name,
            timestamp: Date.now(),
          });
        }
      }
      
      setConcepts(newConcepts);
      setView('gallery');
    } catch (error) {
      console.error("Design generation failed:", error);
      alert("Something went wrong with the AI generation. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSelectConcept = (concept: DesignConcept) => {
    setSelectedConcept(concept);
    setView('viewer');
  };

  const resetAll = () => {
    setView('generator');
    setConcepts([]);
    setSelectedConcept(null);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-brand-accent selection:text-white font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 px-8 h-16 flex items-center justify-between bg-[#0d0d0f]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll} id="nav-logo">
          <div className="w-8 h-8 bg-brand-accent flex items-center justify-center rounded-lg cyan-shadow transition-all">
            <Box size={18} className="text-black" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white uppercase italic">STUDIO<span className="text-brand-accent">AI</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <button className="text-brand-accent border-b-2 border-brand-accent pb-5 translate-y-[10px]">Generator</button>
            <button className="hover:text-white transition-colors">Gallery</button>
            <button className="hover:text-white transition-colors">Architecture</button>
          </div>
          {view !== 'generator' && (
            <button 
              onClick={() => setView('generator')}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full"
              id="new-design-btn"
            >
              <RefreshCcw size={14} /> New Design
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          {view === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero */}
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-widest"
                >
                  <Sparkles size={12} /> Powered by Gemini
                </motion.div>
                <h1 className="text-6xl md:text-7xl font-display font-bold leading-[0.9] tracking-tighter">
                  Architectural <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Dreams</span> 
                  <br />Realized.
                </h1>
                <p className="text-white/60 text-lg font-light leading-relaxed">
                  Enter a vision of your perfect space. Our AI will craft high-fidelity concepts and immersive 3D environments for you to explore.
                </p>
              </div>

              {/* Input Area */}
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Design Prompt</label>
                    <span className="text-[10px] text-brand-accent font-semibold italic">AI Optimization Active</span>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your dream space..."
                      className="w-full min-h-[140px] bg-bg-input border border-white/10 rounded-xl p-6 text-sm text-slate-200 focus:outline-none focus:border-brand-accent/50 transition-all resize-none placeholder:text-slate-600"
                      id="prompt-input"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                       <button 
                        onClick={() => setPrompt("Modern luxury penthouse master bedroom with floor-to-ceiling windows, dark oak paneling, and warm ambient backlighting.")}
                        className="p-2 bg-brand-accent/10 rounded-md text-brand-accent hover:bg-brand-accent/20 transition-colors"
                        title="Try Example"
                       >
                         <Zap size={16} />
                       </button>
                    </div>
                  </div>
                </div>

                {/* Style Presets */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Style Preset</label>
                    <span className="text-[10px] text-brand-accent font-semibold">{selectedStyle.name} Selected</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedStyle.id === style.id 
                            ? 'bg-brand-accent/10 border border-brand-accent/30 text-brand-accent' 
                            : 'bg-bg-input border border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                        id={`style-${style.id}`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    disabled={!prompt.trim() || isGenerating}
                    onClick={generateDesign}
                    className={`group w-full max-w-md relative overflow-hidden py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                      !prompt.trim() || isGenerating
                        ? 'opacity-50 cursor-not-allowed bg-white/5 text-slate-500'
                        : 'bg-brand-accent text-black hover:bg-cyan-400 active:scale-[0.98]'
                    }`}
                    id="generate-btn"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Processing Neural Design...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Design Concept</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <button onClick={() => setView('generator')} className="text-white/40 hover:text-brand-accent flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4">
                    <ArrowLeft size={14} /> Back to creator
                  </button>
                  <h2 className="text-4xl font-display font-bold tracking-tight text-white italic">Design <span className="text-brand-accent">Iterations</span></h2>
                  <p className="text-slate-500 text-sm">Select a variation to explore in the interactive viewport</p>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={generateDesign}
                    className="px-6 py-2 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
                    id="regenerate-btn"
                   >
                     Regenerate Selection
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {concepts.map((concept, idx) => (
                  <motion.div
                    key={concept.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-slate-950/40 cursor-pointer hover:border-brand-accent/50 transition-all duration-300">
                      <img 
                        src={concept.url} 
                        alt={concept.style}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[10px] text-brand-accent font-bold uppercase tracking-widest">Variation {idx + 1}</div>
                            <div className="text-[9px] text-slate-500 truncate max-w-[120px]">{concept.style} Palette</div>
                          </div>
                          <button
                            onClick={() => handleSelectConcept(concept)}
                            className="p-3 bg-brand-accent text-black rounded-xl transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Box size={14} /> Enter Room
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3D Viewer Modal */}
      <AnimatePresence>
        {view === 'viewer' && selectedConcept && (
          <Viewer3D design={selectedConcept} onClose={() => setView('gallery')} />
        )}
      </AnimatePresence>

      {/* Global Loader Backdrop */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-8"
          >
            <div className="relative w-32 h-32">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-brand-accent/30 rounded-3xl"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-2 border-white/20 rounded-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-brand-accent animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-display font-medium tracking-tight">Crafting Your Vision</h3>
              <p className="text-white/40 text-sm font-mono tracking-wider">{generationStep}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-8 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="w-6 h-6 bg-white flex items-center justify-center rounded-lg rotate-12">
              <Box size={14} className="text-black -rotate-12" />
            </div>
            <span className="font-display font-bold text-sm tracking-tighter uppercase italic">LuminaDesign</span>
          </div>
          <div className="flex gap-8 items-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">
            <span>Spatial Engine v1.0</span>
            <span>Gemini Multimodal pipeline</span>
            <span>© 2026 LuminaDesign Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
