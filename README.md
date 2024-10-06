# BlockCash: NFC-Enabled Ethereum Transactions

BlockCash is a React Native mobile application that enables Ethereum transactions using NFC technology. This project was developed for the EthKL hackathon, showcasing innovative ways to interact with blockchain technology.

## Features

- Connect to Ethereum wallets using WalletConnect
- Lock ETH into a smart contract
- Write transaction hashes to NFC tags
- Scan NFC tags to claim locked ETH
- View transaction history

## Technology Stack

- React Native
- Ethers.js
- WalletConnect
- React Native NFC Manager

## Smart Contracts

The project uses smart contracts deployed on two testnets:

- Scroll Testnet: [0x29Dc9A21190D63A8f2505B27a67b268377a0ed4c](https://sepolia.scrollscan.com/address/0x29Dc9A21190D63A8f2505B27a67b268377a0ed4c#code)
- Manta Testnet: [0x7d1E59d09729ab9E90330718f53212b8F184d5fB](https://pacific-explorer.sepolia-testnet.manta.network/address/0x12D7a9f11070ecAd0a39238887AF880703eB0919?tab=contract)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Start the Metro bundler:
   ```
   yarn start
   ```
4. Run the app on Android or iOS:
   ```
   yarn android
   # or
   yarn ios
   ```

## How It Works

1. Users connect their Ethereum wallet using WalletConnect.
2. They can lock ETH into the smart contract, which generates a transaction hash.
3. This hash can be written to an NFC tag.
4. Another user can scan the NFC tag to claim the locked ETH.
5. The app provides a history of transactions for transparency.

## Project Structure

- `App.js`: Main application component and navigation setup
- `pages/`: Contains individual screen components
- `components/`: Reusable UI components
- `contract/`: Smart contract ABI and related files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
