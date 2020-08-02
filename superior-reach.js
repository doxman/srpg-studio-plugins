// Grants a Reach skill that does two things when the unit is defending in battle:
// - Adds 3 damage to the defender, similar to Strong Riposte in FE Fates
// - Gives the defender a first strike, just like the default Ambush skill (but without displaying itself)

// As with Ambush, Reach is cancelled when both units have it, and the two skills also cancel each other.
// It is also cancelled if the opponent has a "Disruptive" custom skill.

// To use, make a custom skill with keyword "Reach".

// TODO: These skills assume a 100% activation rate for now, I'll work in the randomizer later

(function(){
    // Checks if a unit is the attacker (ie. the one that initiated the battle)
    var isAttacker = function(unit) {
        if (root.getCurrentScene() === SceneType.FREE) {
            var turnType = root.getCurrentSession().getTurnType();
            var unitType = unit.getUnitType();
            return (turnType === TurnType.PLAYER && unitType === UnitType.PLAYER)
                || (turnType === TurnType.ALLY && unitType === UnitType.ALLY)
                || (turnType === TurnType.ENEMY && unitType === UnitType.ENEMY);
        }
        return false;
    };

    var calculateAttackPower = DamageCalculator.calculateAttackPower;
    DamageCalculator.calculateAttackPower = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
        var pow = calculateAttackPower.call(this, active, passive, weapon, isCritical, totalStatus, trueHitValue);
        var passiveIsAttacker = isAttacker(passive);
        if (
            SkillControl.getPossessionCustomSkill(active, "Reach")
            && passiveIsAttacker
            && !SkillControl.getPossessionCustomSkill(passive, "Reach")
            && !SkillControl.getPossessionCustomSkill(passive, "Disruptive")
            && !SkillControl.getPossessionSkill(passive, SkillType.FASTATTACK)
        ) {
            pow = pow + 3;
        }

        return pow;
    };

    NormalAttackOrderBuilder._isDefaultPriority = function(virtualActive, virtualPassive) {
        var active = virtualActive.unitSelf;
        var passive = virtualPassive.unitSelf;

        if (SkillControl.getPossessionSkill(active, SkillType.FASTATTACK)
            || SkillControl.getPossessionCustomSkill(active, "Reach")
            || SkillControl.getPossessionCustomSkill(active, "Disruptive")) {
            // All of these skills prevent a pre-emptive attack when the attacker has them
            return true;
        }

        // If the defender has "Preemptive Attack" or "Reach" and the attacker did not disable them, the defender attacks first.
        if (this._attackInfo.isCounterattack) {
            var fastattack = SkillControl.getPossessionSkill(passive, SkillType.FASTATTACK);
            var superiorReach = SkillControl.getPossessionCustomSkill(passive, "Reach");

            if (fastattack) {
                virtualPassive.skillFastAttack = fastattack;
                return false;
            } else if (superiorReach) {
                virtualPassive.skillFastAttack = superiorReach;
                return false;
            }
        }

        return true;
    };
})();
