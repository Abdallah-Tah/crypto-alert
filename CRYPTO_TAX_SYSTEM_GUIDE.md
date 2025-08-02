# Cryptocurrency Transaction Management for Tax Reporting

## Overview

This system provides comprehensive cryptocurrency transaction management to generate accurate tax reports compliant with IRS requirements.

## What Data is Required for Tax Reporting?

Based on IRS guidelines and Form 8949 requirements, the following information is needed for each cryptocurrency transaction:

### For Buy Transactions (Establishing Cost Basis)

- **Date Acquired**: When you purchased the cryptocurrency
- **Cryptocurrency Symbol**: BTC, ETH, etc.
- **Quantity**: Amount of cryptocurrency purchased
- **Price Per Unit**: USD price when purchased
- **Fees**: Any transaction fees paid
- **Exchange**: Where the transaction occurred
- **Total Cost**: Quantity × Price + Fees = Your cost basis

### For Sell Transactions (Calculating Gains/Losses)

- **Date Sold**: When you sold the cryptocurrency
- **Cryptocurrency Symbol**: BTC, ETH, etc.
- **Quantity**: Amount of cryptocurrency sold
- **Sale Price Per Unit**: USD price when sold
- **Fees**: Any transaction fees paid
- **Exchange**: Where the transaction occurred
- **Total Proceeds**: (Quantity × Sale Price) - Fees

## Tax Calculations

### Realized Gains/Losses (Taxable)

- Only occurs when you actually SELL cryptocurrency
- **Gain/Loss = Proceeds - Cost Basis**
- **Short-term** (held ≤ 1 year): Taxed as ordinary income
- **Long-term** (held > 1 year): Preferential capital gains rates

### Unrealized Gains/Losses (Not Taxable)

- Current value vs. original purchase price
- Only becomes taxable when you sell
- Shown in portfolio but not reportable for taxes

## How the System Works

### 1. Transaction Management (`/transactions`)

- Add buy transactions to establish cost basis
- Add sell transactions to calculate realized gains/losses
- Import transactions via CSV upload
- Edit/delete transactions as needed

### 2. Tax Report Generation (`/tax-report`)

- Uses FIFO (First In, First Out) method for cost basis
- Calculates short-term vs. long-term gains/losses
- Generates Form 8949 compatible data
- Provides tax optimization suggestions

### 3. Key Features

- **FIFO Calculation**: Automatically matches sales to oldest purchases
- **Holding Period**: Determines short-term vs. long-term treatment
- **Fee Tracking**: Includes transaction fees in cost basis and proceeds
- **CSV Export**: Download data for tax preparation software
- **Bulk Import**: Upload transaction history from exchanges

## Example Scenario

### Transaction History

1. **Buy**: 1 BTC @ $40,000 on Jan 1, 2024 (+ $50 fees)
2. **Buy**: 1 BTC @ $50,000 on Mar 1, 2024 (+ $50 fees)  
3. **Sell**: 0.5 BTC @ $60,000 on Dec 1, 2024 (- $30 fees)

### Tax Calculation Process

- **Sale proceeds**: (0.5 × $60,000) - $30 = $29,970
- **Cost basis** (FIFO): (0.5 × $40,000) + $25 = $20,025
- **Gain**: $29,970 - $20,025 = $9,945 (Long-term)

### Reports Show

- **Realized Gains**: $9,945 (taxable)
- **Unrealized Gains**: Current value of remaining 1.5 BTC (not taxable)

## Best Practices

1. **Enter All Transactions**: Both buys and sells are needed for accuracy
2. **Include Exact Dates**: Determines short vs. long-term treatment
3. **Track All Fees**: Affects your cost basis and tax liability
4. **Use Actual Prices**: Don't estimate - use exact transaction prices
5. **Keep Records**: Save exchange confirmations as backup

## CSV Import Format

The system accepts CSV files with these columns:

```text
Date (YYYY-MM-DD), Type (buy/sell), Symbol (BTC), Quantity, Price Per Unit (USD), Fees (USD), Exchange, Notes
```

Example:

```csv
2024-01-15,buy,BTC,0.5,42000,50,Coinbase,Initial Bitcoin purchase
2024-06-20,sell,BTC,0.25,65000,40,Coinbase,Partial Bitcoin sale
```

## Compliance Notes

- This system follows IRS guidance for virtual currency taxation
- Calculations use FIFO method (required unless specific identification is used)
- Reports distinguish between short-term and long-term capital gains
- Data can be exported for use with tax preparation software

## Getting Started

1. Navigate to **Transactions** in the main menu
2. Add your cryptocurrency buy transactions first
3. Add any sell transactions you've made
4. Generate a tax report to see your realized gains/losses
5. Use the data for your tax filing or give to your tax professional

The system will automatically calculate your tax liability and provide optimization suggestions for future trades.
