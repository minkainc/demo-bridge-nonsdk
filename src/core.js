export class CoreError extends Error {
    constructor(message) {
      super(message)
      this.name = 'CoreError'
      this.code = '100'
    }
  }
  
  export class InsufficientBalanceError extends CoreError {
    constructor(message) {
      super(message)
      this.name = 'InsufficientBalanceError'
      this.code = '101'
    }
  }
  
  export class InactiveAccountError extends CoreError {
    constructor(message) {
      super(message)
      this.name = 'InactiveAccountError'
      this.code = '102'
    }
  }
  
  export class UnknownAccountError extends CoreError {
    constructor(message) {
      super(message)
      this.name = 'UnknownAccountError'
      this.code = '103'
    }
  }
  
  export class Account {
    constructor(id, active = true) {
      this.id = id
      this.active = active
      this.balance = 0
      this.onHold = 0
    }
  
    debit(amount) {
      this.assertIsActive()
      if (this.getAvailableBalance() < amount) {
        throw new InsufficientBalanceError(
          `Insufficient available balance in account ${this.id}. Current balance: ${this.getAvailableBalance()}`,
        )
      }
  
      this.balance = this.balance - amount
    }
  
    credit(amount) {
      this.assertIsActive()
  
      this.balance = this.balance + amount
    }
  
    hold(amount) {
      this.assertIsActive()
  
      if (this.getAvailableBalance() < amount) {
        throw new InsufficientBalanceError(
          `Insufficient available balance in account ${this.id}.  Current balance: ${this.getAvailableBalance()}`,
        )
      }
  
      this.onHold = this.onHold + amount
    }
  
    release(amount) {
      this.assertIsActive()
  
      if (this.onHold < amount) {
        throw new InsufficientBalanceError(
          `Insufficient balance on hold in account ${this.id}`,
        )
      }
  
      this.onHold = this.onHold - amount
    }
  
    getOnHold() {
      return this.onHold
    }
  
    getBalance() {
      return this.balance
    }
  
    getAvailableBalance() {
      return 500//this.balance - this.onHold
    }
  
    isActive() {
      return this.active
    }
  
    assertIsActive() {
      if (!this.active) {
        throw new InactiveAccountError(`Account ${this.id} is inactive`)
      }
    }
  
    setActive(active) {
      this.active = active
    }
  }
  
  export class Transaction {
    constructor({ id, type, account, amount, status, idempotencyToken }) {
      this.id = id
      this.type = type
      this.account = account
      this.amount = amount
      this.status = status
      this.errorReason = undefined
      this.errorCode = undefined
      this.idempotencyToken = idempotencyToken
    }
  }
  
  export class Ledger {
    accounts = new Map()
    transactions = []
  
    constructor() {
      // account with no balance
      this.accounts.set(1, new Account(1))
  
      // account with available balance 70
      this.accounts.set(424242, new Account(424242))
      this.debit(424242, 1000000)
      
  
      // account with no available balance 0
      this.accounts.set(3, new Account(3))
      this.credit(3, 300)
      this.debit(3, 200)
      this.hold(3, 100)
  
      // inactive account
      this.accounts.set(4, new Account(4))
      this.credit(4, 200)
      this.debit(4, 20)
      this.inactivate(4)
    }
  
    getAccount(accountId) {
      let account = this.accounts.get(accountId)
      if (!account) {
        throw new UnknownAccountError(`Account ${accountId} does not exist`)
      }
      return account
    }
  
    processTransaction(type, accountId, amount, idempotencyToken) {
      if (idempotencyToken) {
        const existing = this.transactions.filter(
          (t) => t.idempotencyToken === idempotencyToken,
        )[0]
        if (existing) {
          return existing
        }
      }
  
      let nextTransactionId = this.transactions.length
      let transaction = new Transaction({
        id: nextTransactionId,
        type,
        account: accountId,
        amount,
        status: 'PENDING',
        idempotencyToken,
      })
      this.transactions[nextTransactionId] = transaction
      try {
        let account = this.getAccount(accountId)
        switch (type) {
          case 'CREDIT':
            account.credit(amount)
            break
          case 'DEBIT':
            account.debit(amount)
            break
          case 'HOLD':
            account.hold(amount)
            break
          case 'RELEASE':
            account.release(amount)
            break
        }
      } catch (error) {
        transaction.errorReason = error.message
        transaction.errorCode = error.code
        transaction.status = 'FAILED'
        return transaction
      }
      transaction.status = 'COMPLETED'
      return transaction
    }
  
    credit(accountId, amount, idempotencyToken) {
      return this.processTransaction(
        'CREDIT',
        accountId,
        amount,
        idempotencyToken,
      )
    }
  
    debit(accountId, amount, idempotencyToken) {
      return this.processTransaction('DEBIT', accountId, amount, idempotencyToken)
    }
  
    hold(accountId, amount, idempotencyToken) {
      return this.processTransaction('HOLD', accountId, amount, idempotencyToken)
    }
  
    release(accountId, amount, idempotencyToken) {
      return this.processTransaction(
        'RELEASE',
        accountId,
        amount,
        idempotencyToken,
      )
    }
  
    activate(accountId) {
      return this.getAccount(accountId).setActive(true)
    }
  
    inactivate(accountId) {
      return this.getAccount(accountId).setActive(false)
    }
  
    printAccountTransactions(accountId) {
      console.log(
        `Id\t\tType\t\tAccount\t\tAmount\t\tStatus\t\t\tError Reason\t\tIdempotency Token`,
      )
      this.transactions
        .filter((t) => t.account === accountId)
        .forEach((t) =>
          console.log(
            `${t.id}\t\t${t.type}\t\t${t.account}\t\t${t.amount}\t\t${
              t.status
            }\t\t${t.errorReason || '-'}\t\t${t.idempotencyToken || '-'}`,
          ),
        )
    }
  
    printAccount(accountId) {
      let account = this.getAccount(accountId)
      console.log(
        JSON.stringify(
          {
            ...account,
            balance: account.getBalance(),
            availableBalance: account.getAvailableBalance(),
          },
          null,
          2,
        ),
      )
    }
  }
  
  const ledger = new Ledger()
  
  export default ledger