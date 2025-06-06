pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
//include "helper.circom";

template RequireRule(maxRows, targetCols, matrixCols, idx1, idx2) {
    signal input expectedArtifact[targetCols];
    signal input artifacts[maxRows][matrixCols];
    signal input numRows;
    signal input usedRows[maxRows];
    signal output found;
    signal output rowSelector[maxRows];
    
    component isActive[maxRows];
    component elem1[maxRows];
    component elem2[maxRows];
    component isZero;
    signal skipIndex1;
    signal intermediate[maxRows];
    signal rowResults[maxRows];
    signal temp1[maxRows];
    signal activeAndUnused[maxRows]; // New signal to break down the constraint

    isZero = IsZero();
    isZero.in <== expectedArtifact[idx1];
    skipIndex1 <== isZero.out;
    
    for (var i = 0; i < maxRows; i++) {
        isActive[i] = LessThan(32);
        isActive[i].in[0] <== i;
        isActive[i].in[1] <== numRows;
        
        // Break down into quadratic constraints
        activeAndUnused[i] <== isActive[i].out * (1 - usedRows[i]);
        
        elem1[i] = IsEqual();
        elem1[i].in[0] <== expectedArtifact[idx1];
        elem1[i].in[1] <== artifacts[i][idx1];
        
        elem2[i] = IsEqual();
        elem2[i].in[0] <== expectedArtifact[idx2];
        elem2[i].in[1] <== artifacts[i][idx2];
        
        temp1[i] <== (1 - skipIndex1) * elem1[i].out;
        intermediate[i] <== activeAndUnused[i] * (skipIndex1 + temp1[i]);
        rowResults[i] <== intermediate[i] * elem2[i].out;
        rowSelector[i] <== rowResults[i];
    }
    
    component orReducer = OrReduce(maxRows);
    for (var i = 0; i < maxRows; i++) {
        orReducer.in[i] <== rowResults[i];
    }
    found <== orReducer.out;
}

template ArtifactMatch(expectedCols, expectedRows) {
    signal input expectedArtifact[expectedCols];
    signal input materials[expectedRows][expectedCols];
    signal output found;
    
    component matches[expectedRows];
    signal matchResults[expectedRows];
    
    for (var k = 0; k < expectedRows; k++) {
        matches[k] = IsEqualVec(expectedCols);
        matches[k].a <== expectedArtifact;
        matches[k].b <== materials[k];
        matchResults[k] <== matches[k].out;
    }
    
    component anyMatch = OrReduce(expectedRows);
    for (var k = 0; k < expectedRows; k++) {
        anyMatch.in[k] <== matchResults[k];
    }
    found <== anyMatch.out;
}



