import React from 'react';
import Scene from './components/Scene';
import EyeTracker from './components/EyeTracker';
import Overlay from './components/ui/Overlay';
import VaporwaveModal from './components/Game/VaporwaveModal';
import { GestureProvider } from './context/GestureContext';
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

function App() {
  return (
    <GestureProvider>
      <main className="w-full h-screen bg-black text-white overflow-hidden font-sans relative">
        <Scene />
        <EyeTracker />
        <Overlay />
        <VaporwaveModal />
      </main>
    </GestureProvider>
  );
}

export default App;
