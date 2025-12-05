import React from 'react';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import Overlay from './components/ui/Overlay';
import { GestureProvider } from './context/GestureContext';

function App() {
  return (
    <GestureProvider>
      <main className="w-full h-screen bg-black text-white overflow-hidden">
        <Scene />
        <HandTracker />
        <Overlay />
      </main>
    </GestureProvider>
  );
}

export default App;

