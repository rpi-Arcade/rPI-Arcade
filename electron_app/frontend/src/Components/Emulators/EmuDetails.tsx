// EmuDetails.tsx (New Component)

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useController } from "../ControllerContext";
import { io, Socket } from "socket.io-client";

import "./EmuDetails.css"; // Create this file for styling
import TopBanner from '../Banners/TopBanner.tsx';
import BotBanner from '../Banners/BotBanner.tsx';
import moveSound from "../../assets/SE_SYS_SLOT_FRAME.wav";

// SocketIO URL must match flask_socket_server.py
const SOCKET_SERVER_URL = "http://127.0.0.1:5002";

// Type definition for navigation state
interface EmuDetailsState {
    emulatorName: string; 
    emulatorText: string; 
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
  const gameListRef = useRef<HTMLUListElement>(null);

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
      setLoading(false);
      if (data.emulator === emulatorName && Array.isArray(data.games)) {
        setGames(data.games);
        setSelectedGameIndex(0); // Reset selection after loading new list
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
    const list = gameListRef.current;
    if (list) {
      const selectedItem = list.children[selectedGameIndex] as HTMLLIElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedGameIndex, games]);

  // --- Controller/Key Handlers ---

  const handleBack = () => {
    navigate(-1); // Go back to the Emulators menu
  };

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

  const handleGameLaunch = () => {
    const gameFile = games[selectedGameIndex];
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

    const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            handleBack(); // Use the existing function that calls navigate(-1)
        }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
        // Replace the handlers with empty functions to effectively clear them
        registerHandler("up", () => {});
        registerHandler("down", () => {});
        registerButtonHandler("X", () => {});
        registerButtonHandler("B", () => {});

        window.removeEventListener("keydown", handleEscapeKey);
    };

  }, [games, selectedGameIndex, emulatorName, registerHandler, registerButtonHandler, handleBack]);



  return (
    <div className="emu-details-page">
      <TopBanner />
      <BotBanner />
      
      <div className="game-list-content">
        <h1>{emulatorText}</h1>
        
        {loading ? (
            <p className="status-message">Loading games...</p>
        ) : games.length === 0 || games[0].includes("Error") ? (
            <p className="status-message">{games[0] || `No games found for ${emulatorText}.`}</p>
        ) : (
          <ul className="game-list" ref={gameListRef}>
            {games.map((game, index) => (
              <li 
                key={game} 
                className={index === selectedGameIndex ? "selected" : ""}
                // Allows direct mouse clicking to select and launch
                onClick={() => {
                    setSelectedGameIndex(index);
                    handleGameLaunch();
                }}
              >
                {/* Remove file extension and format for display */}
                {game.replace(/\.[^/.]+$/, "")} 
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="game-launch-info">
          <p>Use **Up/Down** to Select | Press **X** to Launch | Press **B** to Go Back</p>
      </div>

    </div>
  );
};

export default EmuDetails;