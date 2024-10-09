import stringify from 'safe-stable-stringify';
import crypto from 'node:crypto';
import axios from 'axios';
import { config } from './config.js'


// This function is used to notify Ledger of Entry processing final statuses.
export async function notifyLedger(entry, action, notifyStates) {
  const notifyAction = entry.actions[action]

  if (!notifyStates.includes(notifyAction.state)) {
    return
  }
  const custom = {
    moment: (new Date).toISOString(),
    handle: entry.handle,
    status: notifyAction.state,
    coreId: notifyAction.coreId,
    reason: notifyAction.error.reason,
    detail: notifyAction.error.detail,
    failId: notifyAction.error.failId,
  }
  
  const hash = createHash(entry.data.intent.data);
  const data = signHash(hash, custom, config.BRIDGE_PUBLIC, config.BRIDGE_PRIVATE);

  send(data, entry.data.intent.data.handle);

}


function createHash(data) {
  const serializedData = stringify(data)
  return crypto
    .createHash(config.HASHING_ALGORITHM)
    .update(serializedData)
    .digest('hex')
}

function createSignatureDigest(dataHash,signatureCustom) {
  // Serialize the custom data, if it exists
  const serializedCustomData = signatureCustom ?stringify(signatureCustom) :'';

  // Create a hash by concatenating the data hash
  // with serialized custom data
  return crypto
    .createHash(config.HASHING_ALGORITHM)
    .update(dataHash + serializedCustomData)
    .digest('hex');
}

function signHash(hash, custom, publicKey, secretKey) {
  const digest = createSignatureDigest(
    hash,
    custom
  )

  const digestBuffer = Buffer.from(digest, 'hex')
  const key = importPrivateKey(secretKey)

  const result = crypto.sign(undefined, digestBuffer, key).toString('base64')

  return {
    method: 'ed25519-v2',
    public: publicKey,
    digest,
    result,
    custom,
  }
}

/**
 * ASN1 prefix which precedes the private key in DER ASN.1 format.
 * Contains identifiers for Ed25519 together with meta bytes
 * for length and others.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8410
 * @see https://datatracker.ietf.org/doc/html/rfc5208
 * @see example https://lapo.it/asn1js/#MCowBQYDK2VwAyEAYNUhOe_8hqFet7VdDSO4372OFw0whAWJ8VAlPPXAPGY
 */
function importPrivateKey(secret) {
  const ASN1_PRIVATE_PREFIX = '302e020100300506032b657004220420'
  const keyHex = `${ASN1_PRIVATE_PREFIX}${Buffer.from(secret, 'base64').toString('hex')}`
  return crypto.createPrivateKey({
    format: 'der',
    type: 'pkcs8',
    key: Buffer.from(keyHex, 'hex'),
  })
}

function send(data, id){
  axios.post(`${config.LEDGER_SERVER}/intents/${id}/proofs`, data, {
    headers: {
      'x-ledger': config.LEDGER_HANDLE
    }
  }).then(res => {
    console.log(res.data)
  }).catch(err => {
    console.error(err.response.data)
  })
}