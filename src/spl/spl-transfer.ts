import { address, appendTransactionMessageInstruction, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, getChannelPoolingChannelCreator, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayer, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";
import wallet from "../../wallet/wallet.json";
import { findAssociatedTokenPda, getCreateAssociatedTokenInstructionAsync, getTransferCheckedInstruction, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

const mintAdress = address("7asmqSQQVhydjZYDAWJm2mNpEvVYt7e2cpJ6v5gPV2y7")

async function sendToken() {   
   const rpc = createSolanaRpc("https://api.devnet.solana.com");
   const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

   const to = address("29Lh9sr5Q6baHvtCbXTRZS2nWit5zTMS81UeiuqBn5pM");

   const uint8keypair = new Uint8Array(wallet);
   const signer = await createKeyPairSignerFromBytes(uint8keypair);

   const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc, rpcSubscriptions
   });

   const [fromAta] = await findAssociatedTokenPda({
      mint: mintAdress,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS
   })

   console.log('from =' ,fromAta);
   
   const [toAta] = await findAssociatedTokenPda({
      mint: mintAdress,
      owner: to,
      tokenProgram: TOKEN_PROGRAM_ADDRESS
   })

   console.log('to =', toAta);

   const createAtaTx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      mint: mintAdress,
      owner: to
   })

   const trxTx = getTransferCheckedInstruction({
      source: fromAta,
      mint: mintAdress,
      destination: toAta,
      authority: signer,
      amount: 1 * 10 ** 9,
      decimals: 9
   })
   
   const {value:latestBlockhash} = await rpc.getLatestBlockhash().send();

   const msg = createTransactionMessage({version:0});

   const msgWithPayer = setTransactionMessageFeePayerSigner(signer,msg);

   const msgWithLife = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, msgWithPayer);

   const txMsg = appendTransactionMessageInstructions(
      [createAtaTx, trxTx],
      msgWithLife
   );

   const signedTx = await signTransactionMessageWithSigners(txMsg);

   assertIsTransactionWithBlockhashLifetime(signedTx);

   await sendAndConfirm(signedTx, { commitment: "confirmed" });
   
   console.log('done done done done done');

}


try {
   sendToken();
} catch(error) {
   console.log(error);
   
}
