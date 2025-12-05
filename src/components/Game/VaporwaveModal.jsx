import React from 'react';
import { useGesture } from '../../context/GestureContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Trophy, X, Skull } from 'lucide-react';

export default function VaporwaveModal() {
    const { currentShape, gameState, setGameState, setCurrentShape } = useGesture();

    console.log('VaporwaveModal Render Check:', { currentShape, gameMode: gameState.gameMode });

    // Only show modal if in game mode AND state is intro or gameover
    if (currentShape !== 'game') return null;
    if (gameState.gameMode === 'playing') return null;

    const startGame = () => {
        console.log('Starting Game...'); // Debug log
        setGameState(prev => ({ ...prev, gameMode: 'playing', score: 0 }));
    };

    const exitGame = () => {
        console.log('Exiting Game...'); // Debug log
        setCurrentShape('sphere');
        setGameState(prev => ({ ...prev, gameMode: 'intro' }));
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border-2 border-[#ff00ff] bg-[#050510] shadow-[0_0_40px_rgba(255,0,255,0.3)] p-1">
                
                {/* Scanlines Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] opacity-20" />
                
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20 z-0" 
                     style={{ 
                         backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, .3) 25%, rgba(0, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .3) 75%, rgba(0, 255, 255, .3) 76%, transparent 77%, transparent)',
                         backgroundSize: '50px 50px'
                     }} 
                />

                <div className="relative z-10 p-8 flex flex-col items-center text-center">
                    
                    {gameState.gameMode === 'gameover' && (
                        <div className="mb-6 animate-pulse">
                            <h2 className="text-4xl font-black italic tracking-wider text-red-500 drop-shadow-[4px_4px_0_rgba(0,255,255,1)] font-mono">
                                GAME OVER
                            </h2>
                            <p className="text-cyan-400 font-mono mt-2 text-lg">SCORE: {gameState.score}</p>
                        </div>
                    )}

                    {gameState.gameMode === 'intro' && (
                        <div className="mb-8 space-y-2">
                            <h2 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,0.8)] animate-gradient-x pb-2">
                                COSMIC COLLECTOR
                            </h2>
                            <p className="text-cyan-300 font-mono text-xs tracking-[0.3em] uppercase">
                                // SYSTEM_READY //
                            </p>
                        </div>
                    )}

                    <div className="w-full bg-black/50 border border-cyan-500/30 rounded-lg p-6 mb-8 backdrop-blur-md">
                        <h3 className="text-cyan-400 font-bold uppercase tracking-wider mb-4 text-sm border-b border-cyan-500/30 pb-2">
                            Mission Briefing
                        </h3>
                        <ul className="space-y-3 text-left text-sm font-mono text-pink-200">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#fbbf24]" />
                                <span>Move Hand to control the <strong className="text-yellow-400">Black Hole</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                <span>Collect <strong className="text-cyan-400">Stardust</strong> to score points</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                                <span>Avoid <strong className="text-red-500">Antimatter</strong> (Red Orbs)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Skull className="w-4 h-4 text-red-500" />
                                <span><strong className="text-red-500">Open Hand</strong> lets antimatter pass through safely</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button 
                            onClick={exitGame}
                            className="flex-1 bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500/20 font-mono uppercase tracking-wider h-12 rounded-none skew-x-[-10deg]"
                        >
                            <span className="skew-x-[10deg]">Abort</span>
                        </Button>
                        <Button 
                            onClick={startGame}
                            className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-widest h-12 rounded-none skew-x-[-10deg] shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="skew-x-[10deg] flex items-center justify-center gap-2">
                                <Play className="w-4 h-4 fill-current" />
                                Insert Coin
                            </span>
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

