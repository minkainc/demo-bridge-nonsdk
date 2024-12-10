import crypto from 'crypto'
import * as ed25519 from '@noble/ed25519'
import stringify from 'safe-stable-stringify'

const HASHING_ALGORITHM = 'sha256'

export async function validateEntityProofs(record) {
  if (!record?.meta?.proofs) {
    throw new Error('This record has no proofs.') // error CryptoSignatureMissing
  }
  if (!record?.hash) {
    throw new Error('This record has no hash.') // error CryptoHashInvalid
  }
  try {
    for (const proof of record.meta.proofs) {
      const isValid = await verifySignature(record.hash, proof)

      if (!isValid) {
        throw new Error('This record has one or more invalid proofs.') //error CryptoSignatureInvalid
      }
    }
  } catch (error) {
    throw error; 
  }
}

async function verifySignature(hash, proof) {
  let digest;
  
  try {
    digest = createSignatureDigest(hash, proof.custom)
  if (proof.digest !== digest) {
      return false;
   }  
  } catch (error) {
    throw new Error(error)
  }

  if (proof.method !== 'ed25519-v2') {
    throw new Error(
      `Unsupported signature method, expected 'ed25519-v2', but got: '${proof.method}'`,
    )
  }

  return await ed25519.verify(Buffer.from(proof.result, 'base64'),digest,Buffer.from(proof.public, 'base64'));
}

function createSignatureDigest(hash, custom) {
  const serializedCustomData = custom ? stringify(custom) : ''
  return crypto
    .createHash(HASHING_ALGORITHM)
    .update(hash + serializedCustomData)
    .digest('hex')
}
