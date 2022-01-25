const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { solidity } = require("ethereum-waffle");
use(solidity);

//https://www.chaijs.com/guide/styles/

//https://docs.openzeppelin.com/test-helpers/0.5/

describe("BlockchainBrawlers", () => {
  let brawlerContract;
  let owner, addr1, addr2;

  beforeEach(async () => {
    const brawlerImgs = [
      "https://i.pinimg.com/236x/5a/e2/ef/5ae2efa7167ea56a14ba2c8b5db3e77d.jpg",
      "https://i.pinimg.com/564x/ba/5d/4d/ba5d4d0a4147a0b1a90437daf7681ec0.jpg"
    ];
    const brawlerNames = ["Bot", "Special Agent"];
    const brawlerTotalHPs = [100, 150];
    const brawlerDmgs = [50, 40];
    const brawlerDefences = [5, 10];
    const brawlerCritChance = [10, 5];
    const brawlerSpecialMoves = [1, 0];

    const brawlerFactory = await ethers.getContractFactory("BlockchainBrawlers");
    brawlerContract = await brawlerFactory.deploy(
      brawlerNames,
      brawlerImgs,
      brawlerTotalHPs,
      brawlerDmgs,
      brawlerDefences,
      brawlerCritChance,
      brawlerSpecialMoves
    );
    await brawlerContract.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("Returns the types of brawlers a player can mint", async function () {
    const expectedNames = ["Bot", "Special Agent"];
    const expectedTotalHPs = [100, 150];
    const expectedDmgs = [50, 40];
    const expectedDefences = [5, 10];
    const expectedCritChance = [10, 5];
    const expectedSpecialMoves = [1, 0];

    let typeTx = await brawlerContract.getBrawlerTypes();
    //console.log(typeTx);

    for(i = 0; i < typeTx.length; i++){
      expect(expectedNames[i]).to.equal(typeTx[i].name);
      expect(expectedTotalHPs[i]).to.equal(typeTx[i].totalHP);
      expect(expectedDmgs[i]).to.equal(typeTx[i].damage);
      expect(expectedDefences[i]).to.equal(typeTx[i].defence);
      expect(expectedCritChance[i]).to.equal(typeTx[i].critChance);
      expect(expectedSpecialMoves[i]).to.equal(typeTx[i].specialMove);
    }
  });

  it("Emits an event upon an NFT being minted", async () => {
    const brawlerType = 0;
    let mintTx = await brawlerContract.mintBrawler(brawlerType);
    await mintTx.wait();

    expect(mintTx).to.emit(brawlerContract, "BrawlerMinted");
  })

  it("Reverts when a brawler type out of range is entered", async () => {
    const brawlerType = 2;
    await expect(
      brawlerContract.mintBrawler(brawlerType)
    ).to.be.revertedWith("Brawler type does not exist");
  });

  it("Adds bosses correctly", async () => {
    const bossNames = ["Forge Master", "Ice Ravager"];
    const bossImgs = ['https://i.pinimg.com/564x/48/f9/02/48f90200b97bcd9fcb3610d2cea7b7c0.jpg', 'https://i.pinimg.com/564x/53/11/fd/5311fdfcd3c5549632b474a53c2585f3.jpg'];
    const bossTotalHPs = [300, 250];
    const bossDmgs = [20, 25];
    const bossDefence = [5, 0];
    const bossCritChance = [2, 5];
    const bossSpecialMoves = [2, 3];
    const outOfRangeBossType = 2;
    
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
      bossTx = await brawlerContract.getBoss(i);

      expect(bossTx.name).to.equal(bossNames[i]);
      expect(bossTx.imageURI).to.equal(bossImgs[i]);
      expect(bossTx.totalHP).to.equal(bossTotalHPs[i]);
      expect(bossTx.damage).to.equal(bossDmgs[i]);
      expect(bossTx.defence).to.equal(bossDefence[i]);
      expect(bossTx.critChance).to.equal(bossCritChance[i]);
      expect(bossTx.specialMove).to.equal(bossSpecialMoves[i]);
    }

    await expect(
      brawlerContract.getBoss(outOfRangeBossType)
    ).to.be.revertedWith("Boss type does not exist");
  });

  it("Reverts when a non-owner attempts to add a boss", async () => {
    const bossName = "Ice Ravager";
    const bossImg = 'https://i.pinimg.com/564x/53/11/fd/5311fdfcd3c5549632b474a53c2585f3.jpg';
    const bossTotalHP = 250;
    const bossDmg = 25;
    const bossDefence = 0;
    const bossCritChance = 5;
    const bossSpecialMove = 3;
    
    await expect(
      brawlerContract
      .connect(addr1)
      .addBoss(
        bossName,
        bossImg,
        bossTotalHP,
        bossDmg,
        bossDefence,
        bossCritChance,
        bossSpecialMove
      )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Correctly detects the presence of a brawler NFT", async () => {
    const expectedName = "Bot";
    const expectedTotalHP = 100;
    const expectedDmg = 50;
    const expectedDefence = 5;
    const expectedCritChance = 10;
    const expectedSpecialMove = 1;
    const expectedImg = "https://i.pinimg.com/236x/5a/e2/ef/5ae2efa7167ea56a14ba2c8b5db3e77d.jpg";
    
    let mintTx = await brawlerContract.mintBrawler(0);
    mintTx.wait();

    let brawlerTx = await brawlerContract.checkOwnsBrawler();

    expect(brawlerTx.name).to.equal(expectedName);
    expect(brawlerTx.totalHP).to.equal(expectedTotalHP);
    expect(brawlerTx.damage).to.equal(expectedDmg);
    expect(brawlerTx.defence).to.equal(expectedDefence);
    expect(brawlerTx.critChance).to.equal(expectedCritChance);
    expect(brawlerTx.specialMove).to.equal(expectedSpecialMove);
    expect(brawlerTx.imageURI).to.equal(expectedImg);
  });

  it("Correctly detects the absence of a brawler NFT", async () => {
    const expectedName = "";
    const expectedTotalHP = 0;
    const expectedDmg = 0;
    const expectedDefence = 0;
    const expectedCritChance = 0;
    const expectedSpecialMove = 0;
    const expectedImg = "";

    let brawlerTx = await brawlerContract.connect(addr1).checkOwnsBrawler();

    expect(brawlerTx.name).to.equal(expectedName);
    expect(brawlerTx.totalHP).to.equal(expectedTotalHP);
    expect(brawlerTx.damage).to.equal(expectedDmg);
    expect(brawlerTx.defence).to.equal(expectedDefence);
    expect(brawlerTx.critChance).to.equal(expectedCritChance);
    expect(brawlerTx.specialMove).to.equal(expectedSpecialMove);
    expect(brawlerTx.imageURI).to.equal(expectedImg);
  });

  it("Correctly returns the right metadata for the tokenURI", async () => {
    const tokenIdTypeOne = 1;
    const tokenIdTypeTwo = 2;
    const expectedTypeOneURI = "data:application/json;base64,eyJuYW1lIjogIkJvdCAgIzEiLCAiZGVzY3JpcHRpb24iOiAiVGhlIGZpcnN0IGdlbmVyYXRpb24gb2YgYmxvY2tjaGFpbiBicmF3bGVycyIsICJpbWFnZSI6ICJodHRwczovL2kucGluaW1nLmNvbS8yMzZ4LzVhL2UyL2VmLzVhZTJlZmE3MTY3ZWE1NmExNGJhMmM4YjVkYjNlNzdkLmpwZyIsICJhdHRyaWJ1dGVzIjogWyB7ICJ0cmFpdF90eXBlIjogIlRvdGFsX0hQIiwgInZhbHVlIjogMTAwfSwgeyAidHJhaXRfdHlwZSI6ICJEYW1hZ2UiLCAidmFsdWUiOiA1MH0sIHsidHJhaXRfdHlwZSI6ICJEZWZlbmNlIiwgInZhbHVlIjogNX0sICB7InRyYWl0X3R5cGUiOiAiQ3JpdGljYWwgSGl0IENoYW5jZSIsICJ2YWx1ZSI6IDEwfSwgIHsidHJhaXRfdHlwZSI6ICJTcGVjaWFsIE1vdmUiLCAidmFsdWUiOiAiSW5jcmVhc2UgRGFtYWdlIn0gXX0=";
    const expectedTypeTwoURI = "data:application/json;base64,eyJuYW1lIjogIlNwZWNpYWwgQWdlbnQgICMyIiwgImRlc2NyaXB0aW9uIjogIlRoZSBmaXJzdCBnZW5lcmF0aW9uIG9mIGJsb2NrY2hhaW4gYnJhd2xlcnMiLCAiaW1hZ2UiOiAiaHR0cHM6Ly9pLnBpbmltZy5jb20vNTY0eC9iYS81ZC80ZC9iYTVkNGQwYTQxNDdhMGIxYTkwNDM3ZGFmNzY4MWVjMC5qcGciLCAiYXR0cmlidXRlcyI6IFsgeyAidHJhaXRfdHlwZSI6ICJUb3RhbF9IUCIsICJ2YWx1ZSI6IDE1MH0sIHsgInRyYWl0X3R5cGUiOiAiRGFtYWdlIiwgInZhbHVlIjogNDB9LCB7InRyYWl0X3R5cGUiOiAiRGVmZW5jZSIsICJ2YWx1ZSI6IDEwfSwgIHsidHJhaXRfdHlwZSI6ICJDcml0aWNhbCBIaXQgQ2hhbmNlIiwgInZhbHVlIjogNX0sICB7InRyYWl0X3R5cGUiOiAiU3BlY2lhbCBNb3ZlIiwgInZhbHVlIjogIkhlYWwifSBdfQ==";

    let mintTx = await brawlerContract.mintBrawler(0);
    mintTx.wait();

    mintTx = await brawlerContract.mintBrawler(1);
    mintTx.wait();

    let URITx = await brawlerContract.tokenURI(tokenIdTypeOne);
    expect(URITx).to.equal(expectedTypeOneURI);

    URITx = await brawlerContract.tokenURI(tokenIdTypeTwo);
    expect(URITx).to.equal(expectedTypeTwoURI);
  });
});