template CreateRule(maxRows, expectedCols, productsCols, idx1, idx2, compareRows) {
    signal input expectedArtifact[expectedCols];
    signal input products[maxRows][productsCols];
    signal input numRows;
    signal input materials[compareRows][productsCols];
    signal input usedProductRows[maxRows];
    signal input usedMaterialRows[compareRows];
    
    // Outputs
    signal output result;
    signal output matchedProductRow[productsCols];
    signal output newUsedProductRows[maxRows];
    signal output newUsedMaterialRows[compareRows];
    
    // Internal signals
    signal productFound;
    signal materialFound;
    signal rowSelector[maxRows];
    signal activeProductRows[maxRows];
    
    // Calculate active product rows (not used before and within numRows)
    component isActive[maxRows];
    for (var i = 0; i < maxRows; i++) {
        isActive[i] = LessThan(32);
        isActive[i].in[0] <== i;
        isActive[i].in[1] <== numRows;
        
        activeProductRows[i] <== (1 - usedProductRows[i]) * isActive[i].out;
    }
    
    // Check if expectedArtifact exists in products (only unused rows)
    component productMatcher = RequireRule(maxRows, expectedCols, productsCols, idx1, idx2);
    productMatcher.expectedArtifact <== expectedArtifact;
    productMatcher.artifacts <== products;
    productMatcher.numRows <== numRows;
    productMatcher.usedRows <== usedProductRows; // Connect usedRows input
    
    // Combine with active rows
    signal activeRowResults[maxRows];
    for (var i = 0; i < maxRows; i++) {
        activeRowResults[i] <== productMatcher.rowSelector[i] * activeProductRows[i];
    }
    
    component orReducer = OrReduce(maxRows);
    for (var i = 0; i < maxRows; i++) {
        orReducer.in[i] <== activeRowResults[i];
    }
    productFound <== orReducer.out;
    
    // Get the matched product row
    signal partialSum[maxRows+1][productsCols];
    for (var j = 0; j < productsCols; j++) {
        partialSum[0][j] <== 0;
    }
    for (var i = 0; i < maxRows; i++) {
        rowSelector[i] <== activeRowResults[i];
        for (var j = 0; j < productsCols; j++) {
            partialSum[i+1][j] <== partialSum[i][j] + (rowSelector[i] * products[i][j]);
        }
    }
    for (var j = 0; j < productsCols; j++) {
        matchedProductRow[j] <== partialSum[maxRows][j];
    }
    
    // Update used product rows
    for (var i = 0; i < maxRows; i++) {
        newUsedProductRows[i] <== usedProductRows[i] + rowSelector[i];
    }
    
    // Check if expectedArtifact exists in materials (only unused rows)
    component materialMatcher = ArtifactMatch(productsCols, compareRows);
    materialMatcher.expectedArtifact <== matchedProductRow;
    
    // Create materials array with unused rows only
    signal activeMaterials[compareRows][productsCols];
    for (var k = 0; k < compareRows; k++) {
        for (var j = 0; j < productsCols; j++) {
            activeMaterials[k][j] <== materials[k][j] * (1 - usedMaterialRows[k]);
        }
    }
    materialMatcher.materials <== activeMaterials;
    materialFound <== materialMatcher.found;
    
    // Components for material row tracking (declared outside loop)
    component isMatchedMat[compareRows];
    component isRowUsed[compareRows];
    signal materialRowUsed[compareRows];
    
    for (var k = 0; k < compareRows; k++) {
        // Check if material was matched
        isMatchedMat[k] = IsEqual();
        isMatchedMat[k].in[0] <== materialMatcher.found;
        isMatchedMat[k].in[1] <== 1;
        
        // Check if row should be marked as used
        isRowUsed[k] = AND();
        isRowUsed[k].a <== isMatchedMat[k].out;
        isRowUsed[k].b <== (1 - usedMaterialRows[k]);
        
        materialRowUsed[k] <== isRowUsed[k].out;
        newUsedMaterialRows[k] <== usedMaterialRows[k] + materialRowUsed[k];
    }
    
    // Final output logic: 0 if present in both, 1 otherwise
    result <== 1 - (productFound * materialFound);
}

template DisallowRule(maxRows, cols) {
    signal input artifacts[maxRows][cols];
    signal input numRows;
    signal input usedRows[maxRows];
    signal output found;
    
    component isActive[maxRows];
    for (var i = 0; i < maxRows; i++) {
        isActive[i] = LessThan(32);
        isActive[i].in[0] <== i;
        isActive[i].in[1] <== numRows;
    }
    
    // Find unconsumed rows
    signal unconsumedRows[maxRows];
    for (var i = 0; i < maxRows; i++) {
        unconsumedRows[i] <== (1 - usedRows[i]) * isActive[i].out;
    }
    
    // Check if any unconsumed rows exist
    component hasUnconsumed = OrReduce(maxRows);
    for (var i = 0; i < maxRows; i++) {
        hasUnconsumed.in[i] <== unconsumedRows[i];
    }
    
    // Final output: 1 if no unconsumed rows, 0 otherwise
    component notHasUnconsumed = NOT();
    notHasUnconsumed.in <== hasUnconsumed.out;
    found <== notHasUnconsumed.out;
}



