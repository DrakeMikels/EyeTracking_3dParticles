import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGesture } from '../../context/GestureContext';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Bounds for spawning - keep it tighter to screen
const SPAWN_RATE = 30; // Faster spawns (was 60)
const PLAYER_RADIUS = 0.3;
const COLLECTION_RADIUS = 0.5; // Slightly larger hitbox

export default function GameManager() {
    const { gestureState, gameState, setGameState, currentShape } = useGesture();
    const { viewport } = useThree(); // Get viewport size to constrain game to screen
    const targetsRef = useRef([]);
    const [targets, setTargets] = useState([]);
    const frameCount = useRef(0);
    const scoreRef = useRef(0);

    // Dynamic Game Bounds based on viewport (screen size)
    // Reduce slightly so they don't spawn on the very edge
    const boundsX = (viewport.width / 2) * 0.8;
    const boundsY = (viewport.height / 2) * 0.8;

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

        // 1. Spawning Logic (Faster)
        if (frameCount.current % SPAWN_RATE === 0) {
            const isAntimatter = Math.random() > 0.7;
            const newTarget = {
                id: Math.random(),
                position: [
                    (Math.random() - 0.5) * boundsX * 2,
                    (Math.random() - 0.5) * boundsY * 2,
                    (Math.random() - 0.5) * 2
                ],
                velocity: [
                    (Math.random() - 0.5) * 1, // Add slight drift
                    (Math.random() - 0.5) * 1,
                    0
                ],
                type: isAntimatter ? 'antimatter' : 'gold',
                active: true,
                scale: 0
            };
            
            setTargets(prev => [...prev, newTarget]);
            targetsRef.current.push(newTarget);
        }

        // 2. Player Hand Position mapped to Viewport
        // gestureState.position is -1 to 1. Map to viewport dimensions.
        // Invert X because webcam is usually mirrored? Or standard? 
        // Let's assume standard mapping first: -1(left) to 1(right).
        const handX = gestureState.position.x * (viewport.width / 2);
        const handY = gestureState.position.y * (viewport.height / 2);
        const handZ = 0;

        let scoreChanged = false;
        
        targetsRef.current.forEach(target => {
            if (!target.active) return;

            // Apply drift velocity
            target.position[0] += target.velocity[0] * delta;
            target.position[1] += target.velocity[1] * delta;

            // Constrain to bounds (bounce)
            if (Math.abs(target.position[0]) > boundsX) target.velocity[0] *= -1;
            if (Math.abs(target.position[1]) > boundsY) target.velocity[1] *= -1;

            // Distance to hand
            const dx = handX - target.position[0];
            const dy = handY - target.position[1];
            const dz = handZ - target.position[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // Magnetic attraction (stronger now)
            if (dist < 3.0) {
                const strength = 2.5; // Faster attraction
                target.position[0] += dx * delta * strength;
                target.position[1] += dy * delta * strength;
                target.position[2] += dz * delta * strength;
            }

            // Collision
            if (dist < COLLECTION_RADIUS) {
                if (target.type === 'gold') {
                    scoreRef.current += 100;
                    target.active = false;
                    scoreChanged = true;
                } else if (target.type === 'antimatter') {
                    // Tension > 0.5 means Fist Closed (Sucking mode) -> BAD for Antimatter
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

    // Calculate Hand Position for rendering cursor
    const cursorX = gestureState.position.x * (viewport.width / 2);
    const cursorY = gestureState.position.y * (viewport.height / 2);

    return (
        <group>
            {/* Player Cursor / Black Hole Center */}
            <mesh position={[cursorX, cursorY, 0]}>
                <sphereGeometry args={[PLAYER_RADIUS, 16, 16]} />
                <meshBasicMaterial color={gestureState.tension > 0.5 ? "#ff00ff" : "white"} transparent opacity={0.3} wireframe />
            </mesh>
            
            {/* Visual Boundary Guide (optional, helps see play area) */}
            <mesh>
                <ringGeometry args={[0, 0, 4, 1]} /> 
                {/* Just a helper logic, maybe not render a box, but we know bounds */}
            </mesh>
            
            {/* Targets */}
            {targets.map(target => (
                <Target key={target.id} position={target.position} type={target.type} />
            ))}

            {/* In-Game HUD - 3D Text at top of Viewport */}
            <Text 
                position={[0, (viewport.height/2) - 1, 0]} 
                fontSize={0.5} 
                color="#00ffff" 
                anchorX="center" 
                anchorY="top"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            >
                SCORE: {gameState.score}
            </Text>
            
            <Text
                 position={[0, -(viewport.height/2) + 0.5, 0]}
                 fontSize={0.2}
                 color="white"
                 anchorX="center"
                 anchorY="bottom"
                 font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                 fillOpacity={0.5}
            >
                {gestureState.tension > 0.5 ? "GRAVITY WELL ACTIVE (FIST)" : "SAFE MODE (OPEN HAND)"}
            </Text>
        </group>
    );
}

function Target({ position, type }) {
    const color = type === 'gold' ? '#ffd700' : '#ff0000';
    const meshRef = useRef();
    
    // Random rotation speed for variety
    const rotSpeed = useRef({ x: Math.random(), y: Math.random() });

    useFrame((state, delta) => {
        if(meshRef.current) {
            meshRef.current.rotation.x += delta * rotSpeed.current.x;
            meshRef.current.rotation.y += delta * rotSpeed.current.y;
            
            // Pulse effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh ref={meshRef} position={new THREE.Vector3(...position)}>
            {type === 'gold' ? (
                <octahedronGeometry args={[0.2, 0]} />
            ) : (
                <dodecahedronGeometry args={[0.25, 0]} /> // Slightly bigger bad guys
            )}
            <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={2}
                toneMapped={false}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
}

