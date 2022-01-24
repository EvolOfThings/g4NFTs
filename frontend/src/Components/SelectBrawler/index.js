import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformBrawlerData } from '../../constants';
import BlockchainBrawlers from '../../utility/BlockchainBrawlers.json';

import './SelectBrawler.css';

const SelectBrawler = ({ setCharacterNFT }) => {
  const [brawlers, setBrawlers] = useState([]);

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
    if (gameContract) {
      getBrawlers();
    }
  }, [gameContract]);

  // Render Methods
const renderBrawlers = () =>
brawlers.map((brawler, index) => (
  <div className="brawler-item" key={brawler.name}>
    <div className="name-container">
      <p>{brawler.name}</p>
    </div>
    <img src={brawler.imageURI} alt={brawler.name} />
    {/* <button
      type="button"
      className="brawler-mint-button"
       onClick={mintCharacterNFTAction(index)}
    >{`Mint ${brawler.name}`}</button> */}
  </div>
));

  return (
    <div className="select-brawler-container">
      <h2>Mint Your Brawler. Choose unwisely.</h2>
      {brawlers?.length > 0 && (
      <div className="brawlers-grid">{renderBrawlers()}</div>
    )}
    </div>
  );
};

export default SelectBrawler;