import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import "./Emulators.css";
import TopBanner from '../Banners/TopBanner.tsx';
import BotBanner from '../Banners/BotBanner.tsx';
import logo from "/images/Logo.png";
import { FiSettings } from "react-icons/fi";
import uploadIcon from "../../assets/uploadIcon.png"
import mascotGIF from "../../assets/mascotRPIRcade.gif"

import emuData from "../../assets/emuData.json";

import moveSound from "../../assets/SE_SYS_SLOT_FRAME.wav";

import { useController } from "../ControllerContext";
import { style } from "framer-motion/client";

// Type Definitions ==========================
interface EmulatorsProps {
  onEmuClick: (position: number) => void;
  position: number;
  setPosition: React.Dispatch<React.SetStateAction<number>>;
}

interface EmulatorItem {
  image: string;
  text: string;
  className: string;
  description: string;
  games: string[];
}

interface ElectronAPI {
  startEmulationStation: () => void;
  closeWindowOnGameLaunch: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
// ===========================================

// Mapping Dictionary - Translates the 'text' field from emuData.json to the actual ROMs folder name needed by the backend
const EMULATOR_NAME_MAP: { [key: string]: string } = {
  "SNES": "snes",
    "Desmume": "nds",
    "genesisPlusGX": "megadrive",
    "Mesen": "nes",
    "Mupen": "n64",
    "PCSX": "psx",      // PlayStation 1
    "PCSX2": "ps2",     // PlayStation 2 (Assumed folder name)
    "PPSSPP": "psp",
    "Redream": "dreamcast"
};

const Emulators: React.FC<EmulatorsProps> = ({
  onEmuClick,
  position,
  setPosition,
}) => {
  const navigate = useNavigate();
  const { registerHandler, registerButtonHandler } = useController();
  const [mascotVisible, setMascotVisible] = useState(false);

  const secretCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight'
  ];

  //For keyboard inputs
  const secretCodePosition = useRef(0);
  const lastKeyPress = useRef(0);
  const COOLDOWN = 250;

