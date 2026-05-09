
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../wallet/wallet.json";
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from 'bs58';

const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplTokenMetadata())



async function generateNft() {

   const mint = generateSigner(umi);
   const tx = createNft(umi, {
      mint,
      name: "MR.COOL",
      symbol: "MRC",
      uri: "",
      sellerFeeBasisPoints: percentAmount(0)
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
