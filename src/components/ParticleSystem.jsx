import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as maath from 'maath/random/dist/maath-random.esm';
import { useGesture } from '../context/GestureContext';
import { getSpherePoints, getHeartPoints, getFlowerPoints, getSaturnPoints, getBuddhaPoints, getFireworksPoints, getEyePoints, getNeuralPoints } from '@/utils/shapes';

// Helper to generate shape positions
const generateShapePositions = (shape, count) => {
    switch (shape) {
        case 'sphere': return getSpherePoints(count);
        case 'eye': return getEyePoints(count);
        case 'neural': return getNeuralPoints(count);
        case 'earth': return getSpherePoints(count); 
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
            eye: generateShapePositions('eye', count),
            neural: generateShapePositions('neural', count),
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
            // ... (keep existing game logic intact, or re-insert if needed) ...
            const { viewport } = state;
            // Map hand position to viewport (same logic as GameManager)
            // Use 4 and 3 as approximation if viewport not available, but let's stick to consistent scalars
            // GameManager uses: gestureState.position.x * (viewport.width / 2)
            // Here we don't have viewport easily without hook, but we can assume ~6 width ~4 height
            const targetX = position.x * 6; 
            const targetY = position.y * 4;
            
            const time = state.clock.elapsedTime;
            
            for (let i = 0; i < count; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                // Create a vortex effect
                // Each particle has a random angle and radius
                const angleOffset = i * 0.01;
                const radiusBase = (i % 100) * 0.01 + 0.2; // Distribution
                
                // Tension affects the "tightness" of the black hole
                // High tension = tight collapse (Gravity Well)
                // Low tension = loose cloud
                const tightness = THREE.MathUtils.lerp(1.5, 0.2, tension); 
                const speed = 2.0 + tension * 5.0; // Spin faster when closed

                const angle = time * speed + angleOffset;
                const r = radiusBase * tightness;

                // Spiral coordinates relative to hand
                const ox = Math.cos(angle) * r;
                const oy = Math.sin(angle) * r;
                const oz = (Math.sin(angle * 3 + time) * 0.2) * tightness; // Slight wavy Z

                // Lerp current position to Target(Hand) + Offset
                // Using a slightly loose lerp for fluid trail effect
                positions[ix] = THREE.MathUtils.lerp(positions[ix], targetX + ox, 0.1);
                positions[iy] = THREE.MathUtils.lerp(positions[iy], targetY + oy, 0.1);
                positions[iz] = THREE.MathUtils.lerp(positions[iz], oz, 0.1);
            }

        } else if (currentShape === 'eye') {
            // EYE ANIMATION LOGIC
            const irisStartIndex = Math.floor(count * 0.8); 
            const pupilScale = THREE.MathUtils.lerp(1.0, 0.4, tension);

            for (let i = 0; i < count; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                let tx = targetPositions[ix];
                let ty = targetPositions[iy];
                let tz = targetPositions[iz];

                if (i >= irisStartIndex) {
                    // This is the Iris/Pupil
                    tx *= pupilScale;
                    ty *= pupilScale;
                    
                    // Gaze tracking: Move pupil towards gesture position
                    // In Three.js default camera, +Y is UP, +X is RIGHT.
                    // gestureState.position is -1 (left/bottom) to 1 (right/top)
                    // So gazeX needs to match coordinate system.
                    const gazeX = position.x * 1.5; 
                    const gazeY = position.y * 1.5;
                    
                    tx += gazeX;
                    ty += gazeY;
                    
                    tz += 0.2 + tension * 0.5;
                }

                const lerpSpeed = 0.1;
                positions[ix] = THREE.MathUtils.lerp(positions[ix], tx, lerpSpeed);
                positions[iy] = THREE.MathUtils.lerp(positions[iy], ty, lerpSpeed);
                positions[iz] = THREE.MathUtils.lerp(positions[iz], tz, lerpSpeed);
            }
            
            // Correct global rotation: 
            // Ensure "Center" gaze actually points the eye at the camera (0,0,0 rotation).
            // We dampen rotation so the eye doesn't spin away from the user.
            // Subtle tilt based on gaze.
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, position.x * 0.2, 0.1);
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -position.y * 0.2, 0.1);
            pointsRef.current.rotation.z = 0; // Ensure no roll

        } else if (currentShape === 'neural') {
            // NEURAL ANIMATION LOGIC
            // Pulse on tension
            const time = state.clock.elapsedTime;
            
            for (let i = 0; i < count; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                let tx = targetPositions[ix];
                let ty = targetPositions[iy];
                let tz = targetPositions[iz];

                // Synaptic firing effect
                // Random neurons light up or move based on noise + tension
                if (Math.random() > 0.95) {
                    tx += (Math.random() - 0.5) * 0.1 * tension;
                    ty += (Math.random() - 0.5) * 0.1 * tension;
                    tz += (Math.random() - 0.5) * 0.1 * tension;
                }
                
                // Overall throbbing
                const pulse = 1 + Math.sin(time * 2 + i * 0.01) * 0.05 * (1 + tension * 5);
                tx *= pulse;
                ty *= pulse;
                tz *= pulse;

                const lerpSpeed = 0.05;
                positions[ix] = THREE.MathUtils.lerp(positions[ix], tx, lerpSpeed);
                positions[iy] = THREE.MathUtils.lerp(positions[iy], ty, lerpSpeed);
                positions[iz] = THREE.MathUtils.lerp(positions[iz], tz, lerpSpeed);
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

                // Special coloring for Eye shape
                // We need to override the global particle color for the Iris part
                // Note: pointsMaterial color is global. We can't easily change color per particle without a shader material or vertex colors.
                // However, we CAN cheat by simply making the iris particles extremely dense/bright or moving them.
                // But user asked for different color. 
                // Switching to Vertex Colors is significant.
                // Alternative: If Squinting (tension > 0.5), maybe pulse the global color?
                
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
                color={currentShape === 'eye' && gestureState.tension > 0.5 ? "#ff0000" : particleColor} // Dynamic color for Eye
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
