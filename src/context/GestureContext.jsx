import React, { createContext, useContext, useState } from 'react';

const GestureContext = createContext();

export function GestureProvider({ children }) {
    const [gestureState, setGestureState] = useState({
        tension: 0,           // 0 = open hand, 1 = closed fist
        isHandDetected: false,
        position: { x: 0, y: 0 },  // -1 to 1, hand position in frame
    });
    const [currentShape, setCurrentShape] = useState('sphere');
    const [particleColor, setParticleColor] = useState('#ff0066');
    const [gameState, setGameState] = useState({
        isPlaying: false,
        score: 0,
        highScore: 0,
        gameMode: 'intro', // 'intro', 'playing', 'gameover'
    });

    // Helper to reset game state
    const resetGame = () => {
        console.log("Resetting game state to Intro");
        setGameState(prev => ({ ...prev, gameMode: 'intro', isPlaying: false, score: 0 }));
    };

    return (
        <GestureContext.Provider value={{
            gestureState, setGestureState,
            currentShape, setCurrentShape,
            particleColor, setParticleColor,
            gameState, setGameState,
            resetGame
        }}>
            {children}
        </GestureContext.Provider>
    );
}

export function useGesture() {
    return useContext(GestureContext);
}
