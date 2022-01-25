import React, { useEffect, useState }  from 'react';
import './App.css';
import SelectBrawler from './Components/SelectBrawler';
import Arena from './Components/Arena';
import BlockchainBrawlers from './utility/BlockchainBrawlers.json';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformBrawlerData } from './constants';

// Constants
const GITHUB_LINK = "https://github.com/EvolOfThings/g4NFTs";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const checkWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Make sure you have MetaMask installed!');
        return;
      } else {
        const accounts = await ethereum?.request({ method: 'eth_accounts' });
        if (accounts?.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkNetwork = async () => {
    try { 
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch(error) {
      console.log(error)
    }
  };
  
  useEffect(() => {
    checkWallet();
    checkNetwork();
  }, []);

useEffect(() => {
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      BlockchainBrawlers.abi,
      signer
    );

    const txn = await gameContract.checkOwnsBrawler();
    console.log("txn", txn);
    if (txn.name) {
      console.log('User has character NFT');
      setCharacterNFT(transformBrawlerData(txn));
    } else {
      console.log('No character NFT found');
    }
  };
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);
 

   const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum?.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };


const renderBrawlers = () => {
  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
          alt="Monty Python Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet
        </button>
      </div>
    );
  } else if (currentAccount && !characterNFT) {
    return <SelectBrawler setCharacterNFT={setCharacterNFT} />;
    
  }
  else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} />;
  }
};

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Blockchain Brawlers</p>
          <p className="sub-text">Slay da BOSS!</p>
           {renderBrawlers()}
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
