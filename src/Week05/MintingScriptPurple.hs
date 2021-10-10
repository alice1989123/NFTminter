{-# LANGUAGE DataKinds #-}
{-# LANGUAGE DeriveAnyClass #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE FlexibleInstances #-}
{-# LANGUAGE FlexibleContexts #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE NamedFieldPuns #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE TypeOperators #-}

module Week05.MintingScriptPurple
  (  apiExamplePlutusMintingScriptPurple
  , mintingScriptPurpleShortBs 
  ) where

import           Prelude                (IO, Semigroup (..), Show (..), String)

import           Cardano.Api.Shelley (PlutusScript (..), PlutusScriptV1)

import           Codec.Serialise
import           Data.String
import qualified Data.ByteString.Lazy   as LB
import qualified Data.ByteString.Short  as SBS

import           Ledger hiding (singleton)
import qualified Ledger.Typed.Scripts   as Scripts
import           Ledger.Value           as Value
import qualified PlutusTx
import           PlutusTx                 (Data (..))
import           PlutusTx.Prelude hiding (Semigroup (..), unless)
import qualified Cardano.Ledger.Alonzo.Data as Alonzo
import           Plutus.V1.Ledger.Bytes  
import           Plutus.V1.Ledger.Tx  



{-# INLINABLE mkPolicy #-}
mkPolicy :: TxOutRef -> TokenName -> () -> ScriptContext -> Bool
mkPolicy oref tn () ctx = traceIfFalse "UTxO not consumed"   hasUTxO           &&
                          traceIfFalse "wrong amount minted" checkMintedAmount
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    hasUTxO :: Bool
    hasUTxO = any (\i -> txInInfoOutRef i == oref) $ txInfoInputs info

    checkMintedAmount :: Bool
    checkMintedAmount = case flattenValue (txInfoMint info) of
        [(cs, tn', amt)] -> cs  == ownCurrencySymbol ctx && tn' == tn && amt == 1
        _                -> False

policy :: TxOutRef -> TokenName -> Scripts.MintingPolicy
policy oref tn = mkMintingPolicyScript $
    $$(PlutusTx.compile [|| \oref' tn' -> Scripts.wrapMintingPolicy $ mkPolicy oref' tn' ||])
    `PlutusTx.applyCode`
    PlutusTx.liftCode oref
    `PlutusTx.applyCode`
    PlutusTx.liftCode tn
    
txId' :: TxId
txId' =   "95f644032e4e2f516ddee5ae9ceb8d467f53f630c4d4f481771cb56063adb244" 

outRef = TxOutRef { txOutRefId = txId'  ,
                    Plutus.V1.Ledger.Tx.txOutRefIdx = 1
                  }
tokenName' :: TokenName
tokenName' = "alc"

plutusScript :: Script
plutusScript =
  unMintingPolicyScript (policy outRef tokenName' )
   
            

validator :: Validator
validator = Validator $ plutusScript

scriptAsCbor :: LB.ByteString
scriptAsCbor = serialise validator

apiExamplePlutusMintingScriptPurple :: PlutusScript PlutusScriptV1
apiExamplePlutusMintingScriptPurple = PlutusScriptSerialised . SBS.toShort $ LB.toStrict scriptAsCbor

mintingScriptPurpleShortBs :: SBS.ShortByteString
mintingScriptPurpleShortBs = SBS.toShort . LB.toStrict $ scriptAsCbor 
