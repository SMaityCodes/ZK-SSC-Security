pragma circom 2.1.6;

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