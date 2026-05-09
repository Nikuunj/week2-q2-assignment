
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../wallet/wallet.json";
import { createSignerFromKeypair, generateSigner, signerIdentity } from "@metaplex-foundation/umi";
import bs58 from 'bs58';
import { create, mplCore } from "@metaplex-foundation/mpl-core";

const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore())



async function generateNft() {

   const mint = generateSigner(umi);

   const tx = create(umi, {
      asset: mint,
      name: "MR.COOL",
      uri: "https://gateway.irys.xyz/AxxsjMrDFRe4juTd2UUFiTvNUrXdMigK8XyCfYtH77cj",
   })

   const result = await tx.sendAndConfirm(umi);

   const signature = bs58.encode(result.signature);

   console.log("done done done done");

   console.log("nft - ", mint.publicKey);
}

try {
   generateNft();
} catch (e) {
   console.log(e);
}
