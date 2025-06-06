const fs = require('fs');

async function main() {
    try {
    	// Prepare output
        const output = {
            Field1: "Hello World",
            Field2: ["AA", "BB", "CC"],
            Field3: "/home/usr/lib",
            Field4: {sub1: "xx", sub2: "kk"},
            Field5: {
            	sub1: {
            	    SubSub1: "aa", 
            	    SubSub2: "bb", 
            	},
            	sub2: "kk"
            }
        };
        
        fs.writeFileSync('metadata.json', JSON.stringify(output, null, 2));
        console.log('Output generated successfully');
        
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

main();
