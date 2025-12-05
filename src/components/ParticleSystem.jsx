import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as maath from 'maath/random/dist/maath-random.esm';
import { useGesture } from '../context/GestureContext';
import { getSpherePoints, getHeartPoints, getFlowerPoints, getSaturnPoints, getBuddhaPoints, getFireworksPoints } from '@/utils/shapes';

// Helper to generate shape positions
const generateShapePositions = (shape, count) => {
    switch (shape) {
        case 'sphere': return getSpherePoints(count);
        case 'earth': return getSpherePoints(count); // Earth uses texture, but points can follow sphere
        case 'heart': return getHeartPoints(count);
        case 'flower': return getFlowerPoints(count);
        case 'saturn': return getSaturnPoints(count);
        case 'buddha': return getBuddhaPoints(count);
        case 'fireworks': return getFireworksPoints(count);
        case 'game': {
            // For game mode, start as a small dense sphere (the "Black Hole" cursor)
            const positions = new Float32Array(count * 3);
            for(let i=0; i<count; i++) {
                const r = 0.2 * Math.cbrt(Math.random());
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i*3+2] = r * Math.cos(phi);
            }
            return positions;
        }
        default: return getSpherePoints(count);
    }
};

export default function ParticleSystem() {
    const count = 10000;
    const { gestureState, currentShape, particleColor, gameState } = useGesture();
    const pointsRef = useRef();
    
    // Generate target positions for each shape
    const shapePositions = useMemo(() => {
        return {
            sphere: generateShapePositions('sphere', count),
            earth: generateShapePositions('earth', count),
            heart: generateShapePositions('heart', count),
            flower: generateShapePositions('flower', count),
            saturn: generateShapePositions('saturn', count),
            buddha: generateShapePositions('buddha', count),
            fireworks: generateShapePositions('fireworks', count),
            game: generateShapePositions('game', count),
        };
    }, []);

    // Current positions buffer (mutable)
    const currentPositions = useRef(new Float32Array(count * 3));
    
    // Initialize current positions
    useEffect(() => {
        const target = shapePositions[currentShape] || shapePositions.sphere;
        if (currentPositions.current && target) {
            currentPositions.current.set(target);
        }
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current || !currentPositions.current) return;

        const { tension, position, isHandDetected } = gestureState;
        const targetPositions = shapePositions[currentShape] || shapePositions.sphere;
        
        // Ensure geometry attributes exist before accessing
        if (!pointsRef.current.geometry || !pointsRef.current.geometry.attributes.position) return;
        
        const positions = pointsRef.current.geometry.attributes.position.array;

        // Rotation based on hand position (X axis -> Y rotation, Y axis -> X rotation)
        // In game mode, we don't rotate the whole system, we move the cluster
        if (currentShape !== 'game') {
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, position.x * 2, 0.1);
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -position.y * 2, 0.1);
        } else {
            // Game Mode: Reset rotation
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, 0, 0.1);
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, 0, 0.1);
        }

        // Expansion factor based on fist tension
        const expansion = 1 + tension * 2; // 1x to 3x size

        // Game Mode Logic vs Shape Logic
        if (currentShape === 'game') {
            // In game mode, particles follow the hand position (Black Hole effect)
            // Target X/Y comes from hand position mapped to world space
            const targetX = position.x * 4;
            const targetY = position.y * 3;
            
            for (let i = 0; i < count; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                // Get local offset from the 'game' shape definition (small sphere)
                const ox = targetPositions[ix];
                const oy = targetPositions[iy];
                const oz = targetPositions[iz];

                // Apply swirl/noise
                const time = state.clock.elapsedTime;
                const swirl = Math.sin(time + i) * 0.1 * tension;

                // Lerp to hand position + local offset
                // We use a faster lerp for responsiveness
                positions[ix] = THREE.MathUtils.lerp(positions[ix], targetX + ox + swirl, 0.15);
                positions[iy] = THREE.MathUtils.lerp(positions[iy], targetY + oy + swirl, 0.15);
                positions[iz] = THREE.MathUtils.lerp(positions[iz], oz, 0.15);
            }

        } else {
            // Standard Shape Morphing
            for (let i = 0; i < count; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                let tx = targetPositions[ix];
                let ty = targetPositions[iy];
                let tz = targetPositions[iz];

                // Apply expansion
                tx *= expansion;
                ty *= expansion;
                tz *= expansion;

                // Apply slight noise/movement
                if (currentShape === 'fireworks') {
                    // Fireworks explode outward
                    const speed = 0.5;
                    tx += (Math.random() - 0.5) * delta * speed;
                    ty += (Math.random() - 0.5) * delta * speed;
                    tz += (Math.random() - 0.5) * delta * speed;
                }

                // Interpolate current position to target
                // Speed varies by shape?
                const lerpSpeed = 0.05; // Smooth transition
                
                positions[ix] = THREE.MathUtils.lerp(positions[ix], tx, lerpSpeed);
                positions[iy] = THREE.MathUtils.lerp(positions[iy], ty, lerpSpeed);
                positions[iz] = THREE.MathUtils.lerp(positions[iz], tz, lerpSpeed);
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={currentPositions.current}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.015}
                color={particleColor}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
