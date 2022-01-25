import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformBossData } from '../../constants';
import BlockchainBrawlers from '../../utility/BlockchainBrawlers.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';

const Arena = ({ characterNFT, characterSpecialMove }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);

  const [playerCritChanceHP, setPlayerCritChanceHP] = useState(characterNFT.totalHP);

  const [bossTotalHP, setBossTotalHP] = useState();
  const [bossCritChanceHP, setBossCritChanceHP] = useState();
  const [bossDamage, setBossDamage] = useState();
  const [bossSpecialMove, setBossSpecialMove] = useState('');

  const [showToast, setShowToast] = useState(false);

//   const [bossSpecial, setBossSpecial] = useState(false);


  const [attackState, setAttackState] = useState('');


  console.log("characterSpecialMove", characterSpecialMove);

const bossAttacks = async () => {
    setAttackState('');
    try {
        if (gameContract) {
          setPlayerCritChanceHP(playerCritChanceHP - bossDamage);
        }
      } catch (error) {
        console.error('Error attacking boss:', error);
        setAttackState('');
      }
}

// const SpecialAttackByBoss = (specialMove) => {
// switch (specialMove) {
//     case "Heal":
//         setBossCritChanceHP(bossCritChanceHP >= bossTotalHP ? bossTotalHP : bossCritChanceHP + 30);
//         break;
//   case "IncreaseDamage": 
//   setPlayerCritChanceHP(playerCritChanceHP - (bossDamage + 30));
//           break;
//   case "IncreaseDefence":  
//   setBossCritChanceHP(bossCritChanceHP >= bossTotalHP ? bossTotalHP : bossTotalHP + 20);
//       break;
//   case "IncreaseCritChance":  
//   setBossCritChanceHP(bossCritChanceHP >= bossTotalHP ? bossTotalHP : bossTotalHP + 10);
//   break;
//     default:
//         break;
// }
// };


  const attackBoss = async () => {
    // randomBoolean();
    try {
      if (gameContract) {
        setAttackState('attacking');
        setBossCritChanceHP(bossCritChanceHP - characterNFT.damage);
        setTimeout(() => {
            bossAttacks();
          }, 5000);
        // !bossSpecial ? bossAttacks() : SpecialAttackByBoss(bossSpecialMove);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

//   const randomBoolean = () => setBossSpecial(Math.random() > 0.5 ? true : false);

const checkHealth = () => {
    if(playerCritChanceHP <= 0){
        alert("You lost");
        window.location.reload(); 
    } else if (bossCritChanceHP <= 0){
        alert("You beat the boss");
        window.location.reload(); 
    }
}

useEffect(()=> {
    checkHealth();
},[playerCritChanceHP, bossCritChanceHP])
  
  const SpecialAttackBoss = (specialMove) => {
      console.log("specialMove", specialMove);
  switch (specialMove) {
      case "Heal":
        setPlayerCritChanceHP(playerCritChanceHP >= characterNFT.totalHP ? characterNFT.totalHP : playerCritChanceHP + 30);
          break;
    case "Increase Damage": 
    setBossCritChanceHP(bossCritChanceHP - (characterNFT.damage + 30));
    bossAttacks();
            break;
    case "Increase Defence":  
    setPlayerCritChanceHP(playerCritChanceHP >= characterNFT.totalHP ? characterNFT.totalHP : playerCritChanceHP + 20);
        break;
    case "Increase Crit Chance":  
    setPlayerCritChanceHP(playerCritChanceHP >= characterNFT.totalHP ? characterNFT.totalHP : playerCritChanceHP + 10);
    bossAttacks();
    break;
      default:
          break;
  }
  };

  console.log("playerCritChanceHP", playerCritChanceHP);


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
      const tranformedData = transformBossData(bossTxn);
      setBoss(tranformedData);
      setBossTotalHP(tranformedData.totalHP);
      setBossCritChanceHP(tranformedData.totalHP);
      setBossDamage(tranformedData.damage);
      const specialMove = await gameContract.specialMoveToString(tranformedData.specialMove);
      setBossSpecialMove(specialMove);
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
              <progress value={bossCritChanceHP} max={bossTotalHP} />
              <p>{`${bossCritChanceHP} / ${bossTotalHP} HP`}</p>
            </div>
          </div>
          <div className="stats">
              <h4>{`⚔️ Attack Damage: ${bossDamage}`}</h4>
              <h4>{`⚔️ Special Move: ${bossSpecialMove}`}</h4>
            </div>
        </div>
      </div>
    )}

    {/* {bossSpecial && <p>Boss Special Move Activated</p>} */}

    {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}

{characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className={`player ${attackState}`}>
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={playerCritChanceHP} max={characterNFT.totalHP} />
                <p>{`${playerCritChanceHP} / ${characterNFT.totalHP} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.damage}`}</h4>
              <h4>{`⚔️ Special Move: ${characterSpecialMove}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}
    
{boss && <div className="attack-container">
          <button className="cta-button" onClick={() => attackBoss()}>
            {`💥 Attack`}
          </button>
          <button className="cta-button" onClick={() => SpecialAttackBoss(characterSpecialMove)}>
            {`Special Move`}
          </button>
        </div>}

    </div>
  );
};

export default Arena;