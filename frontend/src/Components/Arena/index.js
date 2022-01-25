import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformBossData } from '../../constants';
import BlockchainBrawlers from '../../utility/BlockchainBrawlers.json';
import './Arena.css';

const Arena = ({ characterNFT }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');

  console.log("characterNFT", characterNFT);

  const attackBoss = () => {
    console.log('characterNFT special move:', characterNFT.specialMove);
    try {
      if (gameContract) {
        setAttackState('attacking');  
        console.log('characterNFT special move:', characterNFT.specialMove);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

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

  const randomBossIndex =  Math.floor(Math.random() * (1 + 1));

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBoss(randomBossIndex);
      console.log('Boss:', bossTxn);
      setBoss(transformBossData(bossTxn));
    };
    if (gameContract) {
      fetchBoss();
    }
  }, [gameContract]);

  return (
    <div className="arena-container">
     {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <h2>🔥 {boss.name} 🔥</h2>
          <div className="image-content">
            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.critChance} max={boss.totalHP} />
              <p>{`${boss.critChance} / ${boss.totalHP} HP`}</p>
            </div>
          </div>
        </div>
      </div>
    )}

{boss && <div className="attack-container">
          <button className="cta-button" onClick={() => attackBoss()}>
            {`💥 Attack ${boss.name}`}
          </button>
        </div>}

{characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.critChance} max={characterNFT.totalHP} />
                <p>{`${characterNFT.critChance} / ${characterNFT.totalHP} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.damage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}



    </div>
  );
};

export default Arena;