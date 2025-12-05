import React, { useState } from 'react';
import { useGesture } from '../../context/GestureContext';
import { Heart, Flower, Globe, Zap, User, Sparkles, Hand, Move, Maximize2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const SHAPES = [
    { id: 'sphere', icon: Globe, label: 'Sphere' },
    { id: 'earth', icon: Globe, label: 'Earth' },
    { id: 'heart', icon: Heart, label: 'Heart' },
    { id: 'flower', icon: Flower, label: 'Flower' },
    { id: 'saturn', icon: Zap, label: 'Saturn' },
    { id: 'buddha', icon: User, label: 'Buddha' },
    { id: 'fireworks', icon: Sparkles, label: 'Fireworks' },
];

const COLORS = [
    { hex: '#ff0055', name: 'Hot Pink' },
    { hex: '#00ff66', name: 'Neon Green' },
    { hex: '#00bbff', name: 'Cyan' },
    { hex: '#ffaa00', name: 'Orange' },
    { hex: '#cc00ff', name: 'Magenta' },
    { hex: '#ffff00', name: 'Yellow' },
    { hex: '#ffffff', name: 'White' },
];

export default function Overlay() {
    const { currentShape, setCurrentShape, particleColor, setParticleColor, gestureState } = useGesture();
    const [panelOpen, setPanelOpen] = useState(true);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 p-6 overflow-hidden font-sans">

            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setPanelOpen(!panelOpen)}
                className={cn(
                    "pointer-events-auto fixed top-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "h-10 w-10 rounded-full bg-[#0a0a0a]/90 text-white border border-white/10 shadow-[0_0_15px_rgba(0,100,255,0.15)] hover:shadow-[0_0_25px_rgba(0,100,255,0.3)]",
                    panelOpen ? "left-[20.5rem]" : "left-6"
                )}
            >
                {panelOpen ? <PanelLeftClose className="h-5 w-5 opacity-90" /> : <PanelLeft className="h-5 w-5 opacity-90" />}
            </Button>

            {/* Left Side Panel */}
            <div
                className={cn(
                    "pointer-events-auto fixed left-6 top-6 bottom-6 w-80 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    panelOpen ? "translate-x-0 opacity-100 scale-100" : "-translate-x-[120%] opacity-0 scale-95"
                )}
            >
                {/* Main Glass Container */}
                <div className="h-full flex flex-col rounded-[2rem] bg-[#050505]/80 backdrop-blur-3xl border border-white/5 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/5">
                    
                    {/* Top Gradient Glow Line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="p-6 pb-4 relative border-b border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-xl font-light tracking-wide text-white">Particle Morph</h1>
                            <div className={cn(
                                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-500",
                                gestureState.isHandDetected ? "bg-cyan-400 text-cyan-400" : "bg-white/20 text-white/20"
                            )} />
                        </div>
                        <p className="text-xs font-medium text-white/40 tracking-widest uppercase">
                            {gestureState.isHandDetected ? 'System Active' : 'System Idle'}
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-8 p-6 pt-6 overflow-y-auto custom-scrollbar">

                        {/* Gestures Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Controls</span>
                            </div>

                            <div className="grid gap-3">
                                {/* Gesture Card 1 */}
                                <div className="group relative overflow-hidden rounded-xl bg-[#0a0a0a] p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,100,255,0.15)] border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                            <Maximize2 className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white/90">Expansion</p>
                                            <p className="text-[11px] text-white/40 mt-0.5">Clench fist to expand</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gesture Card 2 */}
                                <div className="group relative overflow-hidden rounded-xl bg-[#0a0a0a] p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,100,255,0.15)] border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                            <Move className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white/90">Rotation</p>
                                            <p className="text-[11px] text-white/40 mt-0.5">Move hand to rotate</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tension Bar */}
                            <div className={cn(
                                "mt-2 p-4 rounded-xl bg-[#0a0a0a] border border-white/5 transition-all duration-500 relative overflow-hidden",
                                gestureState.isHandDetected ? "opacity-100" : "opacity-40 grayscale"
                            )}>
                                <div className="flex items-center justify-between mb-2 relative z-10">
                                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Force</span>
                                    <span className="text-[10px] font-mono text-cyan-400">{Math.round(gestureState.tension * 100)}%</span>
                                </div>
                                <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-100 ease-out"
                                        style={{ width: `${gestureState.tension * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shapes Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Shapes</span>
                            </div>
                            
                            <ToggleGroup
                                type="single"
                                value={currentShape}
                                onValueChange={(val) => val && setCurrentShape(val)}
                                className="flex flex-wrap gap-2"
                            >
                                {SHAPES.map((shape) => {
                                    const Icon = shape.icon;
                                    const isActive = currentShape === shape.id;
                                    return (
                                        <ToggleGroupItem
                                            key={shape.id}
                                            value={shape.id}
                                            aria-label={shape.label}
                                            className={cn(
                                                "flex-grow basis-[30%] h-14 rounded-xl border transition-all duration-500 relative overflow-hidden group",
                                                isActive 
                                                    ? "bg-white/[0.03] border-cyan-500/30 text-cyan-50 shadow-[0_0_20px_rgba(0,200,255,0.15)]" 
                                                    : "bg-[#0a0a0a] border-white/5 text-white/30 hover:border-white/10 hover:text-white/60"
                                            )}
                                        >
                                            {isActive && <div className="absolute inset-0 bg-cyan-500/10 blur-md" />}
                                            <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                                <Icon className={cn("h-4 w-4 transition-transform duration-500", isActive && "scale-110 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]")} />
                                                <span className="text-[9px] font-medium tracking-wider uppercase">{shape.label}</span>
                                            </div>
                                        </ToggleGroupItem>
                                    );
                                })}
                            </ToggleGroup>
                        </div>

                        {/* Colors Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Colors</span>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((color) => {
                                    const isSelected = particleColor === color.hex;
                                    return (
                                        <button
                                            key={color.hex}
                                            onClick={() => setParticleColor(color.hex)}
                                            className={cn(
                                                "aspect-square rounded-full transition-all duration-500 relative group",
                                                isSelected ? "scale-100" : "scale-90 opacity-60 hover:opacity-100 hover:scale-95"
                                            )}
                                        >
                                            <div 
                                                className="absolute inset-0 rounded-full border border-white/10 bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
                                            >
                                                <div 
                                                    className="w-4 h-4 rounded-full shadow-sm transition-all duration-500"
                                                    style={{ 
                                                        backgroundColor: color.hex,
                                                        boxShadow: isSelected ? `0 0 15px ${color.hex}` : 'none',
                                                        transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                                                    }}
                                                />
                                            </div>
                                            {isSelected && (
                                                <div className="absolute inset-0 rounded-full border border-white/20 ring-1 ring-white/10" />
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Custom Color */}
                                <div className="relative aspect-square rounded-full overflow-hidden group transition-transform hover:scale-95 scale-90 opacity-60 hover:opacity-100">
                                    <div className="absolute inset-0 bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 opacity-80" />
                                    </div>
                                    <input
                                        type="color"
                                        value={particleColor}
                                        onChange={(e) => setParticleColor(e.target.value)}
                                        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                                        title="Custom Color"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
