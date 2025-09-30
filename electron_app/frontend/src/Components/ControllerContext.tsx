import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5002", { 
  transports: ["websocket"],
  reconnection: true,
  autoConnect: true,
  reconnectionAttempts: 5,
  timeout: 5000,
});


/* Context for allowing frontend to create handlers that map controller input to interactions on the GUI

  direction: joystick action ("left", "right", "up", "down", "released").
  handler: Calibrated for individual components, for example in Emulator.ts:
      > registerHandler("left", handleLeftClick);    
            ---> Associates action "left" with function: handeLeftClick */
interface ControllerContextType {
  events: string[];  // Store directions or events as strings
  registerHandler: (direction: string, handler: () => void) => void;
  registerButtonHandler: (button: string, handler: () => void) => void;
}

const ControllerContext = createContext<ControllerContextType>({
  events: [],  
  registerHandler: () => {},  
  registerButtonHandler: () => {}  
});

export const ControllerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<string[]>([]);
  const joystickHandlers = useRef<{ [key: string]: () => void }>({});
  const buttonHandlers = useRef<{ [key: string]: () => void }>({});
  const currentDirection = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeHeld = useRef(0);
  const hasStarted = useRef(false);

  // Prompts monitoring for controller
  useEffect(() => {
    if (!hasStarted.current) {
      socket.emit('START');
      hasStarted.current = true;
    }

    /* Listen to socket events. Handle incoming controller messages. 
    First key in data is either "direction" (joystick) or "button":
    {"direction": "left"} 
    {"direction": "release"}
    {"button": "X", "action": "pressed"} */
    socket.on("joystick_event", (data) => {
      const { button, action, direction } = data;
      let eventMessage = "";
      console.log("got message")

      // First grabs button/action if button pressed
      // and direction if joystick interacted
      if (button) {
        console.log(button, action)
        console.log("Registered Button Handler: ", buttonHandlers.current)
        eventMessage = `${button} Button ${action}`;
        buttonHandlers.current[button]?.();
      } else if (direction) {
        eventMessage = `Joystick ${direction}`;
        console.log(direction)
        // Reset direction when joystick released
        if (direction === "release") {
          currentDirection.current = null;
          timeHeld.current = 0;

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        else if (joystickHandlers.current[direction] && currentDirection.current !== direction) {
          // New direction, reset and start fresh
          currentDirection.current = direction;
          timeHeld.current = 0;
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
          }
          joystickHandlers.current[direction]()?.();

          // Start repeating the action, initially slower
          intervalRef.current = setInterval(() => {
            joystickHandlers.current[direction]?.();
            timeHeld.current += 1; // Increase time held each interval
            adjustIntervalSpeed();
          }, 600);
        }


      }

      // If joystick interaction, keep repeating UNTIL released

      if (eventMessage) {
        setEvents((prevEvents) => [eventMessage, ...prevEvents]);
      }
    });

    socket.on("error", (data) => {
      setEvents((prevEvents) => [`Error: ${data.message}`, ...prevEvents]);
    });

    return () => {
      socket.off("joystick_event");
      socket.off("error");
    };
  }, []);

  // Register handler for joystick actions
  const registerHandler = (direction: string, handler: () => void) => {
    joystickHandlers.current[direction] = handler;
  };
  const registerButtonHandler = (button: string, handler: () => void) => {
    buttonHandlers.current[button] = handler;
  };

  // Adjusts the speed based on how long the joystick has been held
  const adjustIntervalSpeed = () => {
    if (!intervalRef.current) return;

    let newInterval = 200 - timeHeld.current * 10; // Gradually decrease the interval
    if (newInterval < 100) newInterval = 100; // Minimum speed (no faster than every 50ms)

    // Only update the interval if the time has increased enough
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      joystickHandlers.current[currentDirection.current!]?.();
    }, newInterval);
  };

  return (
    <ControllerContext.Provider value={{ events, registerHandler, registerButtonHandler }}>
      {children}
    </ControllerContext.Provider>
  );
};



export const useController = () => {
  return useContext(ControllerContext);
};
