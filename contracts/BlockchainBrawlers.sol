//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Contract imports
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//Helper function imports
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BlockchainBrawlers is ERC721("Blockchain Brawlers", "Brawl") {
    //Defining the special moves the characters can perform outside of basic attack
    enum SpecialMoveTypes {Heal, IncreaseDamage, IncreaseDefence, IncreaseCritChance}

    //Defining the attributes of the playable characters
    struct BrawlerAttributes {
        uint256 brawlerType;
        string name;
        string imageURI;
        uint256 totalHP;
        uint256 damage;
        uint256 defence;
        uint256 critChance;
        SpecialMoveTypes specialMove; 
    }

    //Defining the attributes of the bosses the characters will fight
    //This needs to be its own struct as the different types of bosses will be stored using an array 
    //and bossType maps these attributes to the corresponding boss
    struct BossAttributes {
        uint256 bossType;
        string name;
        string imageURI;
        uint256 totalHP;
        uint256 damage;
        uint256 defence;
        uint256 critChance;
        SpecialMoveTypes specialMove;
    }

    //Defining the mechanism for keeping track of the next id for the nft mints
    using Counters for Counters.Counter; //setting up library
    Counters.Counter internal _tokenId; //creating global variable

    BrawlerAttributes[] brawlerTypes;
    BossAttributes[] public bossTypes;

    mapping(uint256 => BrawlerAttributes) public tokenIdToAttributes;
    mapping(address => uint256) public ownerToTokenId;

    //Special moves are currently hardcoded but should be made dynamically randomised and chosen at mint
    constructor(
        string[] memory _brawlerName,
        string[] memory _brawlerImageURI,
        uint256[] memory _brawlerTotalHP,
        uint256[] memory _brawlerDamage,
        uint256[] memory _brawlerDefence,
        uint256[] memory _brawlerCritChance,
        SpecialMoveTypes[] memory _brawlerSpecialMove,
        string[] memory _bossName,
        string[] memory _bossImageURI,
        uint256[] memory _bossTotalHP,
        uint256[] memory _bossDamage,
        uint256[] memory _bossDefence,
        uint256[] memory _bossCritChance,
        SpecialMoveTypes[] memory _bossSpecialMove
    ) {
        //Use arguments to instantiate the different brawler types
        for(uint256 i = 0; i < _brawlerName.length; i++){
            brawlerTypes.push(
                BrawlerAttributes({
                    brawlerType: i,
                    name: _brawlerName[i],
                    imageURI: _brawlerImageURI[i],
                    totalHP: _brawlerTotalHP[i],
                    damage: _brawlerDamage[i],
                    defence: _brawlerDefence[i],
                    critChance: _brawlerCritChance[i],
                    specialMove: _brawlerSpecialMove[i]
                })
            );

            BrawlerAttributes memory brawler = brawlerTypes[i];
            console.log(
                "Created brawler %s", 
                brawler.name
            );
        }


        //Use arguments to instantiate the different boss types
        for(uint256 i = 0; i < _bossName.length; i++){
            bossTypes.push(
                BossAttributes({
                    bossType: i,
                    name: _bossName[i],
                    imageURI: _bossImageURI[i],
                    totalHP: _bossTotalHP[i],
                    damage: _bossDamage[i],
                    defence: _bossDefence[i],
                    critChance: _bossCritChance[i],
                    specialMove: _bossSpecialMove[i]
                })
            );

            BossAttributes memory boss = bossTypes[i];
            console.log(
                "Created boss %s",
                boss.name
            );
        }

        //Need to do this in deployment to avoid a token being minted with id 0
        _tokenId.increment();
    }

    
}
