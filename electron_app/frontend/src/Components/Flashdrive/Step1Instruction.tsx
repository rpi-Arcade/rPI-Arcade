/*
Step1Instruction.tsx formats the details for the Flashdrive page:
basically a description of the file structure required to upload a game, including an example.
*/

import React from 'react';

import './Instruction.css'
import directoryScreenshot from '../../assets/DirectoryScreenshot.png'

const Step1Instruction: React.FC = () => {
  return (
    <div className='instructions'>
      <div className='instructionsLeft'>
        <p className='smallText' style={{ margin: "0 0 3% 0", fontSize: "18px" }}>*We suggest checking if the games you want to install are already available first</p>

        <h3 style={{ fontSize: "30px", margin: 0 }}>File Structure Requirements for ROM Transfers</h3>
        <p className='smallText' style={{ marginBottom: "1%" }}>
          To ensure successful ROM transfers, the USB file structure must follow this specific format.
        </p>
        <ul className='smallText'>
          <li style={{ marginTop: "1%", marginBottom: "1%" }}>
            <b style={{ fontFamily: "Teko", fontSize: "24px" }}>Folders:</b> Games must be put under specific directories named after the emulator for that particular console (e.g., <b>psx</b> for PS1,
            <b> megadrive</b> for Sega Mega Drive/Genesis).
            <br />
            <div style={{ marginLeft: "3%" }}>-Case sensitive.</div>
            <div style={{ marginLeft: "3%" }}>-All supported emulators are shown on the right.</div>
          </li>
          <li style={{ marginTop: "1%" }}>
            <b style={{ fontFamily: "Teko", fontSize: "24px" }}>File Format:</b> Keep games in their original compressed formats (<i>.zip</i>, <i>.7z</i>).
          </li>
        </ul>

        <p style={{fontSize:"16px", marginTop:"5%", fontFamily:"'DM Sans', sans-serif"}}> Here's an example of what your file directory might look like in your flashdrive: </p>
        <img src={directoryScreenshot} alt="directoryScreenshot" className="directoryScreenshot" />
      </div>
      <div className='instructionsRight'>
        <p style={{ margin: "0 0 3% 30%" }}> Format Example: </p>
        <pre className='fileText'>
          <b className='folder' style={{ margin: 0 }}>/RetroPie/</b>
          <br />
          <b className='folder'>|- nes</b>/
          <div className='filename'>|- Super Mario Bros.zip</div>
          <div className='filename'>|- The Legend of Zelda.zip</div>
          <b className='folder'>|- snes</b>/
          <div className='filename'>|- Donkey Kong Country.zip</div>
          <div className='filename'>|- Super Mario World.zip</div>
          <b className='folder'>|- n64</b>/
          <div className='filename'>|- The Legend of Zelda - Ocarina of Time.zip</div>
          <div className='filename'>|- Super Smash Bros.zip</div>
          <b className='folder'>|- dreamcast</b>/
          <div className='filename'>|- Sonic Adventure.zip</div>
          <div className='filename'>|- Crazy Taxi.zip</div>
          <b className='folder'>|- psp</b>/
          <div className='filename'>|- God of War - Chains of Olympus.zip</div>
          <div className='filename'>|- Grand Theft Auto - Vice City Stories.zip</div>
          <b className='folder'>|- psx</b>/
          <div className='filename'>|- Final Fantasy VII.7z</div>
          <div className='filename'>|- Resident Evil 2.7z</div>
          <b className='folder'>|- nds</b>/
          <div className='filename'>|- New Super Mario Bros.zip</div>
          <div className='filename'>|- Pokémon Diamond.zip</div>
          <b className='folder'>|- megadrive</b>/
          <div className='filename'>|- Sonic the Hedgehog.zip</div>
          <div className='filename'>|- Streets of Rage.zip</div>
        </pre>
      </div>

    </div>
  );
};

export default Step1Instruction;
