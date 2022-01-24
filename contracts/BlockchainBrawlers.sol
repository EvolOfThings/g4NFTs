//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Contract imports
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//Library Imports
import "./Libraries/Base64.sol";

//Helper function imports
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockchainBrawlers is ERC721("Blockchain Brawlers", "Brawl"), Ownable {
    //Defining the special moves the characters can perform outside of basic attack
    enum SpecialMoveTypes {Heal, IncreaseDamage, IncreaseDefence, IncreaseCritChance}

    //Defining the attributes of the playable characters
    struct BrawlerAttrs {
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
    struct BossAttrs {
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
    Counters.Counter internal _tokenID; //creating global variable

    BrawlerAttrs[] brawlerTypes;
    BossAttrs[] public bossTypes;

    mapping(uint256 => BrawlerAttrs) public nftHolderAttrs;
    mapping(address => uint256) public nftHolders;

    //BossAttrs public bigBoss;

    event BrawlerMinted(address sender, uint256 newBrawlerId, uint256 brawlerType);

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 brawlerType
    );

    event AttackComplete(uint256 newBossHp, uint256 newPlayerHp);

    //Special moves are currently hardcoded but should be made dynamically randomised and chosen at mint
    constructor(
        string[] memory _brawlerName,
        string[] memory _brawlerImageURI,
        uint256[] memory _brawlerTotalHP,
        uint256[] memory _brawlerDamage,
        uint256[] memory _brawlerDefence,
        uint256[] memory _brawlerCritChance,
        SpecialMoveTypes[] memory _brawlerSpecialMove
    ) {
        //counter variable
        uint256 i;
        for(i = 0; i < _brawlerName.length; i++){
            brawlerTypes.push(
                BrawlerAttrs({
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

            BrawlerAttrs memory brawler = brawlerTypes[i];
            console.log(
                "Created brawler %s", 
                brawler.name
            );
        }
        _tokenID.increment();
    }

    function  mintBrawler(uint256 _brawlerType) external {
        uint256 newBrawlerId = _tokenID.current();

        _safeMint(msg.sender, newBrawlerId);

        BrawlerAttrs memory brawlerArchitype = brawlerTypes[_brawlerType];

        nftHolderAttrs[newBrawlerId] = BrawlerAttrs({
            brawlerType: _brawlerType,
            name: brawlerArchitype.name,
            imageURI: brawlerArchitype.imageURI,
            totalHP: brawlerArchitype.totalHP,
            damage: brawlerArchitype.damage,
            defence: brawlerArchitype.defence,
            critChance: brawlerArchitype.critChance,
            specialMove: brawlerArchitype.specialMove
        });

        nftHolders[msg.sender] = newBrawlerId;

        console.log("Minted brawler number:%s, which is of type %s", newBrawlerId, _brawlerType);

        _tokenID.increment();

        emit BrawlerMinted(msg.sender, newBrawlerId, _brawlerType);
    }

    function addBoss(
        string memory _bossName,
        string memory _bossImageURI,
        uint256 _bossTotalHP,
        uint256 _bossDamage,
        uint256 _bossDefence,
        uint256 _bossCritChance,
        SpecialMoveTypes _bossSpecialMove
    ) external onlyOwner {
        //Use arguments to instantiate the different boss types
        uint256 bossType = bossTypes.length;

        bossTypes.push(
            BossAttrs({
                bossType: bossType,
                name: _bossName,
                imageURI: _bossImageURI,
                totalHP: _bossTotalHP,
                damage: _bossDamage,
                defence: _bossDefence,
                critChance: _bossCritChance,
                specialMove: _bossSpecialMove
            })
        );

        BossAttrs memory boss = bossTypes[bossType];
        console.log("Created boss %s", boss.name);
    }

    function tokenURI(uint256 _tokenId) public view override returns(string memory) {
        BrawlerAttrs memory NFTAttrs = nftHolderAttrs[_tokenId];

        //convert all ints to strings
        string memory strTokenId = Strings.toString(_tokenId);
        string memory strTotalHP = Strings.toString(NFTAttrs.totalHP);
        string memory strDamage = Strings.toString(NFTAttrs.damage);
        string memory strDefence = Strings.toString(NFTAttrs.defence);
        string memory strCritChance = Strings.toString(NFTAttrs.critChance);
        string memory strSpecialMove = specialMoveToString(NFTAttrs.specialMove);

        string memory NFTjson = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                NFTAttrs.name,
                '  #', strTokenId,
                '", "description": "The first generation of blockchain brawlers", "image": "',
                NFTAttrs.imageURI,
                '", "attributes": [ { "trait_type": "Total_HP", "value": ',strTotalHP,'}, { "trait_type": "Damage", "value": ',
                strDamage,'}, {"trait_type": "Defence", "value": ',
                strDefence, '},  {"trait_type": "Critical Hit Chance", "value": ', strCritChance,
                '},  {"trait_type": "Special Move", "value": "', strSpecialMove, '"} ]}'
            )
        );

        string memory output = string(abi.encodePacked("data:application/json;base64,", NFTjson));

        return output;
    }

    function checkOwnsBrawler() public view returns(BrawlerAttrs memory){
        uint256 playerBrawlerId = nftHolders[msg.sender];

        if(playerBrawlerId > 0){
            return nftHolderAttrs[playerBrawlerId];
        }else{
            BrawlerAttrs memory emptyBrawler;
            return emptyBrawler;
        }
    }

    function getBrawlerTypes() public view returns(BrawlerAttrs[] memory){
        return brawlerTypes;
    }

    function getBoss(uint256 _bossType) public view returns(BossAttrs memory){
        return bossTypes[_bossType];
    }

    // //TO-DO: should be able to choose
    // function initBigBoss() public {
    //     bigBoss = bossTypes[0];
    //     console.log("Initializing boss %s w/ HP %s, img %s", 
    //     bigBoss.name, 
    //     bigBoss.totalHP, 
    //     bigBoss.imageURI);
    // }

    function specialMoveToString(SpecialMoveTypes _specialMove) internal pure returns(string memory) {
        if(_specialMove == SpecialMoveTypes.Heal){
            return "Heal";
        }else if(_specialMove == SpecialMoveTypes.IncreaseDamage){
            return "Increase Damage";
        }else if(_specialMove == SpecialMoveTypes.IncreaseDefence){
            return "Increase Defence";
        }else {
            return "Increase Crit Chance";
        }
    }

    // function mintCharacterNFT(uint256 _brawlerType) external {
    //     uint256 newItemId = _tokenID.current();
    //     _safeMint(msg.sender, newItemId);

    //     nftHolderAttrs[newItemId] = BrawlerAttrs({
    //         brawlerType: brawlerTypes[_brawlerType].brawlerType,
    //         name: brawlerTypes[_brawlerType].name,
    //         imageURI: brawlerTypes[_brawlerType].imageURI,
    //         totalHP: brawlerTypes[_brawlerType].totalHP,
    //         damage: brawlerTypes[_brawlerType].damage,
    //         defence: brawlerTypes[_brawlerType].defence,
    //         critChance: brawlerTypes[_brawlerType].critChance,
    //         specialMove: brawlerTypes[_brawlerType].specialMove
    //     });

    //     console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _brawlerType);

    //     nftHolders[msg.sender] = newItemId;

    //     _tokenID.increment();
    //     emit CharacterNFTMinted(msg.sender, newItemId, _brawlerType);
    // }

    // function attackBoss() public {
    //     // Get the state of the player's NFT.
    //     uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
    //     BrawlerAttrs storage player = nftHolderAttrs[nftTokenIdOfPlayer];
    //     console.log("Player w/ character %s about to attack. Has %s HP and %s AD", player.name, player.totalHP, player.damage);
    //     console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.totalHP, bigBoss.damage);

    //     require(player.totalHP > 0, "Error: character must have HP to attack boss.");
    //     require(bigBoss.totalHP > 0, "Error: boss must have HP to attack boss.");

    //     if (bigBoss.totalHP < player.damage) {
    //         bigBoss.totalHP = 0;
    //     } else {
    //         bigBoss.totalHP = bigBoss.totalHP - player.damage;
    //     }

    //     if (player.totalHP < bigBoss.damage) {
    //         player.totalHP = 0;
    //     } else {
    //         player.totalHP = player.totalHP - bigBoss.damage;
    //     }

    //     console.log("Boss attacked player. New player hp: %s\n", player.totalHP);
    //     emit AttackComplete(bigBoss.totalHP, player.totalHP);
    // }
}
