import { getInitializeMintInstruction, getMintSize, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createRpcMessage, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, generateKeyPair, generateKeyPairSigner, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signAndSendTransactionMessageWithSigners, signTransactionMessageWithSigners } from "@solana/kit"
import { getCreateAccountInstruction } from "@solana-program/system"

import wallet from "../../wallet/wallet.json";

async function main() {
  try {

    const rpc = createSolanaRpc("https://api.devnet.solana.com");

    const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com")

    const uInt8Array = new Uint8Array(wallet);

    const signer = await createKeyPairSignerFromBytes(uInt8Array);

    const mint_keypair = await generateKeyPairSigner();

    const mintSpace = BigInt(getMintSize());

    const { value } = await rpc.getLatestBlockhash().send();

    const rent = await rpc.getMinimumBalanceForRentExemption(mintSpace).send();

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc, rpcSubscriptions
    })

    const msgg = createTransactionMessage({ version: 0 });

    const msgWihPayer = setTransactionMessageFeePayerSigner(signer, msgg);

    const msgWithliftime = setTransactionMessageLifetimeUsingBlockhash(value, msgWihPayer);

    const txMessage = appendTransactionMessageInstructions(
      [
        getCreateAccountInstruction({
          payer: signer,
          newAccount: mint_keypair,
          lamports: rent,
          space: mintSpace,
          programAddress: TOKEN_PROGRAM_ADDRESS
        }),

        getInitializeMintInstruction({
          mint: mint_keypair.address,
          decimals: 9,
          mintAuthority: signer.address,
          freezeAuthority: signer.address
        })
      ], msgWithliftime)

    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const sign = getSignatureFromTransaction(signedTx);

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`mint address - ${mint_keypair.address}`)


  } catch (error) {
    console.log(error);
  }

}

main()


