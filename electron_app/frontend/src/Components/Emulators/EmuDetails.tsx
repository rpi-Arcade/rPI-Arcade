// EmuDetails.tsx (New Component)

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useController } from "../ControllerContext";
import { io, Socket } from "socket.io-client";

import "./EmuDetails.css"; // Create this file for styling
import TopBanner from '../Banners/TopBanner.tsx';
import BotBanner from '../Banners/BotBanner.tsx';
import moveSound from "../../assets/SE_SYS_SLOT_FRAME.wav";

import emuData from '../../assets/emuData.json';
import Rotate from "../Details/Rotating_Image"; // Might need to change directories


// SocketIO URL must match flask_socket_server.py
const SOCKET_SERVER_URL = "http://127.0.0.1:5002";

// Type definition for navigation state
interface EmuDetailsState {
    emulatorName: string; // (ROM folder name)
    emulatorText: string; // (Display name)
}

// Interface to match the structure in emuData.json (for local lookup)
interface EmulatorData {
    text: string;
    description: string;
    image: string;
    games: string[];
    // Add other fields like className if needed by Rotate
}

const EmuDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerHandler, registerButtonHandler } = useController();

  const { emulatorName, emulatorText } = (location.state || {}) as EmuDetailsState;
  
  const [games, setGames] = useState<string[]>([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameListRef = useRef<HTMLDivElement>(null);

  // Local Lookup for Static Data (Image & Desc.)
  const staticEmuData = useMemo(() => {
    if (emulatorText) {
        return (emuData as EmulatorData[]).find(
            (em) => em.text.toLowerCase() === emulatorText.toLowerCase()
        ) || null;
    }
    return null;
  }, [emulatorText]);

  // Initialize Audio
  useEffect(() => {
    moveAudioRef.current = new Audio(moveSound);
    moveAudioRef.current.volume = 0.5;
  }, []);

  const playMoveSound = () => {
    if (moveAudioRef.current) {
      moveAudioRef.current.currentTime = 0;
      moveAudioRef.current.play().catch(() => {});
    }
  };

  // --- Socket Connection and Data Fetching ---
  useEffect(() => {
    if (!emulatorName) {
        setLoading(false);
        setGames(["Error: Emulator not found."]);
        return;
    }
    
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Flask server.');
      socket.emit("get_games_list", { emulator: emulatorName });
    });

    socket.on("games_list_response", (data) => {

      console.log("DEBUG: Games list received:", data);

      setLoading(false);
      if (data.emulator === emulatorName && Array.isArray(data.games)) {
        setGames(data.games);
        setSelectedGameIndex(0); // Reset selection after loading new list
      } else {
        console.error("DEBUG: Games list received, but structure is wrong or empty:", data);
      }
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setLoading(false);
        setGames(["Error connecting to backend."]);
    });

    return () => {
      socket.disconnect();
    };
  }, [emulatorName]);

  // --- Scrolling Effect (for usability) ---
    useEffect(() => {
        const listContainer = gameListRef.current?.querySelector('.game-list');
        if (listContainer) {
            const selectedItem = listContainer.children[selectedGameIndex] as HTMLLIElement;
            if (selectedItem) {
                selectedItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }
    }, [selectedGameIndex, games]);

  // --- Controller/Key Handlers ---

const handleBack = useCallback(() => {
    navigate('/emulators'); // Navigate specifically to /emulators to ensure correct context
}, [navigate]);

  const handleUpMove = () => {
    if (games.length === 0) return;
    playMoveSound();
    setSelectedGameIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1));
  };

  const handleDownMove = () => {
    if (games.length === 0) return;
    playMoveSound();
    setSelectedGameIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0));
  };

  const handleGameLaunch = (gameOverride?: string | unknown) => {

    const gameFile = (typeof gameOverride === 'string') 
        ? gameOverride 
        : games[selectedGameIndex];
    
    const socket = socketRef.current;
    
    if (!gameFile || !emulatorName || !socket || !socket.connected) {
      console.error("Launch failed: Check connection or game selection.");
      return;
    }
    
    console.log(`Launching game: ${emulatorName}/${gameFile}`);
    
    // 1. Tell the Python backend to launch the game
    socket.emit("launch_game", { 
        emulator: emulatorName, 
        game_file: gameFile 
    });
    
    // 2. Instruct the Electron main process to close the window (via IPC)
    window.electronAPI.closeWindowOnGameLaunch();
  };

  // --- Register Handlers Effect ---
  useEffect(() => {
    registerHandler("up", handleUpMove);
    registerHandler("down", handleDownMove);
    registerButtonHandler("B", handleBack);      // B button to go back
    registerButtonHandler("X", handleGameLaunch); // X button to launch game
    registerButtonHandler("A", handleGameLaunch); // X button to launch game

    const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            handleBack(); // Use the existing function that calls navigate(-1)
        }
        if (e.key === "ArrowUp") handleUpMove();
        if (e.key === "ArrowDown") handleDownMove();
        if (e.key === "Enter") handleGameLaunch();
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
        // Replace the handlers with empty functions to effectively clear them
        registerHandler("up", () => {});
        registerHandler("down", () => {});
        registerButtonHandler("X", () => {});
        registerButtonHandler("A", () => {});
        registerButtonHandler("B", () => {});

        window.removeEventListener("keydown", handleEscapeKey);
    };

  }, [games, selectedGameIndex, emulatorName, registerHandler, registerButtonHandler, handleBack]);



