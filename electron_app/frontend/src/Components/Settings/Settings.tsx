import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import { useController } from "../ControllerContext";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { registerHandler, registerButtonHandler } = useController();

  const [activeSection, setActiveSection] = useState<null | "audio" | "video" | "controller">(null);
  const [audioOn, setAudioOn] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = React.useRef<HTMLAudioElement>(null); 
  const [videoQuality, setVideoQuality] = useState("high");
  const [controllerScheme, setControllerScheme] = useState("classic");
  const [activeIndex, setActiveIndex] = useState(0);
  const menuOptions: (null | "audio" | "video" | "controller" | "reset")[] = [
    "audio", "video", "controller", "reset"];

  const handleReset = () => {
    setAudioOn(true);
    setVideoQuality("high");
    setControllerScheme("classic");
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
          {option === "video" && "Video Settings"}
          {option === "controller" && "Controller Mapping"}
          {option === "reset" && "Reset to Defaults"}
        </button>
      ))}
    </div>
  );

  const renderAudioSettings = () => (
    <div className="settings-subsection">
      <div className="setting-pair">
        <p className="setting-label">Toggle audio output:</p>
        <button onClick={() => setAudioOn(prev => !prev)}>
          {audioOn ? "Turn Audio Off 🔇" : "Turn Audio On 🔊"}
        </button>
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

  const renderVideoSettings = () => (
    <div className="settings-subsection">
      <div className="setting-pair">
        <p className="setting-label">Choose video quality:</p>
        <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button className="back-button" onClick={() => setActiveSection(null)}>← Back</button>
    </div>
  );

  const renderControllerSettings = () => (
    <div className="settings-subsection">
      <div className="setting-pair">
        <p className="setting-label">Select control scheme:</p>
        <select value={controllerScheme} onChange={(e) => setControllerScheme(e.target.value)}>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <button className="back-button" onClick={() => setActiveSection(null)}>← Back</button>
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
  
    registerButtonHandler("B", () => {
      if (activeSection === null) navigate("/emulators");
      else setActiveSection(null);
    });
  }, [activeIndex, activeSection]);

  return (
    <div className="settings-page">
      <h1>
        {activeSection === "audio"
          ? "Audio Settings"
          : activeSection === "video"
          ? "Video Settings"
          : activeSection === "controller"
          ? "Controller Mapping"
          : "Settings"}
      </h1>
      {activeSection === null && (
        <button onClick={() => navigate("/emulators")}>Back to Emulators</button>
      )}

      {activeSection === null && renderMainMenu()}
      {activeSection === "audio" && renderAudioSettings()}
      {activeSection === "video" && renderVideoSettings()}
      {activeSection === "controller" && renderControllerSettings()}
    </div>
  );
};

export default Settings;