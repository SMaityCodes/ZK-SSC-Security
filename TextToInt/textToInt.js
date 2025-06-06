const fs = require('fs');
const utils = require("ffjavascript").utils;

function processField3(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    const dir = lastSlashIndex >= 0 ? path.substring(0, lastSlashIndex + 1) : '';
    const file = lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
    return {
        dir: utils.leBuff2int(Buffer.from(dir, 'utf8')),
        file: utils.leBuff2int(Buffer.from(file, 'utf8'))
    };
}

async function main() {
    try {
    	// Read the input json file 
    	const rawData = fs.readFileSync('metadata.json', 'utf-8');
    	
    	// Parse the JSON
	const jsonData = JSON.parse(rawData);
	
    	// Print the entire JSON object
        console.log("Input Json File Contents:");
        console.log(jsonData);
        
	//console.log('Now Printing the String Values One-by-One');
	
	let F1, F3, F2 = [], 
		F4 = {
	    		sub1: undefined,
	    		sub2: undefined
		},
		F5 = {
	    		sub1: {
		    		SubSub1: undefined,
		    		SubSub2: undefined
	    		},
	    		sub2: undefined
		};
	
	
	F1 = utils.leBuff2int(Buffer.from(jsonData.Field1, 'utf8'));
	
	F2[0] = utils.leBuff2int(Buffer.from(jsonData.Field2[0], 'utf8'));
	F2[1] = utils.leBuff2int(Buffer.from(jsonData.Field2[1], 'utf8'));
	F2[2] = utils.leBuff2int(Buffer.from(jsonData.Field2[2], 'utf8'));
	
	 // Process Field3 using the function
	 const { dir: F3_dir, file: F3_file } = processField3(jsonData.Field3);
	
	F4.sub1 = utils.leBuff2int(Buffer.from(jsonData.Field4.sub1, 'utf8'));
	F4.sub2 = utils.leBuff2int(Buffer.from(jsonData.Field4.sub2, 'utf8'));
	
	F5.sub1.SubSub1 = utils.leBuff2int(Buffer.from(jsonData.Field5.sub1.SubSub1, 'utf8'));
	F5.sub1.SubSub2 = utils.leBuff2int(Buffer.from(jsonData.Field5.sub1.SubSub2, 'utf8'));
	F5.sub2 = utils.leBuff2int(Buffer.from(jsonData.Field5.sub2, 'utf8'));
       
        
        // Prepare Processed-output File
        const output = {
            Field1: F1.toString(),
            Field2: [F2[0].toString(), F2[1].toString(), F2[2].toString()],
            Field3_prefix: F3_dir.toString(),
            Field3_filename: F3_file.toString(),
            Field4_sub1: F4.sub1.toString(), 
            Field4_sub2: F4.sub2.toString(),
            Field5_sub1_SubSub1:F5.sub1.SubSub1.toString(),
            Field5_sub1_SubSub2:F5.sub1.SubSub2.toString(),
            Field5_sub2:F5.sub2.toString()
        };
	
	fs.writeFileSync('IntFormat.json', JSON.stringify(output, null, 2));
        console.log('Output generated successfully');
        
	
        
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

main();
