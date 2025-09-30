import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Startup.css";
import TopBanner from '../Banners/TopBanner.tsx';
import BotBanner from '../Banners/BotBanner.tsx';
import vid from '../../assets/rpi_arcade4.mp4';
import demo from '../../assets/Marvel Super Heroes (Capcom 1995)  Attract Mode 60fps.mp4';
import { useController } from "../ControllerContext";

const gifs = [
  '/images/EB1.gif',
  '/images/EB2.gif',
  // '../assets/EB3.gif',
  // '../assets/EB4.gif',
];

const Startup = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [inAttractMode, setInAttractMode] = useState(false);
  const navigate = useNavigate();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [randomGif, setRandomGif] = useState("");
  const { registerButtonHandler } = useController();

  useEffect(() => {
    // Select a random GIF when the component mounts
    const randomIndex = Math.floor(Math.random() * gifs.length);
    setRandomGif(gifs[randomIndex]);
  }, []);

  const [videoPlayed, setVideoPlayed] = useState(() => { // Use sessionStorage to store state PER SESSION (changes on refresh)
    return sessionStorage.getItem("videoPlayed") === "true"; // Defaults to false if not found
  });

  useEffect(() => { // Save videoPlayed state to sessionStorage
    sessionStorage.setItem("videoPlayed", videoPlayed.toString());
  }, [videoPlayed]);

  // Clear any existing timer and start a new one
  const startInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.log("Entering attract mode");
      setInAttractMode(true);
    }, 30000); // 30 seconds of inactivity triggers attract mode
  };

  // Reset inactivity timer and exit attract mode
  const resetInactivityTimer = () => {
    console.log("Resetting inactivity timer");
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    startInactivityTimer();
    setInAttractMode(false);
  };

  // Initial intro video handler
  const handleVideoEnd = () => {
    console.log("Video ended, showing title screen");
    setShowTitle(true);
    setVideoPlayed(true); // Mark video as played
    startInactivityTimer(); // Start inactivity timer immediately after video ends
  };

  const handleClick = () => {
    if (!inAttractMode) { 
      navigate("/emulators");
    }
    resetInactivityTimer();
  }

  useEffect(() => { //register button inputs
    console.log("X detected")
    registerButtonHandler("X", handleClick);
    registerButtonHandler("A", resetInactivityTimer);
    registerButtonHandler("B", resetInactivityTimer);
    registerButtonHandler("Y", resetInactivityTimer);
    registerButtonHandler("A", resetInactivityTimer);
    registerButtonHandler("LB", resetInactivityTimer);
    registerButtonHandler("LT", resetInactivityTimer);
    registerButtonHandler("RB", resetInactivityTimer);
    registerButtonHandler("RT", resetInactivityTimer);
    registerButtonHandler("Select", resetInactivityTimer);
    registerButtonHandler("Start", handleClick);
  }, [registerButtonHandler]);

  // Track user interactions to reset the timer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !inAttractMode) { // Set up event listeners only after the title screen is shown
        navigate("/emulators"); // Navigate to Emulator page
      }
      resetInactivityTimer();
    };
    window.addEventListener("keydown", handleKeyDown);

    if (showTitle) {
      startInactivityTimer(); // Ensure the timer is running when title shows
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        console.log("return", videoPlayed)
      }
    };
  }, [showTitle, inAttractMode, navigate]);

  return (
    <div className="startup">
      {!videoPlayed && !showTitle ? ( // Play the video first (only if first startup)
        console.log("vid", videoPlayed),
        <video autoPlay onEnded={handleVideoEnd}>
          <source src={vid} type="video/mp4" />
        </video>
      ) : inAttractMode ? (
        <div className="attractMode">
          {/* Flashing Text */}
          <p className="push-start">Push Start Button</p>
          <video autoPlay loop>
            <source src={demo} type="video/mp4" />
          </video>
        </div>
      ) : ( // If the intro already played, show title screen
        <div className="titleScreen">
          <TopBanner />
          <BotBanner />
          <div className='backDrop'
            style={{
              background: `url(${randomGif}) repeat 0 0`,
            }}
          />
          {/* Title Section */}
          <div className="middle">
            <h1>rPi Arcade</h1>
            <p>An RCOS Project</p>

            {/* Flashing Text */}
            <p className="push-start">Push Start Button</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Startup;