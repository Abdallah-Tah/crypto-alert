<?php

require_once 'vendor/autoload.php';

// Test the portfolio value calculation logic
function testPortfolioCalculations()
{
    echo "Testing Portfolio Value Calculations\n";
    echo "===================================\n\n";

    // Test case 1: USD Value input
    echo "Test Case 1: Holdings entered as USD value\n";
    $holdingsAmount = 4119; // $4119 USD
    $holdingsType = 'usd_value';
    $currentPrice = 95000; // BTC current price

    if ($holdingsType === 'usd_value') {
        $portfolioValue = $holdingsAmount;
        $coinQuantity = $holdingsAmount / $currentPrice;
    } else {
        $portfolioValue = $holdingsAmount * $currentPrice;
        $coinQuantity = $holdingsAmount;
    }

    echo "Holdings Amount: $" . number_format($holdingsAmount, 2) . "\n";
    echo "Holdings Type: {$holdingsType}\n";
    echo "Current BTC Price: $" . number_format($currentPrice, 2) . "\n";
    echo "Calculated Coin Quantity: " . number_format($coinQuantity, 8) . " BTC\n";
    echo "Portfolio Value: $" . number_format($portfolioValue, 2) . "\n\n";

    // Test case 2: Coin Quantity input
    echo "Test Case 2: Holdings entered as coin quantity\n";
    $holdingsAmount = 0.5; // 0.5 BTC
    $holdingsType = 'coin_quantity';

    if ($holdingsType === 'usd_value') {
        $portfolioValue = $holdingsAmount;
        $coinQuantity = $holdingsAmount / $currentPrice;
    } else {
        $portfolioValue = $holdingsAmount * $currentPrice;
        $coinQuantity = $holdingsAmount;
    }

    echo "Holdings Amount: " . $holdingsAmount . " BTC\n";
    echo "Holdings Type: {$holdingsType}\n";
    echo "Current BTC Price: $" . number_format($currentPrice, 2) . "\n";
    echo "Calculated Coin Quantity: " . number_format($coinQuantity, 8) . " BTC\n";
    echo "Portfolio Value: $" . number_format($portfolioValue, 2) . "\n\n";

    // Test case 3: Profit/Loss calculation with USD input
    echo "Test Case 3: Profit/Loss with USD investment\n";
    $holdingsAmount = 4119; // $4119 USD invested
    $holdingsType = 'usd_value';
    $purchasePrice = 85000; // BTC was $85,000 when purchased
    $currentPrice = 95000; // BTC is now $95,000

    // Calculate coin quantity based on initial investment
    $coinQuantity = $holdingsAmount / $purchasePrice;
    $currentValue = $coinQuantity * $currentPrice;
    $initialInvestment = $holdingsAmount;
    $profitLoss = $currentValue - $initialInvestment;

    echo "Initial Investment: $" . number_format($initialInvestment, 2) . "\n";
    echo "Purchase Price: $" . number_format($purchasePrice, 2) . "\n";
    echo "Current Price: $" . number_format($currentPrice, 2) . "\n";
    echo "Coin Quantity: " . number_format($coinQuantity, 8) . " BTC\n";
    echo "Current Value: $" . number_format($currentValue, 2) . "\n";
    echo "Profit/Loss: $" . number_format($profitLoss, 2) . " (" . number_format(($profitLoss / $initialInvestment) * 100, 2) . "%)\n";
}

testPortfolioCalculations();
