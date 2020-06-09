// Causes a weapon to use only half of its user's Str for damage calculation, like light weapons in classic D&D.
// If it is a magic weapon, the user's Mag is not affected (but this should be easy to change if you want).
// Typically this should be used together with multiple attacks to balance a "fast but weak" weapon.

// To use, create a custom skill with the keyword "Light Weapon" and apply it to the unit/class.

// TODO: These skills assume a 100% activation rate for now, I'll work in the randomizer later

(function() {
    // Overrides AbilityCalculator.getPower() to reduce Str-based power by half if you have the Light Weapon skill.
    AbilityCalculator.getPower = function(unit, weapon) {
        var pow;
        
        if (Miscellaneous.isPhysicsBattle(weapon)) {
            // Physical attack or Bow attack.
            pow = RealBonus.getStr(unit);

            if (SkillControl.getPossessionCustomSkill(unit, "Light Weapon")) {
                pow = Math.floor(pow / 2);
            }
        }
        else {
            // Magic attack
            pow = RealBonus.getMag(unit);
        }
        
        // Atk formula. Weapon pow + (Pow or Mag)
        return pow + weapon.getPow();
    };
})();
