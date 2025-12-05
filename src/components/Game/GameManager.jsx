import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGesture } from '../../context/GestureContext';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const GAME_BOUNDS = 3; // Range for spawning (-3 to 3)
const SPAWN_RATE = 60; // Frames between spawns
const PLAYER_RADIUS = 0.3;
const COLLECTION_RADIUS = 0.4;

export default function GameManager() {
    const { gestureState, gameState, setGameState, currentShape } = useGesture();
    const targetsRef = useRef([]);
    const [targets, setTargets] = useState([]); // { id, position: [x,y,z], type: 'gold' | 'antimatter', active: true }
    const frameCount = useRef(0);
    const scoreRef = useRef(0); // Ref for frequent updates without re-renders
    
    // Audio Refs (simple oscillators could be added here, but sticking to visual for now)

    // Reset game when mode changes to playing
    useEffect(() => {
        if (gameState.gameMode === 'playing') {
            setTargets([]);
            targetsRef.current = [];
            scoreRef.current = 0;
            frameCount.current = 0;
        }
    }, [gameState.gameMode]);

    useFrame((state, delta) => {
        if (currentShape !== 'game' || gameState.gameMode !== 'playing') return;

        frameCount.current++;

        // 1. Spawning Logic
        if (frameCount.current % SPAWN_RATE === 0) {
            const isAntimatter = Math.random() > 0.7; // 30% chance of bad guy
            const newTarget = {
                id: Math.random(),
                position: [
                    (Math.random() - 0.5) * GAME_BOUNDS * 2,
                    (Math.random() - 0.5) * GAME_BOUNDS * 2,
                    (Math.random() - 0.5) * 2 // Shallow depth
                ],
                type: isAntimatter ? 'antimatter' : 'gold',
                active: true,
                scale: 0
            };
            
            setTargets(prev => [...prev, newTarget]);
            targetsRef.current.push(newTarget);
        }

        // 2. Movement & Collision Logic
        // Hand position mapped from gestureState (-1 to 1) to World Space (~ -4 to 4)
        const handX = gestureState.position.x * 4;
        const handY = gestureState.position.y * 3; // Aspect ratio adj
        const handZ = 0;

        // Check collisions
        let scoreChanged = false;
        
        targetsRef.current.forEach(target => {
            if (!target.active) return;

            // Simple attraction to hand
            const dx = handX - target.position[0];
            const dy = handY - target.position[1];
            const dz = handZ - target.position[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // Move towards hand if close (Magnetic effect)
            if (dist < 2.0) {
                target.position[0] += dx * delta * 1.5;
                target.position[1] += dy * delta * 1.5;
                target.position[2] += dz * delta * 1.5;
            }

            // Collision
            if (dist < COLLECTION_RADIUS) {
                if (target.type === 'gold') {
                    scoreRef.current += 100;
                    target.active = false;
                    scoreChanged = true;
                } else if (target.type === 'antimatter') {
                    // If hand is OPEN (tension < 0.5), safe to pass? 
                    // The prompt said: "If you suck those in (close fist near them), you lose points. You have to open your hand to let them pass."
                    // So if Tension > 0.5 (Fist), collision triggers bad things.
                    if (gestureState.tension > 0.5) {
                        scoreRef.current -= 50;
                        target.active = false; // Consumed
                        scoreChanged = true;
                        // Trigger screen shake or visual feedback here?
                    }
                }
            }
        });

        // Cleanup inactive targets
        if (scoreChanged) {
            setGameState(prev => ({ ...prev, score: scoreRef.current }));
            // Filter out consumed targets from ref and state to keep arrays small
            const activeTargets = targetsRef.current.filter(t => t.active);
            targetsRef.current = activeTargets;
            setTargets(activeTargets);
        }
    });

    if (currentShape !== 'game' || gameState.gameMode !== 'playing') return null;

    return (
        <group>
            {/* Player Cursor / Black Hole Center */}
            <mesh position={[gestureState.position.x * 4, gestureState.position.y * 3, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="white" transparent opacity={0.5} wireframe />
            </mesh>
            
            {/* Targets */}
            {targets.map(target => (
                <Target key={target.id} position={target.position} type={target.type} />
            ))}

            {/* In-Game HUD (Floating in 3D space or use HTML overlay? sticking to HTML in modal is safer, but let's add a 3D score floater) */}
            <Text 
                position={[0, 3.5, -2]} 
                fontSize={0.5} 
                color="#00ffff" 
                anchorX="center" 
                anchorY="middle"
                font="/fonts/Inter-Bold.woff" // Ideally use a font file, but might fallback
            >
                SCORE: {gameState.score}
            </Text>
        </group>
    );
}

function Target({ position, type }) {
    const color = type === 'gold' ? '#ffd700' : '#ff0000';
    const meshRef = useRef();

    useFrame((state, delta) => {
        if(meshRef.current) {
            meshRef.current.rotation.x += delta;
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={new THREE.Vector3(...position)}>
            {type === 'gold' ? (
                <octahedronGeometry args={[0.15, 0]} />
            ) : (
                <dodecahedronGeometry args={[0.15, 0]} />
            )}
            <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={2}
                toneMapped={false}
            />
        </mesh>
    );
}

