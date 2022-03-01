const CONTRACT_ADDRESS = '0x6b9dD081814f2c56DbAb62E141AF38dD75027cf5';

const transformBrawlerData = (BrawlerData) => {
    return {
      name: BrawlerData.name,
      imageURI: BrawlerData.imageURI,
      critChance: BrawlerData.critChance.toNumber(),
      totalHP: BrawlerData.totalHP.toNumber(),
      damage: BrawlerData.damage.toNumber(),
      defence: BrawlerData.defence.toNumber(),
      brawlerType: BrawlerData.brawlerType.toNumber(),
      specialMove: BrawlerData.specialMove,
    };
  };

  const transformBossData = (BossData) => {
    return {
      name: BossData.name,
      imageURI: BossData.imageURI,
      critChance: BossData.critChance.toNumber(),
      totalHP: BossData.totalHP.toNumber(),
      damage: BossData.damage.toNumber(),
      defence: BossData.defence.toNumber(),
      specialMove: BossData.specialMove,
    };
  };

export { CONTRACT_ADDRESS,  transformBrawlerData, transformBossData};