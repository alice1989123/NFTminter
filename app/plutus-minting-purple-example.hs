

import           Prelude

import           Cardano.Api
import           Cardano.Api.Shelley

import qualified Cardano.Ledger.Alonzo.Data as Alonzo
import qualified Plutus.V1.Ledger.Api as Plutus

import             Week05.MintingScriptPurple(apiExamplePlutusMintingScriptPurple,
                   mintingScriptPurpleShortBs)

main :: IO ()
main = do
  
  result <- writeFileTextEnvelope "minting-policy-purple.plutus" Nothing apiExamplePlutusMintingScriptPurple
  case result of
    Left err -> print $ displayError err
    Right () -> return ()
