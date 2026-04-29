import React, { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, Text, Stage, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Move, RotateCcw, ZoomIn, Info } from 'lucide-react';
import { DesignConcept } from '../types';

interface Viewer3DProps {
  design: DesignConcept;
  onClose: () => void;
}

const PanoramicRoom = ({ imageUrl }: { imageUrl: string }) => {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return (
    <group>
      {/* 360 degree sphere with texture on the inside */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Subtle lighting to add depth to the sphere highlights */}
      <ambientLight intensity={0.5} />
    </group>
  );
};

export default function Viewer3D({ design, onClose }: Viewer3DProps) {
  const [showControls, setShowControls] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col font-sans"
    >
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 h-16 px-8 flex justify-between items-center z-10 bg-[#0d0d0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
            360° Immersive Interior
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div>
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">{design.style} Vision</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          id="close-viewer-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Floating HUD */}
      <div className="absolute top-24 left-8 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 text-[10px] font-mono text-brand-accent">
          VIEWPOINT: CENTERED | MODE: FIRST-PERSON
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 text-[10px] font-mono text-white/50 italic">
          360° PANORAMA ACTIVE
        </div>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} />
          
          <Suspense fallback={null}>
            <PanoramicRoom imageUrl={design.url} />
          </Suspense>

          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={0.01} 
            maxDistance={5}
            rotateSpeed={-0.5} // Negative to fix mirror rotation feel in sphere
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Control Help Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 glass-panel rounded-2xl flex items-center gap-6"
          >
            <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-widest">
              <RotateCcw size={14} /> <span>Look: Drag / Swipe</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-widest">
              <ZoomIn size={14} /> <span>Zoom: Scroll</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <button 
              onClick={() => setShowControls(false)}
              className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!showControls && (
        <button 
          onClick={() => setShowControls(true)}
          className="absolute bottom-6 right-6 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-white"
        >
          <Info size={20} />
        </button>
      )}
    </motion.div>
  );
}
