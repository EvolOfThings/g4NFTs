import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformBrawlerData } from '../../constants';
import BlockchainBrawlers from '../../utility/BlockchainBrawlers.json';
import LoadingIndicator from '../LoadingIndicator';

import './SelectBrawler.css';

const SelectBrawler = ({ setBrawlerNFT }) => {
  const [brawlers, setBrawlers] = useState([]);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const [gameContract, setGameContract] = useState(null);
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BlockchainBrawlers.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const getBrawlers = async () => {
      try {
        console.log('Getting contract brawlers to mint');
        const brawlersTxn = await gameContract.getBrawlerTypes();
        console.log('brawlersTxn:', brawlersTxn);
        
        const brawlers = brawlersTxn.map((brawlerData) =>
          transformBrawlerData(brawlerData)
        );
        console.log('brawlers:', brawlers);
        setBrawlers(brawlers);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    const onBrawlerMint = async (sender, tokenId, characterIndex) => {
      if (gameContract) {
        const characterNFT = await gameContract.checkOwnsBrawler();
        console.log('CharacterNFT: ', characterNFT);
        setBrawlerNFT(transformBrawlerData(characterNFT));
      }
    };
    if (gameContract) {
      getBrawlers();
      gameContract.on('BrawlerMinted', onBrawlerMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('BrawlerMinted', onBrawlerMint);
      }
    };
  }, [gameContract]);

  const mintBrawlerAction = (brawlerId) => async () => {
    setMintingCharacter(true);
    try {
      if (gameContract) {
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintBrawler(brawlerId);
        await mintTxn.wait();
        setMintingCharacter(false);
      }
    } catch (error) {
      setMintingCharacter(false);
      console.warn('mintBrawlerAction Error:', error);
    }
  };
  
  const renderBrawlers = () =>
  brawlers.map((brawler, index) => (
    <div className="brawler-item" key={brawler.name}>
      <div className="name-container">
        <p>{brawler.name}</p>
      </div>
      <img src={brawler.imageURI} alt={brawler.name} />
      <button
        type="button"
        className="brawler-mint-button"
        onClick={mintBrawlerAction(index)}
      >{`Mint ${brawler.name}`}</button>
    </div>
  ));



  return (
    <div className="select-brawler-container">
      <h2>Mint Your Brawler. Choose unwisely.</h2>
      {brawlers?.length > 0 && (
      <div className="brawler-grid">{renderBrawlers()}</div>
    )}
     {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
      </div>
    )}
    </div>
  );
};

export default SelectBrawler;