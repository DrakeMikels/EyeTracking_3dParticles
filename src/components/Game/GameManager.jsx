import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGesture } from '../../context/GestureContext';
import * as THREE from 'three';
import { Text, Stars, Sparkles, MeshDistortMaterial } from '@react-three/drei';

// Bounds for spawning - keep it tighter to screen
const SPAWN_RATE = 30; // Faster spawns
const PLAYER_RADIUS = 0.3;
const COLLECTION_RADIUS = 0.5;

export default function GameManager() {
    const { gestureState, gameState, setGameState, currentShape } = useGesture();
    const { viewport } = useThree();
    const targetsRef = useRef([]);
    const [targets, setTargets] = useState([]);
    const frameCount = useRef(0);
    const scoreRef = useRef(0);

    // Dynamic Game Bounds based on viewport (screen size)
    const boundsX = (viewport.width / 2) * 0.9; // Utilize more width
    const boundsY = (viewport.height / 2) * 0.9;

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
            const isAntimatter = Math.random() > 0.7;
            const newTarget = {
                id: Math.random(),
                position: [
                    (Math.random() - 0.5) * boundsX * 2,
                    (Math.random() - 0.5) * boundsY * 2,
                    -5 // Spawn from deep background
                ],
                velocity: [
                    (Math.random() - 0.5) * 2, 
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2 + 2 // Move forward towards camera
                ],
                type: isAntimatter ? 'antimatter' : 'gold',
                active: true,
                scale: 1 // Initial scale
            };
            
            setTargets(prev => [...prev, newTarget]);
            targetsRef.current.push(newTarget);
        }

        // 2. Player Hand Position mapped to Viewport
        const handX = gestureState.position.x * (viewport.width / 2); // Adjusted for improved scaling
        const handY = gestureState.position.y * (viewport.height / 2);
        const handZ = 0;

        let scoreChanged = false;
        
        targetsRef.current.forEach(target => {
            if (!target.active) return;

            // Move forward
            target.position[2] += target.velocity[2] * delta;
            
            // Lateral drift
            target.position[0] += target.velocity[0] * delta;
            target.position[1] += target.velocity[1] * delta;

            // Reset if passed camera
            if (target.position[2] > 2) {
                 target.active = false; // Missed it
            }

            // Distance to hand
            const dx = handX - target.position[0];
            const dy = handY - target.position[1];
            const dz = handZ - target.position[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // Magnetic attraction (Gravity Well)
            // Stronger when close
            if (dist < 4.0) {
                let shouldAttract = true;
                
                // If it's antimatter, only attract if FIST IS CLOSED (Gravity Well Active)
                if (target.type === 'antimatter' && gestureState.tension <= 0.5) {
                    shouldAttract = false;
                }

                if (shouldAttract) {
                    // Exponential gravity: stronger as it gets closer
                    const baseStrength = gestureState.tension > 0.5 ? 8.0 : 3.0; 
                    const gravity = baseStrength / (dist + 0.5); // Prevent infinity
                    
                    target.position[0] += dx * delta * gravity;
                    target.position[1] += dy * delta * gravity;
                    target.position[2] += dz * delta * gravity;
                    
                    // SUCK EFFECT: If very close, pull aggressively to center to ensure collision
                    if (dist < 1.0) {
                        target.position[0] = THREE.MathUtils.lerp(target.position[0], handX, 0.2);
                        target.position[1] = THREE.MathUtils.lerp(target.position[1], handY, 0.2);
                        target.position[2] = THREE.MathUtils.lerp(target.position[2], handZ, 0.2);
                        
                        // Shrink effect
                        target.scale = Math.max(0, target.scale - delta * 5);
                    }
                }
            }

            // Collision - Increase radius slightly for better "feel"
            if (dist < 0.8) {
                if (target.type === 'gold') {
                    scoreRef.current += 100;
                    target.active = false;
                    scoreChanged = true;
                } else if (target.type === 'antimatter') {
                    if (gestureState.tension > 0.5) {
                        scoreRef.current -= 50;
                        target.active = false;
                        scoreChanged = true;
                    }
                }
            }
        });

        if (scoreChanged) {
            setGameState(prev => ({ ...prev, score: scoreRef.current }));
            const activeTargets = targetsRef.current.filter(t => t.active);
            targetsRef.current = activeTargets;
            setTargets(activeTargets);
        }
    });

    if (currentShape !== 'game' || gameState.gameMode !== 'playing') return null;

    const cursorX = gestureState.position.x * (viewport.width / 2);
    const cursorY = gestureState.position.y * (viewport.height / 2);

    return (
        <group>
            {/* Background Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Retro Grid Floor - Moving */}
            <GridFloor />

            {/* Player Cursor / Event Horizon */}
            <group position={[cursorX, cursorY, 0]}>
                {/* Core is handled by particles, but let's add a ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.3, 0.35, 32]} />
                    <meshBasicMaterial color={gestureState.tension > 0.5 ? "#ff00ff" : "#00ffff"} side={THREE.DoubleSide} />
                </mesh>
                <pointLight intensity={2} distance={3} color={gestureState.tension > 0.5 ? "#ff00ff" : "#00ffff"} />
            </group>
            
            {/* Targets */}
            {targets.map(target => (
                <Target key={target.id} position={target.position} type={target.type} scale={target.scale} />
            ))}

            {/* HUD */}
            <Text 
                position={[0, (viewport.height/2) - 0.5, 0]} 
                fontSize={0.4} 
                color="#00ffff" 
                anchorX="center" 
                anchorY="top"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            >
                SCORE: {gameState.score}
            </Text>
            
            <Text
                 position={[0, -(viewport.height/2) + 0.5, 0]}
                 fontSize={0.15}
                 color="white"
                 anchorX="center"
                 anchorY="bottom"
                 font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                 fillOpacity={0.5}
            >
                {gestureState.tension > 0.5 ? "GRAVITY WELL: ACTIVE" : "GRAVITY WELL: IDLE"}
            </Text>
        </group>
    );
}

function GridFloor() {
    const gridRef = useRef();
    useFrame((state, delta) => {
        if (gridRef.current) {
            gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2;
        }
    });

    return (
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
            <gridHelper args={[20, 20, 0xff00ff, 0x220022]} position={[0, 0, 0]} />
            <gridHelper args={[20, 20, 0xff00ff, 0x220022]} position={[0, 2, 0]} ref={gridRef} />
        </group>
    );
}

function Target({ position, type, scale }) {
    const isGold = type === 'gold';
    const color = isGold ? '#ffd700' : '#ff0000';
    const meshRef = useRef();
    
    useFrame((state, delta) => {
        if(meshRef.current) {
            meshRef.current.rotation.x += delta * 2;
            meshRef.current.rotation.y += delta * 3;
            if (scale !== undefined) meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={new THREE.Vector3(...position)}>
            <mesh ref={meshRef}>
                {isGold ? (
                    <octahedronGeometry args={[0.2, 0]} />
                ) : (
                    <dodecahedronGeometry args={[0.25, 0]} />
                )}
                {/* Improved Material for higher quality look */}
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                    roughness={0.1}
                    metalness={0.8}
                    distort={0.3} // Wobbly effect
                    speed={2}
                />
            </mesh>
            {isGold && <Sparkles count={8} scale={1.2} size={3} speed={0.4} opacity={0.8} color="#ffff00" />}
        </group>
    );
}