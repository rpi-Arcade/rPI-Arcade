import React, { useState, useEffect } from "react";
import Rotate from "./Rotating_Image";
import "./DetailsMain.css";
// import pixelPanel from "/images/pixelPanel.png";
import Mario64 from "/images/Mario64.gif";
import Sonic_Run_Right from "/images/DreamCast_Moving_Right.gif";
import Sonic_Run_Left from "/images/DreamCast_Moving_Left.gif";
import { useNavigate } from "react-router-dom";
import LeftBanner from "../Banners/LeftBanner";
import RightBanner from "../Banners/RightBanner";

import emuData from '../../assets/emuData.json';

import { useController } from "../ControllerContext";

// Define the shape of each emulator object
interface Emulator {
  text: string;
  description: string;
  image: string;
  games: string[];
}

// Define props for the DetailsMain component
interface DetailsMainProps {
  emulatorName: string;  // Emulator name passed as a prop
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

  const [sonicPosition, setSonicPosition] = useState(0); // Sonic's horizontal position
  const [direction] = useState<"right" | "left">("right"); // Movement direction
  const [sonicImage, setSonicImage] = useState(Sonic_Run_Right); // Current Sonic image

  useEffect(() => {
    if (emulatorName) {
      const emulator = emulators.find(
        (em) => em.text.toLowerCase() === emulatorName.toLowerCase()
      );
      setSelectedEmulator(emulator || null);
    }
  }, [emulatorName, emulators]);

  useEffect(() => {
    let currentDirection = direction; // Local variable to track direction

    const animateSonic = () => {
      setSonicPosition((prev) => {
        if (currentDirection === "right") {
          if (prev >= (window.innerWidth / 2) - 5) {
            currentDirection = "left"; // Update direction locally
            setSonicImage(Sonic_Run_Left);
            return prev - 2; // Start moving left
          }
          return prev + 2; // Move right
        } else {
          if (prev <= 2) {
            currentDirection = "right"; // Update direction locally
            setSonicImage(Sonic_Run_Right);
            return prev + 2; // Start moving right
          }
          return prev - 2; // Move left
        }
      });

      requestAnimationFrame(animateSonic);
    };
    const animationId = requestAnimationFrame(animateSonic);
    return () => cancelAnimationFrame(animationId); // Cleanup on unmount
  }, []); // Empty dependency array to run only once

  return (
    <div className="Main_Div">
      <LeftBanner />
      <RightBanner />
      {/* <img className="Side1" src={pixelPanel} alt="S1" /> */}
      {/* <img className="Side2" src={pixelPanel} alt="S2" /> */}
      <button className="standardButton active" onClick={goBack}>
        Back
      </button>
      <img className="Mario" src={Mario64} alt="Mario 64" />

      {/* Sonic GIF */}
      <img
        className="Link"
        src={sonicImage}
        alt="Sonic"
        style={{ left: `${sonicPosition}px` }}
      />

      {/* Canvas for 3D content */}

      {/* <Canvas className="canvas-container">
        <ambientLight intensity={2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="red" intensity={1} />
        <Cube
          src={selectedEmulator?.image ?? "/path/to/fallback-image.webp"} // in case no img found
        />
      </Canvas> */}
      <div className="canvas-container">
        <Rotate src={selectedEmulator?.image ?? "/path/to/fallback-image.webp"} />
      </div>
      {/* Display emulator information if found */}
      {selectedEmulator ? (
        <>
          <div className="emulator_summary">
            <p>{selectedEmulator.description}</p>
          </div>
          <div className="game_recommendations">
            <h1 className="creator_header">Creator Recommendations</h1>
            <ul
              className="actual_games"
              style={{ listStyleType: "none" }}
            >
              {selectedEmulator.games.map((game, index) => (
                <li key={index}>{game}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>No emulator selected or emulator not found.</p>
      )}
    </div>
  );
};

export default DetailsMain;