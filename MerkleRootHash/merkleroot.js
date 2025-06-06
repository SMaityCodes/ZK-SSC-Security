const circomlibjs = require("circomlibjs");
const fs = require("fs").promises;

(async () => {
    try {
        // Initialize Poseidon once
        const poseidon = await circomlibjs.buildPoseidon();
        
        // Read and process input file
        const input = JSON.parse(await fs.readFile("IntFormat.json", "utf8"));
        
        // Prepare leaves (9 values + 7 zero padding)
        const leaves = [
            BigInt(input.Field1),
            ...input.Field2.map(BigInt),
            BigInt(input.Field3),
            BigInt(input.Field4_sub1),
            BigInt(input.Field4_sub2),
            BigInt(input.Field5_sub1_SubSub1),
            BigInt(input.Field5_sub1_SubSub2),
            BigInt(input.Field5_sub2)
        ];

        while (leaves.length < 16) leaves.push(0n);//Pad to 16 leaves

        // Compute Merkle root
        let currentLevel = leaves.map(leaf => leaf.toString());
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const hash = poseidon.F.toString(poseidon([
                    BigInt(currentLevel[i]), 
                    BigInt(currentLevel[i+1] || "0")
                ]));
                nextLevel.push(hash);
            }
            currentLevel = nextLevel;
        }

        const merkleRoot = currentLevel[0];
        console.log("Merkle Root:", merkleRoot);

        // Save to input.json
        await fs.writeFile(
            "input.json",
            JSON.stringify({ ...input, MerkleRoot: merkleRoot }, null, 2)
        );
        
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
})();