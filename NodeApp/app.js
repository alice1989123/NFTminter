const { exec } = require("child_process");
const execSync = require('child_process').execSync;
const fundingAddrs = "addr_test1vqngjxs84km0t6uq8pf8tqy72kcprz4k5cd9g9rhvdmr5js4jr39h"
const signingKey = "/home/alice/TestnetWallets/payment.skey"



const run = function(cmd) {
    const output = execSync(cmd, { encoding: 'utf-8' })
    return output
}

const testNetMagicNum = 1097911063
const coinName ='alc'
const scriptPath = '../minting-policy-purple.plutus'
const TokenAmount = 1


const queryAddrs = function (addr) {
    const cmd = `cardano-cli query utxo --address  ${addr} --testnet-magic ${testNetMagicNum} ` 
    return run(cmd);  // the default is 'buffer'
                                    }
console.log(queryAddrs(fundingAddrs));                                    
const output = queryAddrs(fundingAddrs).split(/\r?\n/)
const uTXOs = output.slice(2,-1)
let lines = [];
for(var i = 0; i < uTXOs.length; i++){
    lines.push(uTXOs[i].split(/[ ]+/).slice(0,3));
}
const uTXO = lines[0]
const collateral = lines[1]
const uTXOId = `${uTXO[0]}#${uTXO[1]}` 
const collateralId = `${collateral[0]}#${collateral[1]}`

const policyID = run (
    `cardano-cli transaction policyid \
        --script-file ${scriptPath}`)
const value = `${TokenAmount} ${policyID}.${coinName}`.replace(/(\r\n|\n|\r)/gm, ""); 


run(`cardano-cli query protocol-parameters \
    --testnet-magic ${testNetMagicNum} \
    --out-file "testnet-protocol-parameters.json"`);
console.log(uTXOId)
 console.log( run(
 `cardano-cli transaction build  
 --alonzo-era 
 --testnet-magic ${testNetMagicNum} 
 --tx-in ${uTXOId} 
 --tx-in-collateral ${collateralId} 
 --tx-out "${fundingAddrs}+ 2724100 lovelace + ${value}" 
 --mint "${value}" 
 --mint-script-file ${scriptPath} 
 --mint-redeemer-value  42
 --change-address ${fundingAddrs} 
 --protocol-params-file testnet-protocol-parameters.json 
 --out-file nFTTx.body`.replace( /[\r\n]+/g," ")
 )); 


run(`cardano-cli transaction sign \
    --tx-body-file nFTTx.body \
    --signing-key-file ${signingKey} \
    --testnet-magic ${testNetMagicNum} \
    --out-file outFile`)
    
run (`cardano-cli transaction submit \
    --testnet-magic ${testNetMagicNum} \
    --tx-file outFile`)

console.log(queryAddrs(fundingAddrs));
