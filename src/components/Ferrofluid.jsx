import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

export default function Ferrofluid() {
    const meshRef = useRef();
    const materialRef = useRef();
    const outerGlowRef = useRef();
    const { gestureState } = useGesture();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const { tension, position } = gestureState;

        // 1. Movement
        const targetX = position.x * 2.3;
        const targetY = position.y * 2.3;
        
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.08);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
        
        if (outerGlowRef.current) {
            outerGlowRef.current.position.copy(meshRef.current.position);
        }

        // 2. Rotation
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;

        // 3. Dynamic Ferrofluid Physics
        if (materialRef.current) {
            // Calm: Smooth, oily
            // Squint: Spiky, chaotic
            // Range 0.3 (smooth) to 1.2 (spiky)
            const targetDistort = 0.3 + tension * 0.9;
            const targetSpeed = 1.5 + tension * 6.0;
            
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);

            // Color Shift:
            // Relaxed: Deep Oil Black/Blue
            // Tense: Molten Red/Orange veins
            const baseColor = new THREE.Color('#010101');
            const stressColor = new THREE.Color('#330000'); // Deep Red
            
            const activeColor = baseColor.clone().lerp(stressColor, tension);
            materialRef.current.color.copy(activeColor);
        }
        
        // 4. Scale Pulse
        const scale = 1.3 + tension * 0.3;
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1));
    });

    return (
        <group>
            {/* Main Fluid Core */}
            <Sphere args={[1.2, 256, 256]} ref={meshRef}> {/* Higher resolution for spikes */}
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#010101"
                    envMapIntensity={1.5} // Enhance reflections
                    roughness={0.05}      // Mirror-like
                    metalness={1.0}       // Pure metal
                    reflectivity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                    distort={0.4}
                />
            </Sphere>

            {/* Inner "Magnetic Field" Glow Lines (Wireframe Sphere) */}
            <Sphere args={[1.3, 32, 32]} ref={outerGlowRef}>
                <meshBasicMaterial 
                    color="#4444ff" 
                    wireframe 
                    transparent 
                    opacity={0.05} 
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>
            
            {/* Dynamic Lights attached to the object */}
            {/* These move WITH the object to ensure it's always lit dramatically */}
            <group position={[meshRef.current?.position.x || 0, meshRef.current?.position.y || 0, 0]}>
                <pointLight position={[2, 2, 2]} intensity={2} color="#ffffff" distance={5} />
                <pointLight position={[-2, -2, 2]} intensity={2} color="#0066ff" distance={5} />
                <pointLight position={[0, 0, -3]} intensity={5} color="#ff0000" distance={5} /> {/* Backlight for rim */}
            </group>
        </group>
    );
}