  //For SFX
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);

  const addGamesBox = {
    image: "",
    text: "ADD GAMES",
  };

  const playGamesBox = {
    image: "/images/emustation.png",
    text: "LAUNCH"
  };

  const allEmuData = [...emuData, addGamesBox, playGamesBox]; //concat addGamesBox
  const totalBoxes = allEmuData.length;

  const totalEmulatorCount = emuData.length;
  const addGamesIndex = totalEmulatorCount;
  const playGamesIndex = totalEmulatorCount + 1;

  const handleFlashdriveSelection = React.useCallback(() => {
      navigate("/flashdrive");
  }, [navigate]);

  const handleSettingsClick = React.useCallback(() => {
      navigate("/settings");
  }, [navigate]);

  const handleLogoClick = React.useCallback(() => {
      navigate("/");
  }, [navigate]); // navigate is stable, so this function is stable

  const playMoveSound = () => {
    if (moveAudioRef.current) {
      moveAudioRef.current.currentTime = 0;
      moveAudioRef.current.play().catch(() => {});
    }
  };

  const handleRightMove = () => {
    playMoveSound();
    setPosition((prev) => (prev < totalBoxes - 1 ? prev + 1 : 0));
  };

  const handleLeftMove = () => {
    playMoveSound();
    setPosition((prev) => (prev > 0 ? prev - 1 : totalBoxes - 1));
  };

  const handleEmulatorSelection = () => {
    // 1. Calculate the correct index for the emuData array (always position - 1)
    const emuIndex = position - 1; 
    const totalEmulatorCount = emuData.length;

    // Ensure the index is valid for the emuData array
    if (emuIndex >= 0 && emuIndex < totalEmulatorCount) {
        // Retrieve the CORRECT emulator data object
        const selectedEmulator = emuData[emuIndex] as EmulatorItem;

        if (selectedEmulator) {
            const emulatorName = EMULATOR_NAME_MAP[selectedEmulator.text];

            if (emulatorName) {
                navigate("/details", { 
                    state: { 
                        emulatorName: emulatorName, 
                        emulatorText: selectedEmulator.text 
                    } 
                });
                onEmuClick(emuIndex);
            } else {
                console.error(`Error: Could not find ROM folder mapping for text: ${selectedEmulator.text}`);
            }
        }
    } else {
        // This should ideally not happen if the caller ensures position is on an emulator
        console.error(`Invalid position (${emuIndex}) for emulator selection.`);
    }
  };


  // Stop app and open EmulationStation; sends command to Electron backend via IPC
  const handlePlaySelection = () => {
    console.log("sending msg")
    window.electronAPI.startEmulationStation();
    console.log("returning from sending msg")
  };

  // Register controller handlers for this page
  useEffect(() => {
    registerHandler("left", handleLeftMove);
    registerHandler("right", handleRightMove);

    // Note for future reference: Since this is a horizontal menu, we usually don't need Up/Down 
    // for navigation, but if you want them to do something, register them here.
    // registerHandler("up", () => console.log("Up pressed")); 
    // registerHandler("down", () => console.log("Down pressed"));

    registerButtonHandler("B", handleLogoClick);

    moveAudioRef.current = new Audio(moveSound);
    moveAudioRef.current.volume = 0.5;

    registerButtonHandler("X", () => { console.log("X press ignored.") });
    registerButtonHandler("A", () => { console.log("A press ignored.") });

    if (position >= 0 && position < totalEmulatorCount) {
        registerButtonHandler("X", handleEmulatorSelection);
        registerButtonHandler("A", handleEmulatorSelection);
    } 
    // 2. The USB box is at totalEmulatorCount
    else if (position === addGamesIndex) {
        registerButtonHandler("X", handleFlashdriveSelection);
        registerButtonHandler("A", handleFlashdriveSelection);
    } 
    // 3. The LAUNCH box is at the very end
    else if (position === playGamesIndex) {
        registerButtonHandler("X", handlePlaySelection);
        registerButtonHandler("A", handlePlaySelection);
    }

    return () => {
      registerHandler("left", () => {});
      registerHandler("right", () => {});
      registerButtonHandler("B", () => {});
      registerButtonHandler("X", () => {});
      registerButtonHandler("A", () => {});
    };
  }, [position, registerHandler, registerButtonHandler, addGamesIndex, playGamesIndex, totalEmulatorCount]);

