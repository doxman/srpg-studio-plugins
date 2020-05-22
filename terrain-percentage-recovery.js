RecoveryAllFlowEntry._getRecoveryValue = function(unit) {
    var skill, terrain;
    var recoveryValue = 0;

    skill = SkillControl.getBestPossessionSkill(unit, SkillType.AUTORECOVERY);
    if (skill !== null) {
        recoveryValue += skill.getSkillValue();
    }

    terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());
    if (terrain !== null) {
        // This part is altered to treat AutoRecoveryValue as a percent instead of a hard value
        var terrainAutoRecoveryValue = terrain.getAutoRecoveryValue() * 0.01;
        var unitMaxHP = RealBonus.getMhp(unit);
        recoveryValue += Math.ceil(unitMaxHP * terrainAutoRecoveryValue);
    }

    recoveryValue += StateControl.getHpValue(unit);

    return recoveryValue;
};
