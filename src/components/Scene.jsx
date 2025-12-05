import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './ParticleSystem';
import Earth from './Earth';
import GameManager from './Game/GameManager';
import { useGesture } from '../context/GestureContext';

function SceneContent() {
    const { currentShape } = useGesture();

    return (
        <>
            {currentShape === 'earth' ? <Earth /> : <ParticleSystem />}
            
            {currentShape === 'game' && <GameManager />}

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.8}
                    luminanceSmoothing={0.1}
                    intensity={0.3}
                    radius={0.1}
                />
            </EffectComposer>

            {/* Lighting for Earth and Game */}
            <ambientLight intensity={0.1} />
            <directionalLight position={[5, 3, 5]} intensity={1.5} />
        </>
    );
}

export default function Scene() {
    return (
        <div className="w-full h-full absolute inset-0 bg-black">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                }}
            >
                <color attach="background" args={['#000005']} />

                <Suspense fallback={null}>
                    <SceneContent />
                </Suspense>

                <OrbitControls
                    makeDefault
                    enablePan={false}
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={15}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
}
