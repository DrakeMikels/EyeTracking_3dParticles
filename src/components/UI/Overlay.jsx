import React, { useState } from 'react';
import { useGesture } from '../../context/GestureContext';
import { Heart, Flower, Globe, Zap, User, Sparkles, Hand, Move, Maximize2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div className="absolute inset-0 pointer-events-none z-10 p-4">

            {/* Toggle Button - Always Visible */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setPanelOpen(!panelOpen)}
                className={cn(
                    "pointer-events-auto fixed top-4 z-20 transition-all duration-300 bg-background/80 backdrop-blur-xl border-border/50",
                    panelOpen ? "left-[21rem]" : "left-4"
                )}
            >
                {panelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            {/* Left Side Panel */}
            <div
                className={cn(
                    "pointer-events-auto fixed left-4 top-4 bottom-4 w-80 transition-all duration-300 ease-out",
                    panelOpen ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0"
                )}
            >
                <Card className="h-full bg-background/80 backdrop-blur-xl border-border/50 flex flex-col">

                    {/* Header */}
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Particle Morph</CardTitle>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full transition-colors",
                                gestureState.isHandDetected ? "bg-green-500" : "bg-muted-foreground/30"
                            )} />
                        </div>
                        <CardDescription>
                            {gestureState.isHandDetected ? 'Hand tracking active' : 'Show your hand to camera'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto">

                        {/* Gestures Section */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gestures</p>

                            <div className="grid gap-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                                        <Maximize2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Close Hand</p>
                                        <p className="text-xs text-muted-foreground">Make a fist to expand particles</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <Move className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Move Hand</p>
                                        <p className="text-xs text-muted-foreground">Hand position controls rotation</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tension Indicator */}
                            <div className={cn("space-y-2 transition-opacity", gestureState.isHandDetected ? "opacity-100" : "opacity-40")}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Intensity</span>
                                    <span className="text-xs font-mono text-muted-foreground">{Math.round(gestureState.tension * 100)}%</span>
                                </div>
                                <Slider
                                    value={[gestureState.tension * 100]}
                                    max={100}
                                    step={1}
                                    disabled
                                    className="cursor-default"
                                />
                            </div>
                        </div>

                        {/* Shapes Section */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shape</p>
                            <ToggleGroup
                                type="single"
                                value={currentShape}
                                onValueChange={(val) => val && setCurrentShape(val)}
                                className="grid grid-cols-3 gap-2"
                            >
                                {SHAPES.map((shape) => {
                                    const Icon = shape.icon;
                                    return (
                                        <ToggleGroupItem
                                            key={shape.id}
                                            value={shape.id}
                                            aria-label={shape.label}
                                            className="flex flex-col items-center justify-center h-auto py-3 px-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                        >
                                            <Icon className="h-5 w-5 mb-1" />
                                            <span className="text-[10px] font-medium">{shape.label}</span>
                                        </ToggleGroupItem>
                                    );
                                })}
                            </ToggleGroup>
                        </div>

                        {/* Colors Section */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.hex}
                                        onClick={() => setParticleColor(color.hex)}
                                        className={cn(
                                            "w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
                                            particleColor === color.hex && "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                                        )}
                                        style={{
                                            backgroundColor: color.hex,
                                            boxShadow: `0 4px 14px ${color.hex}50`
                                        }}
                                        title={color.name}
                                    />
                                ))}

                                {/* Custom Color */}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500 hover:scale-105 active:scale-95 transition-transform">
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

                        {/* Footer */}
                        <div className="mt-auto pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Hand className="h-3.5 w-3.5" />
                                <span className="text-xs">
                                    {gestureState.isHandDetected ? 'Tracking your hand...' : 'Waiting for hand detection'}
                                </span>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
