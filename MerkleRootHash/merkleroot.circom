pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template MerkleRoot(levels) {
    signal input leaves[2**levels];
    signal output root;
    
    // Total hashers needed: (2^levels - 1)
    component hashers[2**levels - 1];
    
    // Initialize all hashers
    for (var i = 0; i < 2**levels - 1; i++) {
        hashers[i] = Poseidon(2);
    }
    
    // Connect leaves (bottom level)
    var leaf_hashers = 2**(levels-1);
    for (var i = 0; i < leaf_hashers; i++) {
        hashers[i].inputs[0] <== leaves[2*i];
        hashers[i].inputs[1] <== leaves[2*i+1];
    }
    
    // Connect internal nodes
    var nodes_processed = 0;
    var nodes_in_level = leaf_hashers / 2;
    
    while (nodes_in_level >= 1) {
        for (var i = 0; i < nodes_in_level; i++) {
            var parent_idx = leaf_hashers + nodes_processed + i;
            var left_child = nodes_processed * 2 + i * 2;
            var right_child = left_child + 1;
            
            hashers[parent_idx].inputs[0] <== hashers[left_child].out;
            hashers[parent_idx].inputs[1] <== hashers[right_child].out;
        }
        nodes_processed += nodes_in_level;
        nodes_in_level = nodes_in_level / 2;
    }
    
    // The root is the last hasher
    root <== hashers[2**levels - 2].out;
}

template ProcessYourInput() {
    signal input Field1;
    signal input Field2[3];
    signal input Field3;
    signal input Field4_sub1;
    signal input Field4_sub2;
    signal input Field5_sub1_SubSub1;
    signal input Field5_sub1_SubSub2;
    signal input Field5_sub2;
    signal input MerkleRoot;
    
    // Pad to 16 leaves (next power of 2 above 9)
    signal leaves[16];
    
    // Assign actual values
    leaves[0] <== Field1;
    leaves[1] <== Field2[0];
    leaves[2] <== Field2[1];
    leaves[3] <== Field2[2];
    leaves[4] <== Field3;
    leaves[5] <== Field4_sub1;
    leaves[6] <== Field4_sub2;
    leaves[7] <== Field5_sub1_SubSub1;
    leaves[8] <== Field5_sub1_SubSub2;
    leaves[9] <== Field5_sub2;
    
    // Pad with zeros
    for (var i = 10; i < 16; i++) {
        leaves[i] <== 0;
    }
    
    component merkleRoot = MerkleRoot(4); // 2^4 = 16 leaves in total
    for (var i = 0; i < 16; i++) {
        merkleRoot.leaves[i] <== leaves[i];
    }
    
    // Compare computed root with supplied MerkleRoot which was calculated in js 
    component isEqual = IsEqual();
    isEqual.in[0] <== merkleRoot.root;
    isEqual.in[1] <== MerkleRoot;
    
    signal output match;
    match <== isEqual.out;// 1 means it's matchde else it's 0
}

component main = ProcessYourInput();