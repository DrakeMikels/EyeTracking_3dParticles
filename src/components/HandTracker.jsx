import React, { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

export default function HandTracker() {
    const videoRef = useRef(null);
    const { setGestureState } = useGesture();
    const handLandmarkerRef = useRef(null);

    useEffect(() => {
        const initHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );

            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1  // Only track one hand for simplicity
            });

            startWebcam();
        };

        initHandLandmarker();

        return () => { };
    }, []);

    const startWebcam = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", predictWebcam);
                }
            });
        }
    };

    const predictWebcam = async () => {
        if (!handLandmarkerRef.current || !videoRef.current) return;

        const startTimeMs = performance.now();
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                const wrist = landmarks[0];
                const tips = [4, 8, 12, 16, 20].map(i => landmarks[i]);

                // Calculate tension: how closed is the fist?
                // Measure average distance from fingertips to wrist
                let avgDist = 0;
                tips.forEach(tip => {
                    const d = Math.sqrt(
                        Math.pow(tip.x - wrist.x, 2) +
                        Math.pow(tip.y - wrist.y, 2)
                    );
                    avgDist += d;
                });
                avgDist /= 5;

                // Map distance to tension (inverted: small distance = high tension)
                // Open hand ~0.25-0.35, closed fist ~0.08-0.12
                const maxOpen = 0.30;
                const minClosed = 0.10;
                let tension = (maxOpen - avgDist) / (maxOpen - minClosed);
                tension = Math.max(0, Math.min(1, tension));

                // Get palm center position (average of key points)
                // Use wrist and middle finger base for stable center
                const middleBase = landmarks[9];
                const centerX = (wrist.x + middleBase.x) / 2;
                const centerY = (wrist.y + middleBase.y) / 2;

                // Map to -1 to 1 (and flip X because video is mirrored)
                const posX = -((centerX - 0.5) * 2);
                const posY = (centerY - 0.5) * 2;

                setGestureState({
                    tension: tension,
                    isHandDetected: true,
                    position: { x: posX, y: posY }
                });
            } else {
                setGestureState(prev => ({ ...prev, isHandDetected: false }));
            }
        }

        requestAnimationFrame(predictWebcam);
    };

    return (
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden z-50 opacity-0 pointer-events-none">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
            />
        </div>
    );
}
