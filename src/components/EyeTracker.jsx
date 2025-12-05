import React, { useEffect, useRef } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

export default function EyeTracker() {
  const videoRef = useRef(null);
  const { setGestureState } = useGesture();
  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    let active = true;

    const setupFaceMesh = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        if (!active) return;

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        startWebcam();
      } catch (error) {
        console.error("Error initializing Face Mesh:", error);
      }
    };

    setupFaceMesh();

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = predictWebcam;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const predictWebcam = () => {
    const landmarker = faceLandmarkerRef.current;
    const video = videoRef.current;

    if (landmarker && video && video.currentTime > 0) {
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;
        
        // --- Blink / Squint Detection ---
        // Indices for blink: eyeBlinkLeft (9), eyeBlinkRight (10)
        const eyeBlinkLeft = blendshapes.find(shape => shape.categoryName === 'eyeBlinkLeft');
        const eyeBlinkRight = blendshapes.find(shape => shape.categoryName === 'eyeBlinkRight');
        
        const blinkScore = (eyeBlinkLeft?.score + eyeBlinkRight?.score) / 2 || 0;
        
        // Map Squint/Blink to Tension continuously
        // Threshold: 0.05 (ignore micro-jitters)
        // Max: 0.7 (fully closed doesn't always reach 1.0 with some webcams)
        // Formula maps range [0.05, 0.7] to [0, 1]
        let tension = (blinkScore - 0.05) * 1.5;
        tension = Math.max(0, Math.min(1, tension));

        // --- Gaze / Head Position Detection ---
        // Hybrid Approach: Head Position + Eye Blendshapes
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            // 1. Head Position (Nose Tip)
            const noseTip = landmarks[1];
            // Normalize to -1 to 1 (inverted X for mirror)
            // Reduced sensitivity from 2.5 to 1.8 for smoother control
            const headX = (0.5 - noseTip.x) * 1.8; 
            const headY = (0.5 - noseTip.y) * 1.8;

            // 2. Eye Gaze from Blendshapes (Independent of head movement)
            // Left Eye
            const eyeLookInLeft = blendshapes.find(s => s.categoryName === 'eyeLookInLeft')?.score || 0;
            const eyeLookOutLeft = blendshapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
            const eyeLookUpLeft = blendshapes.find(s => s.categoryName === 'eyeLookUpLeft')?.score || 0;
            const eyeLookDownLeft = blendshapes.find(s => s.categoryName === 'eyeLookDownLeft')?.score || 0;
            
            // Right Eye
            const eyeLookInRight = blendshapes.find(s => s.categoryName === 'eyeLookInRight')?.score || 0;
            const eyeLookOutRight = blendshapes.find(s => s.categoryName === 'eyeLookOutRight')?.score || 0;
            const eyeLookUpRight = blendshapes.find(s => s.categoryName === 'eyeLookUpRight')?.score || 0;
            const eyeLookDownRight = blendshapes.find(s => s.categoryName === 'eyeLookDownRight')?.score || 0;

            // Calculate Gaze Vectors
            const lookLeftScore = eyeLookOutLeft + eyeLookInRight;
            const lookRightScore = eyeLookInLeft + eyeLookOutRight;
            const lookUpScore = eyeLookUpLeft + eyeLookUpRight;
            const lookDownScore = eyeLookDownLeft + eyeLookDownRight;

            // Net Gaze Delta (-1 to 1 range approx)
            // Reduced sensitivity from 1.5 to 1.0 for finer precision
            const gazeX = (lookRightScore - lookLeftScore) * 1.0; 
            const gazeY = (lookUpScore - lookDownScore) * 1.0;

            // Combine Head + Gaze
            // Head provides base "center", Gaze provides fine offset.
            let totalX = headX + gazeX;
            let totalY = headY + gazeY;

            // --- Mobile Correction ---
            // On mobile (portrait), the x/y scaling might be off due to aspect ratio.
            // If width < height, X axis movement needs to be amplified to reach edges.
            // We can check window.innerWidth/Height
            if (window.innerWidth < window.innerHeight) {
                const aspectRatio = window.innerHeight / window.innerWidth;
                totalX *= aspectRatio * 1.2; // Boost X on portrait to reach edges
            }

            setGestureState({
                isHandDetected: true, 
                tension: tension,
                position: { 
                    x: Math.max(-1, Math.min(1, totalX)), 
                    y: Math.max(-1, Math.min(1, totalY)) 
                }
            });
        }
      } else {
         // No face detected
         setGestureState(prev => ({ ...prev, isHandDetected: false }));
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute bottom-4 right-4 w-28 h-20 sm:w-48 sm:h-36 bg-black/50 rounded-lg overflow-hidden border border-white/10 z-50 transition-all duration-300">
       <video 
         ref={videoRef}
         autoPlay 
         playsInline
         muted
         className="w-full h-full object-cover opacity-50 transform scale-x-[-1]" 
       />
       {/* Debug Overlay */}
       <div className="absolute bottom-1 left-2 text-[8px] sm:text-[10px] text-white/70 font-mono">
         EYE TRACKING
       </div>
    </div>
  );
}
