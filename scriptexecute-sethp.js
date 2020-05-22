/*--------------------------------------------------------------------------

  Sets a unit's current HP to a given variable

  Usage: In the "Execute Script" event, tick "Execute Code" and call setUnitHPToVariable();
  In the "Original Data" tab:

    Select the unit you want to affect in the "Unit" field
    Put the variable name in the "Keyword" field
    Put the variable table number into the "Value 1" field (default is 0 => variable table 1)

--------------------------------------------------------------------------*/

function setUnitHPToVariable() {
    var content = root.getEventCommandObject().getOriginalContent();
    var unit = content.getUnit();
    var varName = content.getCustomKeyword();
    var tableNumber = content.getValue(0);

    try {
        var variableTable = root.getMetaSession().getVariableTable(tableNumber);
        var numVariables = variableTable.getVariableCount();
        var hpValue;
        for (var i = 0; i < numVariables; i++) {
            var variableName = variableTable.getVariableName(i);
            if (variableName == varName) {
        	   hpValue = variableTable.getVariable(i);
        	    break;
            }
        }
        if (hpValue == null) {
           throw new Error("Could not find variable with name " + varName + " in table " + tableNumber);
        }

        unit.setHP(hpValue);
    } catch (error) {
    	// Log the error and quit without doing anything else, to prevent the game from crashing.
        root.log(error);
    }
}
