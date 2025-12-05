import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSpherePoints, getHeartPoints, getFlowerPoints, getSaturnPoints, getFireworksPoints, getBuddhaPoints } from '../utils/shapes';
import { useGesture } from '../context/GestureContext';

const COUNT = 10000;

export default function ParticleSystem() {
    const points = useRef();
    const { gestureState, currentShape, particleColor } = useGesture();

    // Generate all shape positions once
    const shapes = useMemo(() => ({
        sphere: getSpherePoints(COUNT),
        heart: getHeartPoints(COUNT),
        flower: getFlowerPoints(COUNT),
        saturn: getSaturnPoints(COUNT),
        fireworks: getFireworksPoints(COUNT),
        buddha: getBuddhaPoints(COUNT),
    }), []);

    // Current positions buffer
    const currentPositions = useMemo(() => new Float32Array(shapes.sphere), [shapes]);

    useFrame((state, delta) => {
        if (!points.current) return;

        const targetPositions = shapes[currentShape];
        const positions = points.current.geometry.attributes.position.array;

        // GESTURE 1: Fist = Expand
        const expansionFactor = 1 + gestureState.tension * 2.5;

        // Morph particles
        for (let i = 0; i < COUNT * 3; i += 3) {
            const tx = targetPositions[i] * expansionFactor;
            const ty = targetPositions[i + 1] * expansionFactor;
            const tz = targetPositions[i + 2] * expansionFactor;

            positions[i] += (tx - positions[i]) * 0.06;
            positions[i + 1] += (ty - positions[i + 1]) * 0.06;
            positions[i + 2] += (tz - positions[i + 2]) * 0.06;
        }

        points.current.geometry.attributes.position.needsUpdate = true;

        // GESTURE 2: Hand Position = Rotation
        if (gestureState.isHandDetected) {
            points.current.rotation.y = gestureState.position.x * Math.PI;
            points.current.rotation.x = gestureState.position.y * Math.PI * 0.5;
        } else {
            points.current.rotation.y += delta * 0.3;
            points.current.rotation.x *= 0.95;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={COUNT}
                    array={currentPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.015}
                color={particleColor}
                sizeAttenuation={true}
                transparent={false}
                depthWrite={true}
            />
        </points>
    );
}
