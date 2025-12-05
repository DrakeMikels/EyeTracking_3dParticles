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
        
        // --- Blink Detection ---
        // Indices for blink: eyeBlinkLeft (9), eyeBlinkRight (10)
        // Usually these are named explicitly in the category objects
        const eyeBlinkLeft = blendshapes.find(shape => shape.categoryName === 'eyeBlinkLeft');
        const eyeBlinkRight = blendshapes.find(shape => shape.categoryName === 'eyeBlinkRight');
        
        const blinkScore = (eyeBlinkLeft?.score + eyeBlinkRight?.score) / 2 || 0;
        
        // Blink > 0.5 is considered closed eyes (equivalent to closed fist)
        // We map "closed eyes" to High Tension (1.0) and "open eyes" to Low Tension (0.0)
        // Smooth it a bit? For game mechanics, direct mapping is usually snappier.
        const tension = blinkScore > 0.4 ? 1.0 : 0.0;

        // --- Gaze / Head Position Detection ---
        // Using face transformation matrix is complex, simpler approach:
        // Use nose tip position normalized.
        // Landmark 1 is usually nose tip in 468 point mesh.
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const noseTip = results.faceLandmarks[0][1];
            
            // MediaPipe Coords: x (0-1), y (0-1), z (depth)
            // Center is 0.5, 0.5
            // Map to -1 to 1 range
            // Invert X for mirroring effect
            const x = (0.5 - noseTip.x) * 3.0; // Multiplier for sensitivity
            const y = (0.5 - noseTip.y) * 3.0;
            
            setGestureState({
                isHandDetected: true, // Reusing this flag for "Face Detected"
                tension: tension,
                position: { 
                    x: Math.max(-1, Math.min(1, x)), 
                    y: Math.max(-1, Math.min(1, y)) 
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
    <div className="absolute top-4 right-4 w-48 h-36 bg-black/50 rounded-lg overflow-hidden border border-white/10 z-50">
       <video 
         ref={videoRef}
         autoPlay 
         playsInline
         muted
         className="w-full h-full object-cover opacity-50 transform scale-x-[-1]" 
       />
       {/* Debug Overlay */}
       <div className="absolute bottom-2 left-2 text-[10px] text-white/70 font-mono">
         EYE TRACKING ACTIVE
       </div>
    </div>
  );
}
