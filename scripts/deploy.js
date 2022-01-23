const hre = require("hardhat");

async function main() {
  //Brawler character setup
  const brawlerNames = ["Bot", "Special Agent"];
  const brawlerImgs = [
    "https://i.pinimg.com/236x/5a/e2/ef/5ae2efa7167ea56a14ba2c8b5db3e77d.jpg",
    "https://i.pinimg.com/564x/ba/5d/4d/ba5d4d0a4147a0b1a90437daf7681ec0.jpg"
  ];
  const brawlerTotalHPs = [100, 150];
  const brawlerDmgs = [50, 40];
  const brawlerDefences = [5, 10];
  const brawlerCritChance = [10, 5];
  const brawlerSpecialMoves = [1, 0];

  //Boss' character setup
  const bossNames = ["Forge Master", "Ice Ravager"];
  const bossImgs = [
    'https://i.pinimg.com/564x/48/f9/02/48f90200b97bcd9fcb3610d2cea7b7c0.jpg', 
    'https://i.pinimg.com/564x/53/11/fd/5311fdfcd3c5549632b474a53c2585f3.jpg'
  ];
  const bossTotalHPs = [300, 250];
  const bossDmgs = [20, 25];
  const bossDefence = [5, 0];
  const bossCritChance = [2, 5];
  const bossSpecialMoves = [2, 3];

  //Contract setup
  const brawlerFactory = await hre.ethers.getContractFactory("BlockchainBrawlers");
  const brawlerContract = await brawlerFactory.deploy(
    brawlerNames,
    brawlerImgs,
    brawlerTotalHPs,
    brawlerDmgs,
    brawlerDefences,
    brawlerCritChance,
    brawlerSpecialMoves
  );

  //Contract Deployment
  await brawlerContract.deployed();
  console.log("Blockchain Brawler contract deployed to:", brawlerContract.address);

  //Create the bosses
  let bossTx;
  for(i = 0; i < bossNames.length; i++){
    bossTx = await brawlerContract.addBoss(
      bossNames[i],
      bossImgs[i],
      bossTotalHPs[i],
      bossDmgs[i],
      bossDefence[i],
      bossCritChance[i],
      bossSpecialMoves[i]
    )
    await bossTx.wait();
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
