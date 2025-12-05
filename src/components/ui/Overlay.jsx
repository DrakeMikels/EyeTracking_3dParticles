import React, { useState } from 'react';
import { useGesture } from '../../context/GestureContext';
import { Heart, Flower, Globe, Zap, User, Sparkles, Hand, Move, Maximize2, PanelLeftClose, PanelLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
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
        <div className="absolute inset-0 pointer-events-none z-10 p-6 overflow-hidden">

            {/* Toggle Button - Always Visible */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setPanelOpen(!panelOpen)}
                className={cn(
                    "pointer-events-auto fixed top-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-lg",
                    panelOpen ? "left-[20.5rem]" : "left-6"
                )}
            >
                {panelOpen ? <PanelLeftClose className="h-5 w-5 opacity-70" /> : <PanelLeft className="h-5 w-5 opacity-70" />}
            </Button>

            {/* Left Side Panel */}
            <div
                className={cn(
                    "pointer-events-auto fixed left-6 top-6 bottom-6 w-80 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    panelOpen ? "translate-x-0 opacity-100 scale-100" : "-translate-x-[120%] opacity-0 scale-95"
                )}
            >
                <div className="h-full flex flex-col rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5">
                    
                    {/* Header */}
                    <div className="p-6 pb-2 border-b border-white/5">
                        <div className="flex items-center justify-between mb-1">
                            <h1 className="text-xl font-medium tracking-tight text-white/90">Particle Morph</h1>
                            <div className={cn(
                                "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-500",
                                gestureState.isHandDetected ? "bg-emerald-400 shadow-emerald-400/50" : "bg-white/10"
                            )} />
                        </div>
                        <p className="text-sm font-medium text-white/40 tracking-wide">
                            {gestureState.isHandDetected ? 'Active Control' : 'Waiting for Hand'}
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">

                        {/* Gestures Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Gestures</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>

                            <div className="grid gap-3">
                                <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-4 transition-all hover:bg-white/10 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/80 to-rose-600/80 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
                                            <Maximize2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white/90">Close Hand</p>
                                            <p className="text-xs text-white/40">Fist expands particles</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-4 transition-all hover:bg-white/10 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/80 to-indigo-600/80 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                                            <Move className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white/90">Move Hand</p>
                                            <p className="text-xs text-white/40">Controls rotation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tension Indicator */}
                            <div className={cn(
                                "p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500",
                                gestureState.isHandDetected ? "opacity-100" : "opacity-30 blur-[1px]"
                            )}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-white/50">Fist Tension</span>
                                    <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{Math.round(gestureState.tension * 100)}%</span>
                                </div>
                                <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ width: `${gestureState.tension * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shapes Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Shape</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>
                            
                            <ToggleGroup
                                type="single"
                                value={currentShape}
                                onValueChange={(val) => val && setCurrentShape(val)}
                                className="grid grid-cols-3 gap-2"
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
                                                "flex flex-col items-center justify-center h-20 rounded-2xl border transition-all duration-300",
                                                isActive 
                                                    ? "bg-white/15 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.02]" 
                                                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/70"
                                            )}
                                        >
                                            <Icon className={cn("h-5 w-5 mb-2 transition-transform duration-300", isActive && "scale-110")} />
                                            <span className="text-[9px] font-medium tracking-wide uppercase">{shape.label}</span>
                                        </ToggleGroupItem>
                                    );
                                })}
                            </ToggleGroup>
                        </div>

                        {/* Colors Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Color</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((color) => {
                                    const isSelected = particleColor === color.hex;
                                    return (
                                        <button
                                            key={color.hex}
                                            onClick={() => setParticleColor(color.hex)}
                                            className={cn(
                                                "aspect-square rounded-2xl transition-all duration-300 relative group",
                                                isSelected ? "scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent" : "hover:scale-105 opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            <div 
                                                className="absolute inset-0 rounded-2xl opacity-40 blur-sm transition-opacity group-hover:opacity-70"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <div 
                                                className="absolute inset-[2px] rounded-xl border border-white/10"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Custom Color */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden group transition-transform hover:scale-105 active:scale-95">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl" />
                                    <div className="absolute inset-[3px] rounded-xl bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500 opacity-80 group-hover:opacity-100 transition-opacity" />
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
