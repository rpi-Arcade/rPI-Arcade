import { motion } from "framer-motion";

//import pixelPanel from "/images/pixelPanel.png";
import StringDecorBackup from "../../assets/stringDecorBackup.js";
// import logo from "/images/Logo.png";

import './Banners.css';

const RightBanner = () => {
  return (
    <motion.div
      initial={{ translateX: "70%" }}
      animate={{ translateX: "50%" }}
      transition={{
        duration: 0.5,
        ease: "backOut",
      }}
      style={{
        rotate: "90deg",
        width:"100%", 
        height: "auto",
        translateY: "50vh",
        position: "absolute",
      }}
    >
      {/*<img src={pixelPanel} alt="pixel panel" className="pixelPanelLeft" />*/}
      <StringDecorBackup className="stringDecorBackup" />
    </motion.div>
  );
};

export default RightBanner;
