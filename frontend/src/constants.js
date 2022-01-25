const CONTRACT_ADDRESS = '0xD41bC80F575705FF68992060E2A3FfB9a21616aA';

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