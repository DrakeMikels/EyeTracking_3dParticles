import React, { useEffect, useRef } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

export default function EyeTracker() {
  const videoRef = useRef(null);
  const { setGestureState } = useGesture();
  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const [status, setStatus] = React.useState("INITIALIZING"); // Add UI status

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
            // delegate: "GPU" // Removed GPU delegate for maximum mobile compatibility
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        setStatus("MODEL READY");
        startWebcam();
      } catch (error) {
        console.error("Error initializing Face Mesh:", error);
        setStatus("ERROR: MODEL");
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
        video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Use onloadeddata instead of onloadedmetadata for iOS Safari compatibility
        // iOS sometimes fires loadedmetadata before video is actually ready to play
        videoRef.current.onloadeddata = () => {
            // Ensure play() is called
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Play error", e);
                    // Auto-play failed, UI might need to ask user to tap
                    setStatus("TAP TO START");
                });
            }
            
            videoRef.current.width = videoRef.current.videoWidth;
            videoRef.current.height = videoRef.current.videoHeight;
            
            setStatus("TRACKING");
            requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setStatus("ERROR: CAM");
    }
  };

  const predictionLoopRef = useRef(null);
  const detectionStartTime = useRef(null);
  const ACTIVATION_DELAY = 500; // 500ms delay before activating

  // ... (in useEffect)
    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // ...
    };
  // ...

  const predictWebcam = () => {
    const landmarker = faceLandmarkerRef.current;
    const video = videoRef.current;

    if (landmarker && video && !video.paused && video.readyState >= 2) {
      const startTimeMs = performance.now();
      try {
          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            // Face Detected
            if (!detectionStartTime.current) {
                detectionStartTime.current = performance.now();
                setStatus("ACQUIRING...");
            }

            const timeSinceDetection = performance.now() - detectionStartTime.current;

            if (timeSinceDetection >= ACTIVATION_DELAY) {
                setStatus("TRACKING");
                const blendshapes = results.faceBlendshapes[0].categories;
                
                // --- Blink / Squint Detection ---
                // Indices for blink: eyeBlinkLeft (9), eyeBlinkRight (10)
                const eyeBlinkLeft = blendshapes.find(shape => shape.categoryName === 'eyeBlinkLeft');
                const eyeBlinkRight = blendshapes.find(shape => shape.categoryName === 'eyeBlinkRight');
                
                const blinkScore = (eyeBlinkLeft?.score + eyeBlinkRight?.score) / 2 || 0;
                
                let tension = (blinkScore - 0.05) * 1.5;
                tension = Math.max(0, Math.min(1, tension));

                // --- Gaze / Head Position Detection ---
                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    const landmarks = results.faceLandmarks[0];
                    
                    // 1. Head Position (Nose Tip)
                    const noseTip = landmarks[1];
                    const headX = (0.5 - noseTip.x) * 1.8; 
                    const headY = (0.5 - noseTip.y) * 1.8;

                    // 2. Eye Gaze from Blendshapes
                    const eyeLookInLeft = blendshapes.find(s => s.categoryName === 'eyeLookInLeft')?.score || 0;
                    const eyeLookOutLeft = blendshapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
                    const eyeLookUpLeft = blendshapes.find(s => s.categoryName === 'eyeLookUpLeft')?.score || 0;
                    const eyeLookDownLeft = blendshapes.find(s => s.categoryName === 'eyeLookDownLeft')?.score || 0;
                    
                    const eyeLookInRight = blendshapes.find(s => s.categoryName === 'eyeLookInRight')?.score || 0;
                    const eyeLookOutRight = blendshapes.find(s => s.categoryName === 'eyeLookOutRight')?.score || 0;
                    const eyeLookUpRight = blendshapes.find(s => s.categoryName === 'eyeLookUpRight')?.score || 0;
                    const eyeLookDownRight = blendshapes.find(s => s.categoryName === 'eyeLookDownRight')?.score || 0;

                    const lookLeftScore = eyeLookOutLeft + eyeLookInRight;
                    const lookRightScore = eyeLookInLeft + eyeLookOutRight;
                    const lookUpScore = eyeLookUpLeft + eyeLookUpRight;
                    const lookDownScore = eyeLookDownLeft + eyeLookDownRight;

                    const gazeX = (lookRightScore - lookLeftScore) * 1.0; 
                    const gazeY = (lookUpScore - lookDownScore) * 1.0;

                    let totalX = headX + gazeX;
                    let totalY = headY + gazeY;

                    // --- Mobile Correction ---
                    if (window.innerWidth < window.innerHeight) {
                        const aspectRatio = window.innerHeight / window.innerWidth;
                        totalX *= aspectRatio * 1.2; 
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
                // Waiting for delay - keep cursor centered but don't update isHandDetected to true yet
                // This effectively keeps it "Idle" but allows the system to know we see a face
                // No operation needed here, existing state persists (which is idle/center)
            }
          } else {
             // No face detected - Reset
             detectionStartTime.current = null;
             if (status === "TRACKING" || status === "ACQUIRING...") {
                 setStatus("SEARCHING...");
             }
             
             setGestureState(prev => ({ 
                 ...prev, 
                 isHandDetected: false,
                 tension: 0,
                 position: { x: 0, y: 0 } // Lock to center on idle
             }));
          }
      } catch (e) {
          console.error("Detection error:", e);
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
         {status}
       </div>
    </div>
  );
}
