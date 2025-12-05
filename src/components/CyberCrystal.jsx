import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

export default function CyberCrystal() {
    const meshRef = useRef();
    const materialRef = useRef();
    const { gestureState, particleColor } = useGesture();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const { tension, position } = gestureState;
        
        // 1. Rotation based on Head Movement
        // Smooth lerp for fluid feel
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, position.x * 2 + state.clock.elapsedTime * 0.2, 0.05);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -position.y * 2 + state.clock.elapsedTime * 0.1, 0.05);

        // 2. Distortion/Pulse based on Tension (Squint)
        // Base distort: 0.3
        // Squint distort: up to 0.8
        const targetDistort = 0.3 + tension * 0.8;
        const targetSpeed = 2 + tension * 5;
        
        if (materialRef.current) {
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);
            
            // 3. Color Shift on Squint
            const baseColor = new THREE.Color(particleColor);
            const tensionColor = new THREE.Color('#ff3300'); // Hot Red
            const activeColor = baseColor.clone().lerp(tensionColor, tension);
            
            materialRef.current.color.copy(activeColor);
            materialRef.current.emissive.copy(activeColor);
        }

        // 4. Scale Pulse
        const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05 + tension * 0.2;
        meshRef.current.scale.setScalar(scale);
    });

    return (
        <Icosahedron args={[1.5, 0]} ref={meshRef}>
            <MeshDistortMaterial
                ref={materialRef}
                color={particleColor}
                emissive={particleColor}
                emissiveIntensity={0.5}
                roughness={0.1}
                metalness={0.8}
                radius={1}
                distort={0.4}
            />
        </Icosahedron>
    );
}
