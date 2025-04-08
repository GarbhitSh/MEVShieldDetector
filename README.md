# MEVShieldDetector 
Detects high-gas swap transactions that may be part of MEV sandwich attacks on Ethereum.

## Overview
**MEVShieldDetector** is a custom detection agent for the Venn Network that identifies potentially malicious MEV (Miner Extractable Value) sandwich trades. These attacks exploit user transactions in decentralized exchanges (DEXs) by strategically inserting high-gas transactions before and after a victim’s trade.

By analyzing transaction patterns and gas usage in real-time, this detector flags suspicious high-gas swap transactions using known DEX function signatures (Uniswap, SushiSwap, etc.).

## Detection Focus
- **Sandwich Attacks**: Detects the front-running leg of MEV sandwiches based on gas price anomalies and swap patterns.
- **High-Gas Swaps**: Flags any swap transaction exceeding a set gas threshold (default: `50 Gwei`).
- **DEX Selector Matching**: Looks for common function selectors used in AMM DEXs.

## How It Works
The detector analyzes each incoming transaction:

1. **Validates** if the tx is a swap using common DEX method selectors.
2. **Calculates** the gas price in Gwei.
3. **Checks** if gas exceeds the predefined threshold.
4. **Emits an alert** if conditions match possible MEV behavior.

## Example Triggers
| Address        | Gas Price | Function Selector | Triggered |
|----------------|-----------|-------------------|-----------|
| 0xabc...def     | 80 Gwei   | `0x38ed1739` (swapExactTokensForTokens) | Yes |
| 0x123...456     | 30 Gwei   | `0x38ed1739` | No |
| 0xbad...cafe    | 90 Gwei   | `0x7ff36ab5` (swapExactETHForTokens) | Yes |

## Testing
Tested using Forta Agent testing suite with the following scenarios:
- Detect swap with high gas on known selectors
- Ignore low-gas or non-swap transactions
- Support for multiple DEX function types

## Project Structure
```bash
MEVShieldDetector/
├── src/
│   └── MEVShieldDetector.ts
├── test/
│   └── MEVShieldDetector.test.ts
├── README.md
└── submit_build.md
```
![Alt text](https://github.com/GarbhitSh/MEVShieldDetector/blob/main/dokh.png)

## Setup Instructions
```bash
git clone 
npm install
npm run agent:run
npm test
```

## Why This Matters
Sandwich attacks erode DeFi trust and cost users millions. This detector gives wallets and users a first line of defense by flagging suspicious behavior before it's too late.
