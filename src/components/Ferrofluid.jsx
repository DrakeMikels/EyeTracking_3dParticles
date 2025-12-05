import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

export default function Ferrofluid() {
    const meshRef = useRef();
    const materialRef = useRef();
    const { gestureState } = useGesture();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const { tension, position } = gestureState;

        // 1. Movement: Follow Gaze smoothly
        // We limit the range so it doesn't go off screen
        const targetX = position.x * 2.5;
        const targetY = position.y * 2.5;
        
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.08);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
        
        // 2. Rotation: Constant slow spin + reaction to tension
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;

        // 3. Distortion: The core ferrofluid effect
        if (materialRef.current) {
            // Base state: slightly rippling liquid
            // Squint state: Highly volatile, spiky
            const targetDistort = 0.4 + tension * 1.0; // 0.4 -> 1.4 (very spiky)
            const targetSpeed = 1.5 + tension * 8.0;   // 1.5 -> 9.5 (very fast)
            
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.05);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.05);

            // Color shift: Black -> Dark Purple/Red on extreme tension
            // Ferrofluid is usually black, but let's give it a "heated" look when stressed
            const blackColor = new THREE.Color('#050505');
            const stressColor = new THREE.Color('#2a0a10'); // Dark reddish/purple
            
            const activeColor = blackColor.clone().lerp(stressColor, tension);
            materialRef.current.color.copy(activeColor);
        }
        
        // 4. Scale Pulse
        const targetScale = 1.3 + tension * 0.2; // Swell slightly when tense
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
    });

    return (
        <group>
            {/* Main Fluid Blob */}
            <Sphere args={[1.2, 128, 128]} ref={meshRef}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#050505"
                    roughness={0.05} // Very shiny
                    metalness={0.9}  // Metallic
                    reflectivity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                    distort={0.4}
                />
            </Sphere>
            
            {/* Ambient Environment Reflection (simulated by lights/env in Scene) */}
            <pointLight position={[2, 2, 2]} intensity={2} color="#ffffff" />
            <pointLight position={[-2, -2, 2]} intensity={1} color="#4444ff" />
        </group>
    );
}

