import { motion } from "framer-motion";


//import pixelPanel from "/images/pixelPanel.png";
import StringDecorBackup from "../../assets/stringDecorBackup.js";

import './Banners.css'

const BotBanner = () => {
  return (
    <motion.div
      initial={{ translateY: "20%" }}
      animate={{ translateY: 0 }}
      transition={{
        duration: 0.5,
        ease: "backOut",
      }}
      style={{position: "absolute", width:"100%", height:"100%"}}
    >
      {/*<img src={pixelPanel} alt="pixel panel" className="pixelPanelBot" />*/}
      {/* <TextAlongPathBot className="stringDecorBot" /> */}
      <StringDecorBackup className="stringDecorBackupBot" />
      <p className="RCOS">RCOS Project</p>
    </motion.div>
  );
};

export default BotBanner;
