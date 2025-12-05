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

    return (
        <GestureContext.Provider value={{
            gestureState, setGestureState,
            currentShape, setCurrentShape,
            particleColor, setParticleColor
        }}>
            {children}
        </GestureContext.Provider>
    );
}

export function useGesture() {
    return useContext(GestureContext);
}
