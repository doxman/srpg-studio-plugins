// Increases a defending unit's defense by 4 for each friendly unit within 2 tiles that also has Phalanx.
// If the unit is attacking, their defense will not be affected.
// To use, create a custom skill with the keyword "Phalanx" and apply it to the unit/class.


// Code inspired by snippets from LadyRena's Health Shield skill:
// https://github.com/LadyRena0713/Scripts/blob/master/Skills/Combat%20Mod/Defense/Skill-Health_Shield.js
// and Goinza's Nerfed Brave Weapons:
// https://github.com/Goinza/Plugins-for-SRPG-Studio/blob/master/Restricted%20Weapon%20Attack%20Count/nerfed-brave.js


// Checks if a unit is the defender (ie. the one that did not initiate the battle)
var isDefender = function(unit) {
    if (root.getCurrentScene() === SceneType.FREE) {
        var turnType = root.getCurrentSession().getTurnType();
        var unitType = unit.getUnitType();
        return (turnType === TurnType.PLAYER && unitType !== UnitType.PLAYER)
            || (turnType === TurnType.ALLY && unitType !== UnitType.ALLY)
            || (turnType === TurnType.ENEMY && unitType !== UnitType.ENEMY);
    }
    return false;
};


// Checks if two units are friendly, ie. either both Enemy or both Player/Ally.
var areUnitsFriendly = function(unit1, unit2) {
    var unit1Type = unit1.getUnitType();
    var unit2Type = unit2.getUnitType();
    return (unit1Type === unit2Type)
        || (unit1Type === UnitType.PLAYER && unit2Type === UnitType.ALLY)
        || (unit1Type === UnitType.ALLY && unit2Type === UnitType.PLAYER);
};


// Counts friends with the Phalanx skill within 2 tiles of a unit.
// Logic for finding friends is similar to SupportCalculator.getTotalStatus()
var countNearbyFriendsWithPhalanx = function(unit) {
    var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, 2);
    var count = 0;
    
    for (var i = 0; i < indexArray.length; i++) {
        var index = indexArray[i];
        var x = CurrentMap.getX(index);
        var y = CurrentMap.getY(index);
        var targetUnit = PosChecker.getUnitFromPos(x, y);
        if (targetUnit !== null) {
            // If there is a unit at this position, check if it is friendly and has Phalanx.
            var isFriendly = areUnitsFriendly(unit, targetUnit);
            var hasPhalanx = SkillControl.getPossessionCustomSkill(targetUnit, "Phalanx");
            if (isFriendly && hasPhalanx) {
                count++;
            }
        }
    }

    return count;
};


// Override skill checker to allow Phalanx
var isCustomSkillInvokedInternal = SkillRandomizer.isCustomSkillInvokedInternal;
SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
    if (keyword === "Phalanx") {
        return this._isSkillInvokedInternal(active, passive, skill);
    }
    return isCustomSkillInvokedInternal.call(this, active, passive, skill, keyword);
};


// Override defense calculation to add phalanx bonus, assuming conditions are met
var calculateDefense = DamageCalculator.calculateDefense;
DamageCalculator.calculateDefense = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
    var def = calculateDefense.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
    var passiveIsDefender = isDefender(passive);
    var numHelpers = countNearbyFriendsWithPhalanx(passive);

    if (SkillControl.getPossessionCustomSkill(passive, "Phalanx") && passiveIsDefender) {
        def = def + 4 * numHelpers; // Change the value here if you want more/less defense from this skill
    }

    return def;
};
