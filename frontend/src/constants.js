const CONTRACT_ADDRESS = '0x1e9f8f443CBc9395042206AD7c1D758B1D797151';

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