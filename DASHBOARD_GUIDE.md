# Crypto Alert Dashboard & Watchlist Guide

## Overview
The Crypto Alert Dashboard provides real-time cryptocurrency portfolio tracking, price alerts, and analytics to help you monitor your crypto investments. This guide covers how to use the watchlist feature and navigate the dashboard effectively.

## Table of Contents
- [Dashboard Overview](#dashboard-overview)
- [Watchlist Management](#watchlist-management)
- [Portfolio Allocation Chart](#portfolio-allocation-chart)
- [Price Alerts](#price-alerts)
- [Real-time Updates](#real-time-updates)
- [Understanding Price Sources](#understanding-price-sources)
- [Troubleshooting](#troubleshooting)

---

## Dashboard Overview

### Main Dashboard Features
The dashboard displays your cryptocurrency portfolio with the following key components:

1. **Portfolio Summary**
   - Total portfolio value in USD
   - 24-hour profit/loss
   - Percentage change
   - Initial investment amount

2. **Portfolio Allocation Chart**
   - Visual pie chart showing distribution of your holdings
   - Hover for detailed information about each coin
   - Real-time value updates

3. **Watchlist Table**
   - All your tracked cryptocurrencies
   - Current prices and 24-hour changes
   - Holdings amounts and values
   - Alert status indicators

4. **Top Performers**
   - Biggest gainers in your portfolio
   - Biggest losers (if any)
   - Sorted by 24-hour performance

---

## Watchlist Management

### Adding Cryptocurrencies to Watchlist

1. **Navigate to Watchlist**
   - Go to the "Watchlist" section in your dashboard
   - Click "Add to Watchlist" or "+" button

2. **Enter Coin Details**
   ```
   Symbol: BTC/USDT, ETH/USDT, DOGE/USDT, etc.
   Holdings Type: Choose between:
   - coin_quantity: Enter actual number of coins you own
   - usd_value: Enter USD value of your investment
   ```

3. **Holdings Types Explained**

   **Option A: Coin Quantity (Recommended)**
   ```
   Holdings Type: coin_quantity
   Holdings Amount: 1.103112 (actual coins owned)
   Example: If you own 1.103112 ETH
   Calculation: 1.103112 × Current ETH Price = Portfolio Value
   ```

   **Option B: USD Value**
   ```
   Holdings Type: usd_value
   Holdings Amount: 1000 (USD invested)
   Purchase Price: 3500 (price when you bought)
   Example: $1000 invested when ETH was $3500
   Calculation: (1000 ÷ 3500) × Current ETH Price = Portfolio Value
   ```

4. **Set Price Alerts**
   ```
   Alert Price: 4000 (USD)
   Alert Type: market_price
   Notes: Optional notes about this holding
   ```

### Managing Existing Watchlist Items

1. **Edit Holdings**
   - Click the edit icon next to any coin
   - Update holdings amount, alert price, or notes
   - Save changes

2. **Enable/Disable Alerts**
   - Toggle alerts on/off for each coin
   - Disabled alerts won't send notifications

3. **Remove from Watchlist**
   - Click the delete icon to remove a coin
   - Confirm deletion when prompted

---

## Portfolio Allocation Chart

### Understanding the Chart

The portfolio allocation chart provides visual representation of your crypto holdings:

1. **Pie Chart Sections**
   - Each section represents one cryptocurrency
   - Size indicates relative value in your portfolio
   - Colors are automatically assigned

2. **Hover Information**
   - Coin name and symbol
   - Current price
   - Your holdings amount
   - Total value in USD
   - Percentage of total portfolio

3. **Real-time Updates**
   - Updates automatically as prices change
   - Uses Laravel Reverb for live data
   - No page refresh needed

### Example Interpretation
```
Portfolio Total: $8,436.07

ETH: $4,211.37 (49.9% of portfolio)
- Holdings: 1.103112 ETH
- Current Price: $3,817.72

BTC: $3,553.33 (42.2% of portfolio)
- Holdings: 0.02986411 BTC  
- Current Price: $118,983.30

DOGE: $425.94 (5.1% of portfolio)
- Holdings: 1,792.13 DOGE
- Current Price: $0.23767

ETC: $245.43 (2.9% of portfolio)
- Holdings: 10.699535 ETC
- Current Price: $22.9381
```

---

## Price Alerts

### Setting Up Alerts

1. **Alert Types**
   - **market_price**: Alert when coin reaches a specific USD price
   - **percentage_change**: Alert on percentage gains/losses (future feature)

2. **Alert Configuration**
   ```
   Symbol: BTC/USDT
   Alert Price: $120,000
   Alert Type: market_price
   Enabled: ✓
   ```

3. **Notification Methods**
   - Dashboard notifications
   - Browser notifications (if enabled)
   - Email alerts (configured in settings)

### Managing Alerts

1. **View Active Alerts**
   - Check the "Alerts" column in your watchlist
   - Green = Active, Gray = Disabled

2. **Modify Alert Prices**
   - Edit any watchlist item to change alert price
   - Alerts trigger immediately when conditions are met

3. **Alert History**
   - View triggered alerts in the notifications section
   - Mark alerts as read/unread

---

## Real-time Updates

### How Real-time Updates Work

The dashboard uses **Laravel Reverb** for real-time price updates:

1. **Automatic Updates**
   - Prices update every 30 seconds
   - No manual refresh required
   - Portfolio values recalculate automatically

2. **Price Sources**
   - Primary: KuCoin API
   - Fallback: CoinGecko API
   - Updates cached for performance

3. **Connection Status**
   - Green indicator = Connected to live updates
   - Red indicator = Connection lost (check internet)

### Manual Refresh
If you need to force a price update:
- Click the refresh icon in the dashboard
- Or wait for the next automatic update cycle

---

## Understanding Price Sources

### Why Prices May Differ from Other Platforms

Your dashboard may show slightly different values compared to Robinhood, Coinbase, or other platforms:

1. **Different Price Sources**
   ```
   Your Dashboard: KuCoin → CoinGecko
   Robinhood: Various institutional feeds
   Coinbase: Coinbase Pro exchange rates
   ```

2. **Normal Price Variations**
   - 0.5% - 2% differences are normal
   - Exchanges have different liquidity
   - Timing differences in price updates

3. **Example Comparison**
   ```
   Your Dashboard: $8,436.07
   Robinhood: $8,505.46
   Difference: $69.39 (0.8%)
   Status: ✅ Normal variation
   ```

### Improving Price Accuracy

1. **Multiple Source Comparison**
   - Visit `/debug/price-comparison` to see different sources
   - Compare KuCoin, CoinGecko, and Coinbase prices

2. **Price Source Selection** (Future Feature)
   - Choose preferred price source
   - Coinbase typically closer to Robinhood prices

---

## Troubleshooting

### Common Issues

1. **Portfolio Value Seems Wrong**
   ```
   Check:
   ✓ Holdings type (coin_quantity vs usd_value)
   ✓ Holdings amount entered correctly
   ✓ Purchase price (if using usd_value type)
   
   Debug:
   - Visit /debug/portfolio for detailed calculations
   - Verify your coin quantities match actual holdings
   ```

2. **Prices Not Updating**
   ```
   Solutions:
   ✓ Check internet connection
   ✓ Refresh the page
   ✓ Check browser console for errors
   ✓ Verify Laravel Reverb is running
   ```

3. **Alerts Not Working**
   ```
   Check:
   ✓ Alert is enabled in watchlist
   ✓ Alert price is reasonable (not already passed)
   ✓ Browser notifications are allowed
   ✓ Email settings are configured
   ```

4. **Chart Not Displaying**
   ```
   Solutions:
   ✓ Ensure you have holdings with value > 0
   ✓ Check browser JavaScript console
   ✓ Refresh the page
   ✓ Clear browser cache
   ```

### Debug Tools

1. **Portfolio Debug**
   - URL: `/debug/portfolio`
   - Shows detailed calculation breakdown
   - Compares expected vs actual values

2. **Price Debug**
   - URL: `/debug/price?symbol=BTC/USDT`
   - Shows current price for specific coin
   - Includes price source and timestamp

3. **Price Comparison**
   - URL: `/debug/price-comparison`
   - Compares prices across multiple exchanges
   - Helps identify price source accuracy

---

## Best Practices

### Portfolio Management

1. **Use Coin Quantity Method**
   ```
   ✅ Recommended: holdings_type = "coin_quantity"
   - More accurate for long-term tracking
   - Automatically adjusts to market prices
   - Easier to understand and verify
   ```

2. **Regular Updates**
   - Update holdings when you buy/sell coins
   - Adjust alert prices based on market conditions
   - Review portfolio allocation monthly

3. **Alert Strategy**
   ```
   Conservative: Set alerts 10-15% above current price
   Aggressive: Set alerts 20-30% above current price
   Stop-loss: Set alerts 10-20% below current price
   ```

### Security

1. **Never Share Holdings Data**
   - Your portfolio values are private
   - Don't screenshot sensitive information
   - Keep login credentials secure

2. **Regular Monitoring**
   - Check dashboard daily for price movements
   - Monitor alert notifications
   - Review suspicious activity

---

## Example Walkthrough

### Setting Up Your First Watchlist Item

1. **Add Bitcoin to Watchlist**
   ```
   Symbol: BTC/USDT
   Holdings Type: coin_quantity
   Holdings Amount: 0.02986411
   Alert Price: 120000
   Alert Type: market_price
   Notes: "Main BTC holding"
   Enabled: ✓
   ```

2. **Result**
   - Coin appears in watchlist table
   - Current value calculated automatically
   - Alert will trigger if BTC hits $120,000
   - Portfolio chart updates to include BTC

3. **Monitor Progress**
   - Watch real-time price updates
   - Check portfolio allocation changes
   - Receive notifications when alert triggers

---

## Support

If you encounter issues not covered in this guide:

1. **Check Debug Tools**
   - Use the debug endpoints mentioned above
   - Look for error messages in browser console

2. **Common Solutions**
   - Clear browser cache and cookies
   - Disable browser extensions temporarily
   - Try incognito/private browsing mode

3. **Report Issues**
   - Document the exact error message
   - Include steps to reproduce the problem
   - Note your browser and operating system

---

*Last Updated: July 27, 2025*