template Checker() {
    // Input signals
    signal input layout_type;
    signal input layout_name;
    signal input expected_command[2];
    signal input expected_materials[3][3];
    signal input expected_products[3][3];
    signal input link_type;
    signal input link_name;
    signal input link_command[2];
    signal input link_materials[5][4];      // Up to 5 rows, 4 columns each
    signal input link_materials_numRows;   // Actual number of material rows
    signal input link_products[5][4];      // Up to 5 rows, 4 columns each
    signal input link_products_numRows;    // Actual number of product rows
    
    // Constants for rule IDs
    signal REQUIRE_RULE_ID <== 6;
    signal CREATE_RULE_ID <== 2;
    signal DISALLOW_RULE_ID <== 7;

    // ======================
    // Material Checks (REQUIRE only)
    // ======================
    component isMaterialRequireRule[3];
    component materialRequireChecks[3];
    signal material_results[3];
    signal materialUsedRows[3][5];        // Tracks up to 5 material rows per rule
    
    // Initialize material used rows to zero
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 5; j++) {
            materialUsedRows[i][j] <== 0;
        }
    }

    for (var i = 0; i < 3; i++) {
        // Check if this rule is a REQUIRE rule
        isMaterialRequireRule[i] = IsEqual();
        isMaterialRequireRule[i].in[0] <== expected_materials[i][0];
        isMaterialRequireRule[i].in[1] <== REQUIRE_RULE_ID;
        
        // REQUIRE Rule: look for expected_materials[i] in link_materials
        materialRequireChecks[i] = RequireRule(5, 3, 4, 1, 2);
        materialRequireChecks[i].expectedArtifact <== expected_materials[i];
        materialRequireChecks[i].artifacts <== link_materials;
        materialRequireChecks[i].numRows <== link_materials_numRows;
        materialRequireChecks[i].usedRows <== materialUsedRows[i];
        
        // material_results[i] = 1 if rule applies and artifact found
        material_results[i] <==
            isMaterialRequireRule[i].out * materialRequireChecks[i].found;
    }

    // ======================
    // Product Checks (CREATE, REQUIRE, DISALLOW)
    // ======================
    signal usedProductRows[5] <== [0, 0, 0, 0, 0];
    signal usedMaterialRows[5] <== [0, 0, 0, 0, 0];
    
    component isProductCreateRule[3];
    component isProductRequireRule[3];
    component isProductDisallowRule[3];
    component productCreateChecks[3];
    component productRequireChecks[3];
    component productDisallowChecks[3];
    
    signal productCreateResults[3];
    signal productRequireResults[3];
    signal productDisallowResults[3];
    signal productFinalResults[3];
    signal tempUsedProductRows[3][5];      // Track new used rows per rule
    signal tempUsedMaterialRows[3][5];     

    for (var i = 0; i < 3; i++) {
        // Detect which rule type applies
        isProductCreateRule[i] = IsEqual();
        isProductCreateRule[i].in[0] <== expected_products[i][0];
        isProductCreateRule[i].in[1] <== CREATE_RULE_ID;
        
        isProductRequireRule[i] = IsEqual();
        isProductRequireRule[i].in[0] <== expected_products[i][0];
        isProductRequireRule[i].in[1] <== REQUIRE_RULE_ID;
        
        isProductDisallowRule[i] = IsEqual();
        isProductDisallowRule[i].in[0] <== expected_products[i][0];
        isProductDisallowRule[i].in[1] <== DISALLOW_RULE_ID;
        
        // ------ CREATE Rule ------
        productCreateChecks[i] = CreateRule(5, 3, 4, 1, 2, 5);
        productCreateChecks[i].expectedArtifact <== expected_products[i];
        productCreateChecks[i].products <== link_products;
        productCreateChecks[i].numRows <== link_products_numRows;
        productCreateChecks[i].materials <== link_materials;
        // Use prior usedRows or global for first
        if (i == 0) {
            productCreateChecks[i].usedProductRows <== usedProductRows;
            productCreateChecks[i].usedMaterialRows <== usedMaterialRows;
        } else {
            productCreateChecks[i].usedProductRows <== tempUsedProductRows[i-1];
            productCreateChecks[i].usedMaterialRows <== tempUsedMaterialRows[i-1];
        }
        
        // ------ REQUIRE Rule ------
        productRequireChecks[i] = RequireRule(5, 3, 4, 1, 2);
        productRequireChecks[i].expectedArtifact <== expected_products[i];
        productRequireChecks[i].artifacts <== link_products;
        productRequireChecks[i].numRows <== link_products_numRows;
        productRequireChecks[i].usedRows <== (i == 0) ? usedProductRows : tempUsedProductRows[i-1];
        
        // ------ DISALLOW Rule ------
        productDisallowChecks[i] = DisallowRule(5, 4);
        productDisallowChecks[i].artifacts <== link_products;
        productDisallowChecks[i].numRows <== link_products_numRows;
        productDisallowChecks[i].usedRows <== (i == 0) ? usedProductRows : tempUsedProductRows[i-1];
        
        // Capture updated used rows from CREATE
        tempUsedProductRows[i] <== productCreateChecks[i].newUsedProductRows;
        tempUsedMaterialRows[i] <== productCreateChecks[i].newUsedMaterialRows;
        
        // Compute result bits
        productCreateResults[i] <== isProductCreateRule[i].out * productCreateChecks[i].result;
        productRequireResults[i] <== isProductRequireRule[i].out * productRequireChecks[i].found;
        productDisallowResults[i] <== isProductDisallowRule[i].out * productDisallowChecks[i].found;
        
        // Sum for final per-rule validity (one of them should fire)
        productFinalResults[i] <== productCreateResults[i] + productRequireResults[i] + productDisallowResults[i];
    }

    // ======================
    // Final Aggregation
    // ======================
    component andMaterial = AndReduce(3);
    component andProduct  = AndReduce(3);
    for (var i = 0; i < 3; i++) {
        andMaterial.in[i] <== material_results[i];
        andProduct.in[i]  <== productFinalResults[i];
    }

    // Outputs: all material & product rules must pass
    signal output materialcheck <== andMaterial.out;
    signal output productcheck  <== andProduct.out;
    signal output valid         <== andMaterial.out * andProduct.out;
    valid ===1;
}


