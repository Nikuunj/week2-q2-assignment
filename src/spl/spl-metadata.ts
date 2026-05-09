
import wallet from "../../wallet/wallet.json";
import { readFile } from 'fs/promises';
import { createGenericFile, createSignerFromKeypair, publicKey, signerIdentity, type PublicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3, type CreateMetadataAccountV3InstructionAccounts, type CreateMetadataAccountV3InstructionArgs, type DataV2Args } from "@metaplex-foundation/mpl-token-metadata";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import bs58 from 'bs58';

const mintAddress = publicKey("7asmqSQQVhydjZYDAWJm2mNpEvVYt7e2cpJ6v5gPV2y7");

const uInt8Array = new Uint8Array(wallet);

const umi = createUmi("https://api.devnet.solana.com");


const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader())
umi.use(signerIdentity(signer));

async function attachMetadata(mintAddress: PublicKey) {

  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    mint: mintAddress,
    mintAuthority: signer
  }

  

  const imageUri = await uploadImage();
  const uri = await umi.uploader.uploadJson({
    name: "Mr.cool",
    description: "coolest teacher",
    image: imageUri
  })
  const data: DataV2Args = {
    name: "Mr.Cool",
    symbol: "MRC",
    uri,
    creators: null,
    collection: null,
    uses: null,
    sellerFeeBasisPoints: 500
  }

  const  args: CreateMetadataAccountV3InstructionArgs = {
    data,
    isMutable: true,
    collectionDetails: null
  }

  const tx = createMetadataAccountV3(umi, {
    ...accounts,
    ...args
  });

  const results = await tx.sendAndConfirm(umi);

  console.log("result --- ", bs58.encode(Buffer.from(results.signature)));
}


async function uploadImage(): Promise<String> {
  const image = await readFile('./asserts/mrcool.png')

  const file = createGenericFile(image, "generug.png", {
    contentType: "image/png" 
  });
  
  const myUri = await umi.uploader.upload([file]);
  console.log("Your image URI: ", myUri);
  return myUri[0] || "";
}

try {
  attachMetadata(mintAddress)

} catch (error) {

  console.log(error)

}
