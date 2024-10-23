# @bridge

## Description
@bridge is a project that acts as a bridge between different systems, facilitating the management of credits and debits through an API.

## Project Structure
The project is organized as follows:

- `src/`: Contains the main source code
  - `handlers/`: Handlers for credits and debits
  - `middleware/`: Middleware for error handling and logging
  - `core.js`: Core functionalities of the project
  - `index.js`: Entry point of the application
  - `ledger.js`: Configuration and functions related to the ledger

## Requirements
- Node.js (recommended version: 14.x or higher)
- npm (usually comes with Node.js)

## Installation
1. Clone this repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies

## Database
The `db` folder contains a yaml file with the database configuration required by the service. Install Docker (https://docs.docker.com/get-docker/) and run the following command in the folder:

```bash
docker compose up
```

## Configuration
You must configure the necessary environment variables before running the application. Update the `config.js` file in the project root with the following variables:

```
export const config = {
    LEDGER_SERVER: [URL of the server where the ledger resides]
    LEDGER_HANDLE: [Name of the ledger instance]
    LEDGER_PUBLIC: [Public key of the ledger]
    BRIDGE_PUBLIC: [Public key of the bridge you are configuring]
    BRIDGE_PRIVATE: [Private key of the bridge you are configuring]
    FORMAT: 'ed25519-raw',
    HASHING_ALGORITHM: 'sha256'
}
```

To obtain the public key of the ledger, run:
```bash
minka signer show system
```
If you used the CLI to generate the public and private keys of the bridge, you can use the following command to obtain the information:
```bash
minka signer show [signer] -s
```

## Business Rules
The `validators.js` file contains the account name (wallet) and its schema. You should update this information with your account configuration. For example, the code is configured to validate information for:

```bash
const BANK_WALLET = 'test.bank'
const SCHEMA_DEF = 'svgs'
```
This means that a transfer from or to `tel:312330@test.bank` will not work
