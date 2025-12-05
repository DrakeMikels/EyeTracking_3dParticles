import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './ParticleSystem';
import Earth from './Earth';
import CyberCrystal from './CyberCrystal';
import Ferrofluid from './Ferrofluid';
import GameManager from './Game/GameManager';
import { useGesture } from '../context/GestureContext';

function SceneContent() {
    const { currentShape } = useGesture();

    return (
        <>
            {/* Global Environment for Reflections (Critical for Crystal & Ferrofluid) */}
            <Environment preset="warehouse" background={false} />

            {currentShape === 'earth' ? <Earth /> : 
             currentShape === 'crystal' ? <CyberCrystal /> : 
             currentShape === 'ferrofluid' ? <Ferrofluid /> :
             <ParticleSystem />}
            
            {currentShape === 'game' && <GameManager />}

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.8}
                    luminanceSmoothing={0.1}
                    intensity={0.4}
                    radius={0.2}
                />
            </EffectComposer>

            {/* Lighting for Earth and Game */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 3, 5]} intensity={1.5} />
            <pointLight position={[-5, -3, -5]} intensity={0.5} color="#0040ff" />
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
                    powerPreference: 'high-performance',
                    toneMapping: 3 // ACESFilmicToneMapping for better HDR
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
