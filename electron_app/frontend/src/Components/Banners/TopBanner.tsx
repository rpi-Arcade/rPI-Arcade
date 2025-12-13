import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

//import pixelPanel from "/images/pixelPanel.png";
import StringDecorBackup from "../../assets/stringDecorBackup.js";
import logo from "/images/Logo.png";

import './Banners.css'

const TopBanner = () => {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <motion.div
      initial={{ translateY: "-30%" }}
      animate={{ translateY: 0 }}
      transition={{
        duration: 0.5,
        ease: "backOut",
      }}
      style={{position: "absolute", width:"100%", height:"100%"}}
    >
      {/*<img src={pixelPanel} alt="pixel panel" className="pixelPanelTop" />*/}
      <StringDecorBackup className="stringDecorBackup" />
      <img src={logo} alt="logo" className="logo" onClick={handleLogoClick}/>
    </motion.div>
  );
};

export default TopBanner;
