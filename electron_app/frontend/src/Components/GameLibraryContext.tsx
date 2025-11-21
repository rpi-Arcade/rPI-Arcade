import React, { createContext, useContext, useState } from "react";

interface GameLibrary {
  [system: string]: string[];
}

interface GameLibraryContextType {
  games: GameLibrary;
  setGames: React.Dispatch<React.SetStateAction<GameLibrary>>;
}

const GameLibraryContext = createContext<GameLibraryContextType | undefined>(undefined);

export const GameLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<GameLibrary>({});

  return (
    <GameLibraryContext.Provider value={{ games, setGames }}>
      {children}
    </GameLibraryContext.Provider>
  );
};

export const useGameLibrary = (): GameLibraryContextType => {
  const context = useContext(GameLibraryContext);
  if (!context) {
    throw new Error("useGameLibrary must be used within a GameLibraryProvider");
  }
  return context;
};
