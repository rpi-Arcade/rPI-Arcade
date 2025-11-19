import React, { useState, useEffect } from "react";
import Rotate from "./Rotating_Image";
import "./DetailsMain.css";
import { useNavigate } from "react-router-dom";

import emuData from '../../assets/emuData.json';

import { useController } from "../ControllerContext";

interface Emulator {
  text: string;
  description: string;
  image: string;
  games: string[];
}

interface DetailsMainProps {
  emulatorName: string;
}

const DetailsMain: React.FC<DetailsMainProps> = ({ emulatorName }) => {
  const navigate = useNavigate();
  const { registerButtonHandler } = useController();

  const goBack = () => {
    navigate('/emulators');
  };

  useEffect(() => {
    registerButtonHandler("B", goBack);
  }, [registerButtonHandler]);

  const [emulators] = useState<Emulator[]>(emuData);
  const [selectedEmulator, setSelectedEmulator] = useState<Emulator | null>(null);

  useEffect(() => {
    if (emulatorName) {
      const emulator = emulators.find(
        (em) => em.text.toLowerCase() === emulatorName.toLowerCase()
      );
      setSelectedEmulator(emulator || null);
    }
  }, [emulatorName, emulators]);


  return (
    <div className="Main_Div">

      {/* ADDED: Scanlines effect */}
      <div className="scanlines"></div>
      <div className="decorative-pixels"></div>

      <div className="container">
        <div className="header">
          <button className="back-button" onClick={goBack}>
            ◄ Back
          </button>
          <div className="logo-container">
            {/* ADDED: Rotating image in center */}
            <div className="rotating-image-wrapper">
              <Rotate 
                src={selectedEmulator?.image ?? "/path/to/fallback-image.webp"} 
                width="200px"
                height="200px"
              />
            </div>
            <div className="title-section">
              <h1 className="main-title">{emulatorName}</h1>
              <p className="subtitle">Emulator Information</p>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {/* ADDED: New structure matching the artifact design */}
          <div className="recommendations-section">
            <h2 className="section-title">Creator Recommendations</h2>
            {selectedEmulator ? (
              <ul className="game-list">
                {selectedEmulator.games.map((game, index) => (
                  <li key={index} className="game-item">► {game}</li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No games available</p>
            )}
          </div>

          <div className="info-section">
            <h2 className="section-title">About This Emulator</h2>
            {selectedEmulator ? (
              <p className="info-text">{selectedEmulator.description}</p>
            ) : (
              <p className="no-data">No emulator selected or emulator not found.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DetailsMain;