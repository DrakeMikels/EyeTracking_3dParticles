import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

export default function CyberCrystal() {
    const meshRef = useRef();
    const materialRef = useRef();
    const innerMeshRef = useRef();
    const { gestureState, particleColor } = useGesture();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const { tension, position } = gestureState;
        
        // 1. Rotation based on Head Movement
        const rotX = -position.y * 1.5 + state.clock.elapsedTime * 0.1;
        const rotY = position.x * 1.5 + state.clock.elapsedTime * 0.15;

        // Smooth lerp
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotX, 0.05);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotY, 0.05);

        // Inner Core rotation (counter-rotate for depth effect)
        if (innerMeshRef.current) {
            innerMeshRef.current.rotation.x = -rotX * 1.5;
            innerMeshRef.current.rotation.y = -rotY * 1.5;
            
            // Pulse the core
            const coreScale = 0.5 + tension * 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            innerMeshRef.current.scale.setScalar(coreScale);
        }

        // 2. Material Response (Squint)
        if (materialRef.current) {
            // Distortion increases with tension
            const targetDistort = 0.2 + tension * 0.6;
            const targetTemporalDistortion = 0.1 + tension * 0.5;
            
            materialRef.current.distortion = THREE.MathUtils.lerp(materialRef.current.distortion, targetDistort, 0.1);
            materialRef.current.temporalDistortion = THREE.MathUtils.lerp(materialRef.current.temporalDistortion, targetTemporalDistortion, 0.1);

            // Chromatic Aberration spikes on tension
            const targetChrom = 0.05 + tension * 0.2;
            materialRef.current.chromaticAberration = THREE.MathUtils.lerp(materialRef.current.chromaticAberration, targetChrom, 0.1);

            // Color Shift
            const baseColor = new THREE.Color(particleColor);
            const tensionColor = new THREE.Color('#ff2200'); // Hot Red
            const activeColor = baseColor.clone().lerp(tensionColor, tension);
            
            // Tint the glass
            materialRef.current.color.copy(activeColor);
        }
    });

    return (
        <group>
            {/* Outer Glass Shell */}
            <Icosahedron args={[1.5, 0]} ref={meshRef}>
                <MeshTransmissionMaterial
                    ref={materialRef}
                    backside={true}
                    samples={16} // High quality samples
                    resolution={1024} // High res buffer
                    transmission={0.95} // Very clear glass
                    roughness={0.0}
                    thickness={1.5} // Thick glass for volumetric feel
                    ior={1.5} // Index of Refraction (glass/crystal)
                    chromaticAberration={0.05}
                    anisotropy={20}
                    distortion={0.2}
                    distortionScale={0.3}
                    temporalDistortion={0.1}
                    attenuationDistance={0.5}
                    attenuationColor="#ffffff"
                    color={particleColor}
                    background={new THREE.Color('#000000')}
                />
            </Icosahedron>

            {/* Inner Energy Core - Adds "Volume" and Light Source */}
            <Octahedron args={[0.6, 0]} ref={innerMeshRef}>
                <meshBasicMaterial 
                    color={particleColor} 
                    toneMapped={false} 
                    wireframe={true}
                />
            </Octahedron>
            <Octahedron args={[0.55, 0]}>
                 <meshBasicMaterial 
                    color="#ffffff" 
                    toneMapped={false}
                    transparent
                    opacity={0.8}
                />
            </Octahedron>

            {/* Point lights inside to make it glow outward */}
            <pointLight position={[0,0,0]} intensity={2} color={particleColor} distance={3} decay={2} />
        </group>
    );
}
