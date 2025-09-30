import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./Flashdrive.css";
import LeftBanner from '../Banners/LeftBanner'
import Step1Instruction from './Step1Instruction';

import { useController } from "../ControllerContext";

/* Establishes two way communication with backend USB_monitor script to allow anyone to insert
    a USB with the right format and upload game files to the EmulationStation. The script starts 
    listening for USB insertions once the user presses continue to step 2. Once USB processes and
    at step 3, User can remove flashdrive. 
*/
const Flashdrive: React.FC = () => {
  // Establish socket with usb_monitor server ======================================
  const socketRef = useRef<Socket | null>(null); // Ref so that socket doesn't trigger re-renders

  const [successGames, setSuccessGames] = useState<string[]>([]);
  const [duplicateGames, setDuplicateGames] = useState<string[]>([]);
  const [failedGames, setFailedGames] = useState<string[]>([]);

  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // make sure game summary arrays are reset
    setSuccessGames([]);
    setDuplicateGames([]);
    setFailedGames([]);

    // Establish socket connection only when the page is mounted
    socketRef.current = io("http://127.0.0.1:5001", {
      reconnection: false, // Disable automatic reconnections
      timeout: 5000,
    });

    console.log("Connected to flashdrive socket");

    // Prompts monitoring for flashdrives
    if (!hasStarted) {
      socketRef.current.emit('START');
      setHasStarted(true);
    }

    /* Continuously listens for messages from backend. Does multiple tasks including
      updating steps, sorts games into summary, and processes errors.
      Process log messages */
    const handleStatus = (data: { message: string }) => {
      setLogMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data.message];
        console.log(data.message)

        // Updates step based on key phrases.
        if (updatedMessages.some(msg => msg.includes("USB device"))) {
          markStepComplete(1);
          setActiveStep(2);
        }

        if (updatedMessages.some(msg => msg.includes("Please remove"))) {
          markStepComplete(2);
          setActiveStep(3);
        }

        if (updatedMessages.some(msg => msg.includes("USB successfully removed."))) {
          markStepComplete(3);
          setActiveStep(4);
        }

        return updatedMessages;
      });
    };

    // Process summary. Store in lists to be displayed at the last step.
    const handleSummary = (data: { message: string, type: string, games: string[] }) => {
      console.log(data.type);
      console.log(data.games);

      if (data.type === "success") {
        setSuccessGames(data.games);
      } else if (data.type === "duplicate") {
        setDuplicateGames(data.games);
      } else if (data.type === "failed") {
        setFailedGames(data.games);
      }
    };

    /* Process errors. Display popup and return to carousel screen
      The two similar functions handle different situations 
          (ex. handleConnectError if request fails with error msg
            handleConnectFailed if connection fails to be established) */
    const handleConnectError = (error: Error) => {
      console.error("Connection failed:", error);
      toast.error(
        "Error: Games cannot be uploaded at this time. Please contact the RPI ARCADE team.",
        {
          onClose: () => navigate("/emulators"),
        }
      );
    };

    const handleConnectFailed = () => {
      console.error("Connection to server failed");
      toast.error(
        "Error: Games cannot be uploaded at this time. Please contact the RPI ARCADE team.",
        {
          onClose: () => navigate("/emulators"),
        }
      );
    };
    console.log("attach listeners")

    // Attach socket listeners
    socketRef.current.on("status", handleStatus);
    socketRef.current.on("summary", handleSummary);
    socketRef.current.on("connect_error", handleConnectError);
    socketRef.current.on("connect_failed", handleConnectFailed);

    // Cleanup listeners on unmount & disconnect the socket
    return () => {
      if (socketRef.current) {
        socketRef.current.off("status", handleStatus);
        socketRef.current.off("summary", handleSummary);
        socketRef.current.off("connect_error", handleConnectError);
        socketRef.current.off("connect_failed", handleConnectFailed);

        socketRef.current.disconnect();
        console.log("Disconnected from flashdrive socket");
      }
    };
  }, []); // Runs only when the component mounts/unmounts


  // Button actions ======================================
  const navigate = useNavigate();
  const { registerHandler, registerButtonHandler } = useController();


  useEffect(() => {
    registerButtonHandler("x", handleClick);

  }, [registerButtonHandler, registerHandler]);

  const handleClick = () => {
  }

  const handleContinue = () => {
    markStepComplete(1)
    setActiveStep(2)
  }

  const handleCancel = () => {
    if (socketRef.current) {
      socketRef.current.emit('STOP');
      setHasStarted(false);
    }
    navigate('/emulators');
  };

  // Handle displaying steps ======================================
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [activeStep, setActiveStep] = useState(1);

  const markStepComplete = (step: number) => {
    setCompletedSteps((prevCompletedSteps) => {
      const updatedCompletedSteps = [...prevCompletedSteps];
      updatedCompletedSteps[step - 1] = true;
      return updatedCompletedSteps;
    });
  };

  const stepTitle = [
    "Step 1: Read Instructions and Prepare Your Flashdrive",
    "Step 2: Insert Flashdrive",
    "Step 3: Processing complete. Please remove your flashdrive",
    "You may close this page."
  ];

  return (
    <div className="flashdrive">
      <LeftBanner />
      <ToastContainer autoClose={5000} />

      {/* ============================ */}
      <motion.div
        className='buttonsSteps'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >

        {[1, 2, 3].map((stepNum) => (
          <button
            key={stepNum}
            className={`buttonStep ${activeStep === stepNum ? 'activeStep' : ''} ${completedSteps[stepNum - 1] ? 'completedStep' : ''}`}
            onClick={() => setActiveStep(stepNum)} /* FOR TESTING PURPOSES */>
            {stepNum}
          </button>
        ))}
      </motion.div>
      {/* ============================ */}

      <div className="body">
        <div className="cancel">

          <div className="textAndButton">
            <div className='buttonTitle'>
              Return
            </div>
            <button
              className={`standardButton`}
              onClick={handleCancel}>
              B
            </button>
          </div>

          <div className="flashdriveTitle">
            <p style={{ fontSize: "50px" }}> Add Games to EmulationStation </p>
            <p style={{ fontSize: "40px", color: "#e7ef88" }}>{stepTitle[activeStep - 1]}</p>
          </div>

          {/* remove continue button once progressed to next step */}
          {activeStep == 1 ?
            <div className="textAndButton">
              <div className='buttonTitle'>
                Continue
              </div>
              <button
                className={`standardButton`}
                onClick={handleContinue}>
                X
              </button>
            </div> :
            ''
          }



        </div>


        {/* ============================ */}
        <div className="logOutput">
          {
            activeStep === 1 && <Step1Instruction />
          }
          {
            activeStep === 2 && (
              <>
                <h3>Log Messages: </h3>
                <div className='logMsgs' style={{ fontSize: "20px" }}>
                  {logMessages.map((message, index) => (
                    <p key={index}>{`> ${message}`}</p>
                  ))}
                </div>
              </>
            )
          }
          {
            // MOVE TO DIFF FILE
            (activeStep === 3 || activeStep === 4) && (
              <div style={{ display: "flex" }}>
                <div style={{ width: "50%", height: "68vh" }}>
                  <h3>Log Messages: </h3>
                  <div className='logMsgs'>
                    {logMessages.map((message, index) => (
                      <p style={{ lineHeight: "100%" }} key={index}>{`> ${message}`}</p>
                    ))}
                  </div>
                </div>
                <div className='summary'>
                  <h3>Summary: </h3>
                  <div className="summaryCategories">
                    <h4>Games successfully added ({successGames.length}):</h4>
                    <ul className='summaryItem'>
                      {successGames.map((game, index) => (
                        <li key={index}>{game}</li>
                      ))}
                    </ul>
                    <h4>Games already exist ({duplicateGames.length}):</h4>
                    <ul>
                      {duplicateGames.map((game, index) => (
                        <li key={index}>{game}</li>
                      ))}
                    </ul>

                    <h4>Error processing game ({failedGames.length}):</h4>
                    <ul>
                      {failedGames.map((game, index) => (
                        <li key={index}>{game}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          }
        </div>


      </div>
    </div>
  );
};

export default Flashdrive;
