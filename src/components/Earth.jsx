import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

// Use CORS-friendly texture sources
const TEXTURE_URLS = {
    earth: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    bump: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
};

// Smooth interpolation helper
function lerp(current, target, factor) {
    return current + (target - current) * factor;
}

export default function Earth() {
    const meshRef = useRef();
    const cloudsRef = useRef();
    const { gestureState } = useGesture();

    // Smooth rotation state
    const smoothRotation = useRef({ x: 0, y: 0 });
    const smoothScale = useRef(1);
    const autoRotation = useRef(0);

    const [textures, setTextures] = useState({
        earth: null,
        bump: null,
        specular: null,
        clouds: null,
        loaded: false
    });

    // Load textures manually with error handling
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';

        console.log('Loading Earth textures from three.js repo...');

        const loadTexture = (url, name) => {
            return new Promise((resolve) => {
                loader.load(
                    url,
                    (texture) => {
                        console.log(`✓ ${name} texture loaded`);
                        resolve(texture);
                    },
                    undefined,
                    (err) => {
                        console.error(`✗ Failed to load ${name}:`, err);
                        resolve(null);
                    }
                );
            });
        };

        Promise.all([
            loadTexture(TEXTURE_URLS.earth, 'Earth'),
            loadTexture(TEXTURE_URLS.bump, 'Bump'),
            loadTexture(TEXTURE_URLS.specular, 'Specular'),
            loadTexture(TEXTURE_URLS.clouds, 'Clouds')
        ]).then(([earth, bump, specular, clouds]) => {
            console.log('All textures processed');
            setTextures({ earth, bump, specular, clouds, loaded: true });
        });
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Smoothing factor (lower = smoother but slower response)
        const smoothFactor = 0.08;
        const scaleSmoothFactor = 0.1;

        if (gestureState.isHandDetected) {
            // Target rotation based on hand position
            const targetRotX = gestureState.position.y * Math.PI * 0.3;
            const targetRotY = gestureState.position.x * Math.PI;

            // Smoothly interpolate to target
            smoothRotation.current.x = lerp(smoothRotation.current.x, targetRotX, smoothFactor);
            smoothRotation.current.y = lerp(smoothRotation.current.y, targetRotY, smoothFactor);

            // Apply smooth rotation
            meshRef.current.rotation.x = smoothRotation.current.x;
            meshRef.current.rotation.y = smoothRotation.current.y;

            // Clouds follow with slight offset
            if (cloudsRef.current) {
                cloudsRef.current.rotation.x = smoothRotation.current.x;
                cloudsRef.current.rotation.y = smoothRotation.current.y + 0.05;
            }

            // Smooth scale based on tension
            const targetScale = 1 + gestureState.tension * 0.5;
            smoothScale.current = lerp(smoothScale.current, targetScale, scaleSmoothFactor);
        } else {
            // When no hand detected, smoothly return to auto-rotation
            smoothRotation.current.x = lerp(smoothRotation.current.x, 0, smoothFactor * 0.5);

            // Continue auto-rotation
            autoRotation.current += delta * 0.1;
            smoothRotation.current.y = lerp(smoothRotation.current.y, autoRotation.current, smoothFactor);

            meshRef.current.rotation.x = smoothRotation.current.x;
            meshRef.current.rotation.y = smoothRotation.current.y;

            if (cloudsRef.current) {
                cloudsRef.current.rotation.x = smoothRotation.current.x;
                cloudsRef.current.rotation.y = smoothRotation.current.y + 0.05;
            }

            // Smoothly return scale to normal
            smoothScale.current = lerp(smoothScale.current, 1, scaleSmoothFactor);
        }

        // Apply smooth scale
        meshRef.current.scale.setScalar(smoothScale.current);
        if (cloudsRef.current) {
            cloudsRef.current.scale.setScalar(smoothScale.current * 1.01);
        }
    });

    return (
        <group>
            {/* Earth */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                {textures.earth ? (
                    <meshPhongMaterial
                        map={textures.earth}
                        bumpMap={textures.bump}
                        bumpScale={0.05}
                        specularMap={textures.specular}
                        specular={new THREE.Color(0x333333)}
                        shininess={5}
                    />
                ) : (
                    <meshStandardMaterial color="#1a4f7a" />
                )}
            </mesh>

            {/* Clouds layer */}
            {textures.clouds && (
                <mesh ref={cloudsRef}>
                    <sphereGeometry args={[2.03, 64, 64]} />
                    <meshPhongMaterial
                        map={textures.clouds}
                        transparent={true}
                        opacity={0.35}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}