// Arrow Key Function 

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {

    if (e.key === "Escape") {
        handleLogoClick(); // Navigates to the root path ("/")
        return; // Stop processing other keys
    }

    if (e.key === secretCode[secretCodePosition.current]) {
      secretCodePosition.current++;
    } else {
      secretCodePosition.current = (e.key === secretCode[0]) ? 1 : 0;
    }

    if (secretCodePosition.current === secretCode.length) {
      setMascotVisible(true); // Show the mascot!
      secretCodePosition.current = 0; // Reset for next time
    }

    const now = Date.now();
    if (now - lastKeyPress.current < COOLDOWN) return;
    

    if (e.key === "ArrowLeft") {
      lastKeyPress.current = now;
      handleLeftMove();
    } else if (e.key === "ArrowRight") {
      lastKeyPress.current = now;
      handleRightMove();
    } 
  };

    window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLogoClick, handleLeftMove, handleRightMove]);

  return (
    <div className="emulators">
      <TopBanner />
      <BotBanner />
      <FiSettings className="settings-icon" onClick={handleSettingsClick} />
      <img src={logo} alt="logo" className="logo" style={{ opacity: 0, zIndex:"99"}} onClick={handleLogoClick}/>
      <div className={`mascotGIFWrapper ${mascotVisible ? "visible" : ""}`}>
          <img src={mascotGIF} alt="mascot gif" className="mascotGIF"/>
        </div>
      {/* This logo is invisible & just for testing purposes; on click, returns to startup screen. */}
      <img src={logo} alt="logo" className="logo" style={{ opacity: 0, zIndex: "99" }} onClick={handleLogoClick} />
      {/* Middle Section =====================================================*/}
      <div className="middle">
        

        <div className="carousel">
          {allEmuData.map((box, index) => {
            const offset = (position - index - 1 + totalBoxes) % totalBoxes;

            // Start angle from +90 degrees (Math.PI/2) so the active item is at bottom center
            const angle = (offset / totalBoxes) * 2 * Math.PI + Math.PI / 2;

            // Radii x and y for the elliptical path
            const xRadius = 500; // horizontal
            const yRadius = 50; // vertical

            // Calculate positions using elliptical coordinates
            const xPosition = xRadius * Math.cos(angle);
            const yPosition = yRadius * Math.sin(angle);
            let scale = 1;
            let zIndex = 1;
            const maxZIndex = totalBoxes; // Set maxZIndex to total number of boxes

            // The closer the box is to the center, the larger it is
            if (offset === 0) {
              scale = 1.2;
              zIndex = maxZIndex;
            } else if (offset === 1 || offset === totalBoxes - 1) {
              scale = 1;
              zIndex = maxZIndex - 1;
            } else {
              // For other boxes, calculate zIndex based on their offset
              const relativePosition = Math.abs(
                offset - Math.floor(totalBoxes / 2)
              );
              zIndex = relativePosition - maxZIndex - 2;
              // Calculate scale based on zIndex and clamp the value between 0.4 and 0.8
              scale = Math.min(0.85, Math.max(0.5, 1 - zIndex * -0.02));
            }

            return (
            <div key={index} className={`spinWrapper ${offset === 0 ? "bouncing" : ""}`} style={{ zIndex }}>
              <motion.div
              className={`box ${index === totalBoxes - 2 || index === totalBoxes - 1 ? "borderCustom" : ""}`}
              animate={{
                x: xPosition,
                y: yPosition,
                scale: scale,
                // No rotateY here, it's handled by CSS animation
              }}
              transition={{
                x: { type: "spring", stiffness: 600, damping: 60 },
                y: { type: "spring", stiffness: 600, damping: 60 },
                scale: { type: "spring", stiffness: 600, damping: 60 },
              }}
              >
              {/* Render all boxes. Note that certain boxes like addGamesBox and launchGamesBox
                  are special so they get their own styles. */}
                {index === totalBoxes - 2 ? (
                  <div className="addGamesBox">
                    <div className="addGames">
                      <img src={uploadIcon} alt="uploadIcon" className="uploadIcon" />
                      <p> Upload Files </p>
                    </div>

                    <p style={{ textAlign: "left", fontSize: "24px", margin: "5% 0 0 0" }}>
                      Requires flashdrive. <br /><br />
                      Select to see format.
                    </p>
                  </div>
                ) : index === totalBoxes - 1 ? (
                  <div className="launchGamesBox">
                    <p style={{ margin: "0" }}> ★ {box.text} ★ </p>
                    <p style={{ margin: 0 }}> GAME MENU </p>
                    <img src={box.image} alt={`Box ${index + 1}`} />
                  </div>
                ) : (
                  <>
                    <img src={box.image} alt={`Box ${index + 1}`} />
                    <p className="boxText">{box.text}</p>
                  </>
                )}
              </motion.div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section =====================================================*/}
      <div className="bottom">

        <div className="text">
          {position === totalBoxes - 1 ? (
            <>
              <div className="buttonDesc">
                <p> Press </p>
                <button
                  className="standardButton active"
                  onClick={handleFlashdriveSelection}
                  style={{ margin:"10px"}}
                >
                  X
                </button>
                <p> to access </p>
              </div>
              <p className="title">Flashdrive Details & Upload Games</p>
            </>
          ) : position === 0 ? (
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
              <div className="buttonDesc">
                <p> Press </p>
                <button
                  className="standardButton active"
                  onClick={handlePlaySelection}
                  style={{ margin:"10px"}}
                >
                  X
                </button>
                <p> to </p>
              </div>
              <p className="title">PLAY</p>
            </div>
          ) : (
            <>
              <div className="buttonDesc">
                <p> Press </p>
                <button
                  className="standardButton"
                  onClick={handleEmulatorSelection}
                  style={{ margin:"10px"}}
                >
                  X
                </button>
                <p> for </p>
              </div>
              <p className="title">Emulator Details</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emulators;