// EmuDetails.tsx (MERGED RETURN STATEMENT)

    return (
        // Outer container adopted from DetailsMain.css
        <div className="Main_Div"> 
            {/* UI Decorations from DetailsMain */}
            <div className="scanlines"></div>
            <div className="decorative-pixels"></div>

            <div className="container">
                <div className="header">
                    {/* Back button linked to handleBack function */}
                    <button className="emu-back-button" onClick={handleBack}>
                        ◄ Back
                    </button>
                    
                    <div className="logo-container">
                        {/* Rotating image in center (Requires 'Rotate' component import) */}
                        <div className="rotating-image-wrapper">
                            <Rotate 
                                // Using the statically looked-up image path
                                src={staticEmuData?.image ?? "/path/to/fallback-image.webp"} 
                                width="200px"
                                height="200px"
                            />
                        </div>

                        <div className="title-section">
                            {/* Use the statically looked-up text for main title */}
                            <h1 className="main-title">{staticEmuData?.text || emulatorText}</h1> 
                            <p className="subtitle">Game Selection Menu</p>
                        </div>
                    </div>
                </div>

                {/* Content Grid: Holds the Game List (Left) and Description (Right) */}
                <div className="content-grid" ref={gameListRef}> 
                    
                    {/* LEFT SIDE: DYNAMIC GAME LIST & CONTROLS */}
                    <div className="recommendations-section list-container">
                        <h2 className="section-title">Available Games</h2>
                        
                        {loading ? (
                            <p className="status-message">Fetching Roms from Pi...</p>
                        ) : games.length === 0 || games[0].includes("Error") ? (
                            <p className="no-data">{games[0] || `No games found for ${emulatorText}.`}</p>
                        ) : (
                            // Dynamic Game List (uses selection and scrolling logic)
                            <ul className="game-list">
                                {games.map((game, index) => (
                                    <li 
                                        key={game} 
                                        className={`game-item ${index === selectedGameIndex ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedGameIndex(index);
                                            handleGameLaunch(game);
                                        }}
                                    >
                                        ► {game.replace(/\.[^/.]+$/, "")}
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {/* Combined control information footer */}
                        <div className="controls-footer"> 
                            <p>Use **Up/Down** to Select | Press **X** to Launch | Press **B** or **ESC** to Go Back</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: EMULATOR DESCRIPTION (Static Content) */}
                    <div className="info-section">
                        <h2 className="section-title">Emulator Information</h2>
                        {staticEmuData ? (
                            <p className="info-text">{staticEmuData.description}</p>
                        ) : (
                            <p className="no-data">Loading metadata...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmuDetails;