
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../wallet/wallet.json";
import { createSignerFromKeypair, generateSigner, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import bs58 from 'bs58';
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { uploadImage } from "../spl/spl-metadata";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";



/// need to be fix it

const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(mplCore())
umi.use(irysUploader())

const mintAddress = publicKey("GJuZ62ksddwccLqzWVVQnWdh1oz7rwkFWsu3PAtegEyi")
const asset = await fetchAsset(umi, mintAddress)

async function updateNftttt() {

   const imageUri = await uploadImage();
   const uri = await umi.uploader.uploadJson({
      name: "Mr.cool",
      description: "coolest teacher",
      image: imageUri
   })
   
   const tx = update(umi, {
      payer: signer,
      asset,
      uri
   })

   const result = await tx.sendAndConfirm(umi);

   const signature = bs58.encode(result.signature);

   console.log("done done done done");

   console.log(signature);
}

try {
   updateNft();
} catch (e) {
   console.log(e);
}
