import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Startup.css";
import TopBanner from '../Banners/TopBanner';
import BotBanner from '../Banners/BotBanner';
import vid from '../../assets/rpi_arcade4.mp4';
import demo from '../../assets/Marvel Super Heroes (Capcom 1995)  Attract Mode 60fps.mp4';
import { useController } from "../ControllerContext";

const Startup = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [inAttractMode, setInAttractMode] = useState(false);
  const navigate = useNavigate();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { registerButtonHandler } = useController();

  const [videoPlayed, setVideoPlayed] = useState(() => {
    return sessionStorage.getItem("videoPlayed") === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("videoPlayed", videoPlayed.toString());
  }, [videoPlayed]);

  const startInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.log("Entering attract mode");
      setInAttractMode(true);
    }, 30000);
  };

  const resetInactivityTimer = () => {
    console.log("Resetting inactivity timer");
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    startInactivityTimer();
    setInAttractMode(false);
  };

  const handleVideoEnd = () => {
    console.log("Video ended, showing title screen");
    setShowTitle(true);
    setVideoPlayed(true);
    startInactivityTimer();
  };

  const handleClick = () => {
    if (!inAttractMode) { 
      navigate("/emulators");
    }
    resetInactivityTimer();
  }

  useEffect(() => {
    console.log("X detected")
    registerButtonHandler("X", handleClick);
    registerButtonHandler("A", resetInactivityTimer);
    registerButtonHandler("B", resetInactivityTimer);
    registerButtonHandler("Y", resetInactivityTimer);
    registerButtonHandler("LB", resetInactivityTimer);
    registerButtonHandler("LT", resetInactivityTimer);
    registerButtonHandler("RB", resetInactivityTimer);
    registerButtonHandler("RT", resetInactivityTimer);
    registerButtonHandler("Select", resetInactivityTimer);
    registerButtonHandler("Start", handleClick);
  }, [registerButtonHandler]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !inAttractMode) {
        navigate("/emulators");
      }
      resetInactivityTimer();
    };
    window.addEventListener("keydown", handleKeyDown);

    if (showTitle) {
      startInactivityTimer();
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
      {!videoPlayed && !showTitle ? (
        console.log("vid", videoPlayed),
        <video autoPlay onEnded={handleVideoEnd}>
          <source src={vid} type="video/mp4" />
        </video>
      ) : inAttractMode ? (
        <div className="attractMode">
          <p className="push-start">Push Start Button</p>
          <video autoPlay loop>
            <source src={demo} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="titleScreen">
          <TopBanner />
          <BotBanner />
          <div className='backDrop'>
            <div className="horizon-glow"></div>
          </div>
          <div className="middle">
            <h1>rPi Arcade</h1>
            <p>An RCOS Project</p>
            <p className="push-start">Push Start Button</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Startup;