template OrReduce(n) {
    signal input in[n];
    signal output out;
    
    signal intermediate[n];
    intermediate[0] <== in[0];
    
    for (var i = 1; i < n; i++) {
        intermediate[i] <== intermediate[i-1] + in[i] - (intermediate[i-1] * in[i]);
    }
    
    out <== intermediate[n-1];
}

template IsEqualVec(n) {
    signal input a[n];
    signal input b[n];
    signal output out;
    
    component eqs[n];
    for (var i = 0; i < n; i++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== a[i];
        eqs[i].in[1] <== b[i];
    }
    
    component and = AndReduce(n);
    for (var i = 0; i < n; i++) {
        and.in[i] <== eqs[i].out;
    }
    out <== and.out;
}

template AndReduce(n) {
    signal input in[n];
    signal output out;
    signal intermediate[n];
    intermediate[0] <== in[0];
    for (var i = 1; i < n; i++) {
        intermediate[i] <== intermediate[i-1] * in[i];
    }
    out <== intermediate[n-1];
}

template AND() {
    signal input a;
    signal input b;
    signal output out;
    out <== a * b;
}

template Add() {
    signal input in[2];
    signal output out;
    out <== in[0] + in[1];
}

// Helper component for NOT operation
template NOT() {
    signal input in;
    signal output out;
    out <== 1 - in;
}

component main = Checker();