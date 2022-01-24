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
    Counters.Counter internal _tokenID; //creating global variable

    BrawlerAttributes[] brawlerTypes;
    BossAttributes[] public bossTypes;

    mapping(uint256 => BrawlerAttributes) public tokenIdToAttributes;
    mapping(address => uint256) public ownerToTokenId;

    event BrawlerMinted(address sender, uint256 newBrawlerId, uint256 brawlerType);

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

        //Use arguments to instantiate the different brawler types
        for(i = 0; i < _brawlerName.length; i++){
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

        //Need to do this in deployment to avoid a token being minted with id 0
        _tokenID.increment();
    }

    function  mintBrawler(uint256 _brawlerType) external {
        require(_brawlerType < brawlerTypes.length, "Brawler type does not exist");
        uint256 newBrawlerId = _tokenID.current();

        _safeMint(msg.sender, newBrawlerId);

        BrawlerAttributes memory brawlerArchitype = brawlerTypes[_brawlerType];

        tokenIdToAttributes[newBrawlerId] = BrawlerAttributes({
            brawlerType: _brawlerType,
            name: brawlerArchitype.name,
            imageURI: brawlerArchitype.imageURI,
            totalHP: brawlerArchitype.totalHP,
            damage: brawlerArchitype.damage,
            defence: brawlerArchitype.defence,
            critChance: brawlerArchitype.critChance,
            specialMove: brawlerArchitype.specialMove
        });

        ownerToTokenId[msg.sender] = newBrawlerId;

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
            BossAttributes({
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

        BossAttributes memory boss = bossTypes[bossType];
        console.log(
            "Created boss %s",
            boss.name
        );
    }

    function tokenURI(uint256 _tokenId) public view override returns(string memory) {
        BrawlerAttributes memory NFTAttributes = tokenIdToAttributes[_tokenId];

        //convert all ints to strings
        string memory strTokenId = Strings.toString(_tokenId);
        string memory strTotalHP = Strings.toString(NFTAttributes.totalHP);
        string memory strDamage = Strings.toString(NFTAttributes.damage);
        string memory strDefence = Strings.toString(NFTAttributes.defence);
        string memory strCritChance = Strings.toString(NFTAttributes.critChance);
        string memory strSpecialMove = specialMoveToString(NFTAttributes.specialMove);

        string memory NFTjson = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                NFTAttributes.name,
                '  #', strTokenId,
                '", "description": "The first generation of blockchain brawlers", "image": "',
                NFTAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Total_HP", "value": ',strTotalHP,'}, { "trait_type": "Damage", "value": ',
                strDamage,'}, {"trait_type": "Defence", "value": ',
                strDefence, '},  {"trait_type": "Critical Hit Chance", "value": ', strCritChance,
                '},  {"trait_type": "Special Move", "value": "', strSpecialMove, '"} ]}'
            )
        );

        string memory output = string(abi.encodePacked("data:application/json;base64,", NFTjson));

        return output;
    }

    function checkOwnsBrawler() public view returns(BrawlerAttributes memory){
        uint256 playerBrawlerId = ownerToTokenId[msg.sender];

        if(playerBrawlerId > 0){
            return tokenIdToAttributes[playerBrawlerId];
        }else{
            BrawlerAttributes memory emptyBrawler;
            return emptyBrawler;
        }
    }

    function getBrawlerTypes() public view returns(BrawlerAttributes[] memory){
        return brawlerTypes;
    }

    function getBoss(uint256 _bossType) public view returns(BossAttributes memory){
        return bossTypes[_bossType];
    }

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

    // Was thinking we may need a function that can translate the special move to data that is actionable
    // int the front end. E.g. what effect does the special move have on the stat, how long does it last
    // and how long must the user wait until they can use it again
    // function specialMoveToMoveData(SpecialMoveTypes _specialMove) external pure returns(string memory){
    //     if(_specialMove == SpecialMoveTypes.Heal){
    //         return "{Attribute: totalHP, value_increase: 50%, wait: 1, cooldown: 3}";
    //     }else if(_specialMove == SpecialMoveTypes.IncreaseDamage){
    //         return "{Attribute: damage, value_increase: 25%, wait: 2, cooldown: 2}";
    //     }else if(_specialMove == SpecialMoveTypes.IncreaseDefence){
    //         return "{Attribute: defence, value_increase: 25%, wait: 2, cooldown: 2}";
    //     }else {
    //         return "{Attribute: critChance, value_increase: 100%, wait: 2, cooldown: 2}";
    //     }
    // }
}
