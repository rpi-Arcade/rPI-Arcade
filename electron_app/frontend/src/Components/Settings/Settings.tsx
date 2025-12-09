import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import TopBanner from '../Banners/TopBanner.tsx';
import BotBanner from '../Banners/BotBanner.tsx';
import logo from "/images/Logo.png";
import { useController } from "../ControllerContext";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { registerHandler, registerButtonHandler } = useController();

  const [activeSection, setActiveSection] = useState<null | "audio">(null);
  const [audioOn, setAudioOn] = useState(true);
  const [volume, setVolume] = useState(0.5);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "random");
  const audioRef = React.useRef<HTMLAudioElement>(null); 
  const [activeIndex, setActiveIndex] = useState(0);
  const menuOptions: (null | "audio" | "theme" | "reset")[] = ["audio", "theme", "reset"];

  const handleReset = () => {
    setAudioOn(true);
    setVolume(0.5);    
    setTheme("random");
    localStorage.setItem("theme", "random");
  };

  const handleLogoClick = () => {
    navigate("/emulators");
  };

  const renderMainMenu = () => (
    <div className="settings-options">
      {menuOptions.map((option, i) => (
        <button
          key={option ?? "reset"}
          className={i === activeIndex ? "highlighted" : ""}
          onClick={() => {
            if (option === "reset") handleReset();
            else setActiveSection(option);
          }}
        >
          {option === "audio" && "Audio Settings"}
          {option === "theme" && "Theme Settings"}
          {option === "reset" && "Reset to Defaults"}
        </button>
      ))}
    </div>
  );

  const renderAudioSettings = () => (
    <div className="settings-subsection">
      <div className="setting-pair">
        <p className="setting-label">Toggle audio output:</p>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <label className="toggle-switch" aria-label="Toggle audio">
            <input
              type="checkbox"
              checked={audioOn}
              onChange={(e) => setAudioOn(e.target.checked)}
            />
            <span className="switch-slider" />
          </label>
        </div>
      </div>
      <div className="setting-pair">
        <p className="setting-label">Volume:</p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
      <button className="back-button" onClick={() => setActiveSection(null)}>← Back</button>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="settings-subsection">
      <div className="setting-pair">
        <p className="setting-label">Choose Theme:</p>
        <select
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value);
            localStorage.setItem("theme", e.target.value);
          }}
        >
          <option value="random">Random</option>
          <option value="circles">Circles</option>
          <option value="squares">Squares</option>
          <option value="diamonds">Diamonds</option>
          <option value="waves">Waves</option>
        </select>
      </div>
      <button className="back-button" onClick={() => setActiveSection(null)}>
        ← Back
      </button>
    </div>
  );

  useEffect(() => { // Volume control
    if (audioRef.current) {
      audioRef.current.volume = audioOn ? volume : 0;
    }
  }, [volume, audioOn]);

  useEffect(() => { // Contoller navigation
    registerHandler("up", () => {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : menuOptions.length - 1));
    });
  
    registerHandler("down", () => {
      setActiveIndex((prev) => (prev < menuOptions.length - 1 ? prev + 1 : 0));
    });
  
    registerButtonHandler("X", () => {
      const selected = menuOptions[activeIndex];
      if (selected === "reset") handleReset();
      else setActiveSection(selected as typeof activeSection);
    });
  
     registerButtonHandler("B", handleLogoClick);
  }, [activeIndex, activeSection]);

  return (
    <div className="settings-page">
      <TopBanner />
      <BotBanner />
      <h1>{activeSection === "audio" ? "Audio Settings" : "Settings"}</h1>
      {activeSection === null && (
        <button onClick={handleLogoClick}>Back to Emulators</button>
      )}

      {activeSection === null && renderMainMenu()}
      {activeSection === "audio" && renderAudioSettings()}
      {activeSection === "theme" && renderThemeSettings()}
      {/* This logo is invisible & just for testing purposes; on click, returns to emulators screen. */}
      <img src={logo} alt="logo" className="logo" style={{ opacity: 0, zIndex: "99" }} onClick={handleLogoClick} />
    </div>
  );
};

export default Settings;