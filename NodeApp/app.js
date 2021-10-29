const { exec } = require("child_process");
const execSync = require("child_process").execSync;
const fs = require('fs');

const fundingAddrs =
  "addr_test1vqngjxs84km0t6uq8pf8tqy72kcprz4k5cd9g9rhvdmr5js4jr39h";
const signingKey = "/home/alice/TestnetWallets/payment.skey";

const run = function (cmd) {
  const output = execSync(cmd, { encoding: "utf-8" });
  return output;
};

const testNetMagicNum = 1097911063;
const tokenName = "alc";
const scriptPath = "../minting-policy-purple.plutus";
const TokenAmount = 1;
const alice2 =
  "addr_test1qp6kuchljenmrpeqndh7rdthqc2frnm0jw5pu8u3ws0zuwkvhpj2uecg0a5mhkdtwnm30qw38tjq42uxu80rpjn7yytsmffw4e";

const queryAddrs = function (addr) {
  const cmd = `cardano-cli query utxo --address  ${addr} --testnet-magic ${testNetMagicNum} `;
  return run(cmd); // the default is 'buffer'
};
const getUTXO = function (addr , n ) {
  const output = queryAddrs(addr).split(/\r?\n/);
  const uTXOs = output.slice(2, -1);
  let lines = [];
  for (var i = 0; i < uTXOs.length; i++) {
    lines.push(uTXOs[i].split(/[ ]+/).slice(0, 3));
  }
  const uTXO = lines[n];
  // const collateral = lines[1]
  const uTXOId = `${uTXO[0]}#${uTXO[1]}`;
  // const collateralId = `${collateral[0]}#${collateral[1]}`
  return {"uTXOId":uTXOId,
  "value": uTXO[2]
};
};


const lastSlot = JSON.parse(run(`cardano-cli query tip --testnet-magic ${testNetMagicNum}`)).slot;
console.log(lastSlot)
// const getPubkeyHash = function (addr) { run(`cardano-cli ${addr} key-hash --testnet-magic ${testNetMagicNum}`)}
//console.log(getPubkeyHash(alice2))

const minting_policy = `{
    "type": "all",
    "scripts":
    [
      {
        "type": "before",
        "slot": ${lastSlot+2000}
      }
      
    ]
  }`

console.log(minting_policy)

fs.writeFile("minting_policy1.script",minting_policy, function(err) {
    if (err) {
        console.log(err);
    }
});

policeId=run(`cardano-cli transaction policyid --script-file ./minting_policy2.script`)

const metaData = `{
    "721": {
        "${policeId}": {
          "NFT1": {
            "description": "This is my first NFT thanks to the Cardano foundation",
            "name": "Cardano foundation NFT guide token",
            "id": 1,
            "image": ""
          }
        }
    }
}`
console.log(metaData )
/* fs.writeFile("metaData.json",metaData, function(err) {  
    if (err) {
        console.log(err);
    }
}); */


const value = `${TokenAmount} ${policeId}.${tokenName}`.replace(
    /(\r\n|\n|\r)/gm,
    "")
console.log(value)
run(`cardano-cli transaction build-raw \
    --alonzo-era \
    --fee 0 \
    --tx-in ${getUTXO(alice2,1).uTXOId} \
    --tx-in-collateral ${getUTXO(alice2,0).uTXOId} \
    --tx-out "${alice2}+ 2724100 lovelace + ${value}"  \
    --mint="${value}" \
    --minting-script-file ./minting_policy2.script \
    --metadata-json-file ./metaData.json  \
    --protocol-params-file testnet-protocol-parameters.json \
    --out-file matx.raw`) 

    run(`cardano-cli query protocol-parameters --testnet-magic ${testNetMagicNum}  --out-file protocol.json`)
    const fee = run (`cardano-cli transaction calculate-min-fee --tx-body-file matx.raw --tx-in-count 1 --tx-out-count 1 --witness-count 2 --testnet-magic ${testNetMagicNum}  --protocol-params-file protocol.json | cut -d " " -f1`)
    
    const output = getUTXO(alice2,1).value-fee
    
    run(`cardano-cli transaction build-raw \
    --alonzo-era \
    --tx-in ${getUTXO(alice2,1).uTXOId} \
    --tx-in-collateral ${getUTXO(alice2,0).uTXOId} \
    --tx-out "${alice2}+ ${output} lovelace + ${value}"  \
    --mint="${value}" \
    --minting-script-file ./minting_policy2.script \
    --metadata-json-file ./metaData.json  \
    --protocol-params-file testnet-protocol-parameters.json \
    --out-file matx.raw \
    --fee ${fee} `) 
    
/*
  console.log(
    run(
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
   --out-file nFTTx.body`.replace(/[\r\n]+/g, " ")
    )
  );


/* 
const output = queryAddrs(alice2).split(/\r?\n/);
const uTXOs = output.slice(2, -1);
let lines = [];
for (var i = 0; i < uTXOs.length; i++) {
  lines.push(uTXOs[i].split(/[ ]+/).slice(0, 3));
}
const uTXO = lines[0];
// const collateral = lines[1]
const uTXOId = `${uTXO[0]}#${uTXO[1]}`;
// const collateralId = `${collateral[0]}#${collateral[1]}`

const policyID = run(
  `cardano-cli transaction policyid \
        --script-file ${scriptPath}`
);
const value = `${TokenAmount} ${policyID}.${coinName}`.replace(
  /(\r\n|\n|\r)/gm,
  ""
);

const 
run(`cardano-cli query protocol-parameters \
    --testnet-magic ${testNetMagicNum} \
    --out-file "testnet-protocol-parameters.json"`);
console.log(uTXOId);
console.log(
  run(
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
 --out-file nFTTx.body`.replace(/[\r\n]+/g, " ")
  )
);

run(`cardano-cli transaction sign \
    --tx-body-file nFTTx.body \
    --signing-key-file ${signingKey} \
    --testnet-magic ${testNetMagicNum} \
    --out-file outFile`);

run(`cardano-cli transaction submit \
    --testnet-magic ${testNetMagicNum} \
    --tx-file outFile`);

console.log(queryAddrs(fundingAddrs)); */

/* console.log(getUTXO(alice2,1));
 */