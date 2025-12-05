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
        // Hybrid Approach: Head Position + Eye Blendshapes
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            // 1. Head Position (Nose Tip)
            const noseTip = landmarks[1];
            // Normalize to -1 to 1 (inverted X for mirror)
            const headX = (0.5 - noseTip.x) * 2.5; 
            const headY = (0.5 - noseTip.y) * 2.5;

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
            // Horizontal: OutLeft + InRight means looking Left (user's left)
            // We mirror X, so looking Left should move cursor Left (negative X in our gesture space? No, mapped X is -1 to 1)
            // Let's refine the mapping:
            // "Look Left" (User's Left) -> eyeLookOutLeft + eyeLookInRight
            // "Look Right" (User's Right) -> eyeLookInLeft + eyeLookOutRight
            
            const lookLeftScore = eyeLookOutLeft + eyeLookInRight;
            const lookRightScore = eyeLookInLeft + eyeLookOutRight;
            const lookUpScore = eyeLookUpLeft + eyeLookUpRight;
            const lookDownScore = eyeLookDownLeft + eyeLookDownRight;

            // Net Gaze Delta (-1 to 1 range approx)
            // If I look Left, lookLeftScore is high.
            // Since we use mirrored video (scale-x-[-1]), Looking Left (User Left) appears on the Right side of screen?
            // Wait, logic:
            // User looks to their physical Left. 
            // Cursor should go Left.
            // In typical mirrored cam: Moving head Left moves image Right.
            // Our headX calc: (0.5 - noseTip.x). If nose moves Left (x < 0.5), value is positive? 
            // Let's stick to standard "Look Left -> Negative X" convention or whatever HeadX uses.
            // (0.5 - x): If x is 0 (Left edge of image), result is 0.5 (Positive).
            // Usually MediaPipe x=0 is User's Right (in mirrored view)? No, x=0 is Left of Image.
            // If mirrored: User Left = Image Right (x=1). 
            // If User moves Left, x increases. (0.5 - x) becomes negative.
            // So Head Left -> Negative X.
            
            // Now Gaze:
            // Look Left -> lookLeftScore high.
            // We want this to contribute to Negative X.
            // So: gazeX = lookRightScore - lookLeftScore.
            // If Look Left: (0 - 1) = -1. Correct.
            
            const gazeX = (lookRightScore - lookLeftScore) * 1.5; // Sensitivity
            const gazeY = (lookUpScore - lookDownScore) * 1.5;

            // Combine Head + Gaze
            // Head provides base "center", Gaze provides fine offset.
            let totalX = headX + gazeX;
            let totalY = headY + gazeY; // Y might need inversion?
            // MediaPipe Y=0 is Top. (0.5 - y) -> Top is Positive. 
            // Blendshape Up -> lookUpScore high.
            // gazeY = Up - Down = Positive. 
            // So Up -> Positive. Matches.

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
