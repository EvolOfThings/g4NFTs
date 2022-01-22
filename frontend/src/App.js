import React from 'react';
import './App.css';

// Constants
const GITHUB_LINK = "https://github.com/EvolOfThings/g4NFTs";

const App = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Slay it!</p>
          <p className="sub-text">Slay da BOSS!</p>
          <div className="connect-wallet-container">
            <img
              src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
              alt="Monty Python Gif"
            />
          </div>
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >Encode BitDAO group project</a>
        </div>
      </div>
    </div>
  );
};

export default App;
