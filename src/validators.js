// Populate this with the wallet handle you created
const BANK_WALLET = 'paula.bank'
const SCHEMA_DEF = 'svgs'

// Factor for usd is 100
const USD_FACTOR = 100

// Address regex used for validation and component extraction
const ADDRESS_REGEX =
  /^(((?<schema>[a-zA-Z0-9_\-+.]+):)?(?<handle>[a-zA-Z0-9_\-+.]+))(@(?<parent>[a-zA-Z0-9_\-+.]+))?$/

export function validateEntity(entity, signer) {}

export function extractAndValidateAddress(address) {
  const result = ADDRESS_REGEX.exec(address)
  if (!result) {
    throw new Error(`Invalid address, got ${address}`)
  }
  const { schema, handle: account, parent } = result.groups

  if (parent !== BANK_WALLET) {
    throw new Error(
      `Expected address parent to be ${BANK_WALLET}, got ${parent}`,
    )
  }
  if (schema !== SCHEMA_DEF) {
    throw new Error(`Expected address schema to be ${SCHEMA_DEF}, got ${schema}`)
  }
  if (!account || account.length === 0) {
    throw new Error('Account missing from credit request')
  }

  return {
    schema,
    account,
    parent,
  }
}

export function extractAndValidateAmount(rawAmount) {
  const amount = Number(rawAmount)
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`Positive integer amount expected, got ${amount}`)
  }
  return amount / USD_FACTOR
}

export function extractAndValidateSymbol(symbol) {
  // In general symbols other than usd are possible, but
  // we only support usd in the tutorial
  if (symbol !== 'usd') {
    throw new Error(`Symbol usd expected, got ${symbol}`)
  }
  return symbol
}

export function validateAction(action, expected) {
  if (action !== expected) {
    throw new Error(`Action ${expected} expected, got ${action}`)
  }
}

export function validateSchema(schema, expected) {
  if (schema !== expected) {
    throw new Error(`Schema ${expected} expected, got ${schema}`)
  }
}

export function extractAndValidateData({ entry, schema }) {
  const data = entry?.data

  validateSchema(data?.schema, schema)

  const rawAddress = data?.schema === 'credit' ? data.target.handle : data.source.handle
  const address = extractAndValidateAddress(rawAddress)
  const amount = extractAndValidateAmount(data.amount)
  const symbol = extractAndValidateSymbol(data.symbol.handle)

  return {
    address,
    amount,
    symbol,
  }
}