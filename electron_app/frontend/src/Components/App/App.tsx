/* 
App.tsx contains the routes to the different pages available through the startup screen (/), 
including /emulators, /details, and /flashdrive.
From /emulators, you can select different emulators to view their individual details page (/details).
App.tsx also keeps track of which details page to open and which position in the carousel to return to after exiting.
*/

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Emulators from '../Emulators/Emulators';
//import DetailsMain from '../Details/DetailsMain.js';
import Flashdrive from '../Flashdrive/Flashdrive.tsx';
import Startup from '../Startup/Startup.tsx';
import Settings from '../Settings/Settings.tsx';
import backdrop from "/images/backdrop.png";

import EmuDetails from '../Emulators/EmuDetails.tsx'

//import boxData from "../../assets/emuData.json";

function App() {
  const [selectedEmu, setSelectedEmu] = useState<number | null>(null); // Keep track of what emu to open for the Details page
  const [position, setPosition] = useState<number>(0); // Help preserve position after returning to selection screen

  const handleEmuClick = (position: number) => {
      setSelectedEmu(position);
  };

  return (
    <>
      <img src={backdrop} alt="backdrop" className="backDrop" />

      <Router>
        <Routes>
          {/* Startup screen */}
          <Route path="/" element={<Startup />} />

          {/* Main Emulator selection screen */}
          <Route
            path="/emulators"
            element={<Emulators onEmuClick={handleEmuClick} position={position} setPosition={setPosition} />}
          />
  
          {/* Settings page */}
          <Route 
            path="/settings"
            element={<Settings />} 
          />

          {/* Details page for selected emulator */}
          <Route
            path="/details"
            element={<EmuDetails />}
          />

          {/* Flashdrive page */}
          <Route
            path="/flashdrive"
            element={<Flashdrive />}
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;