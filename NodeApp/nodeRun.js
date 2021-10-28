const { exec } = require("child_process");


const runnode = function()  {exec(

    `cardano-node run 
    --topology /home/alice/cardano-src/cardano-node/testnet-topology.json 
    --database-path /home/alice/cardano-src/cardano-node/db 
    --socket-path /home/alice/cardano-src/cardano-node/db/node.socket 
    --port 3001 
    --config /home/alice/cardano-src/cardano-node/testnet-config.json`.replace( /[\r\n]+/g," ")), (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      };
    }
runnode();