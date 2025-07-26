<?php

// Demo script showing how easy it is for users to enter their holdings
// Based on the example: 1.103112 ETH worth $4,097.79 with avg cost $2,802.61

require_once 'vendor/autoload.php';

use App\Services\WatchlistService;
use App\Services\CCXTService;

echo "=== Crypto Holdings Input Demo ===\n\n";

// Simulate current ETH price
$currentETHPrice = 3714.75; // From the screenshot
echo "Current ETH Price: $" . number_format($currentETHPrice, 2) . "\n\n";

// Example 1: User enters USD value (like $4,097.79)
echo "📱 EXAMPLE 1: User enters USD Investment Amount\n";
echo "User says: 'I have $4,097.79 worth of ETH'\n";
echo "App automatically calculates:\n";

$usdValue = 4097.79;
$coinQuantity = $usdValue / $currentETHPrice;

echo "• Investment Amount: $" . number_format($usdValue, 2) . "\n";
echo "• Coin Quantity: " . number_format($coinQuantity, 8) . " ETH\n";
echo "• Current Value: $" . number_format($coinQuantity * $currentETHPrice, 2) . "\n\n";

// Example 2: User enters coin quantity (like 1.103112 ETH)
echo "📱 EXAMPLE 2: User enters Coin Quantity\n";
echo "User says: 'I own 1.103112 ETH'\n";
echo "App automatically calculates:\n";

$coinQuantity2 = 1.103112;
$usdValue2 = $coinQuantity2 * $currentETHPrice;

echo "• Coin Quantity: " . number_format($coinQuantity2, 8) . " ETH\n";
echo "• Investment Value: $" . number_format($usdValue2, 2) . "\n";
echo "• Current Value: $" . number_format($usdValue2, 2) . "\n\n";

// Example 3: Profit/Loss calculation with average cost
echo "📱 EXAMPLE 3: Profit/Loss with Average Cost\n";
echo "User also enters average purchase price: $2,802.61\n";

$avgCost = 2802.61;
$purchaseValue = $coinQuantity2 * $avgCost;
$profitLoss = $usdValue2 - $purchaseValue;
$profitLossPercent = (($profitLoss / $purchaseValue) * 100);

echo "• Coin Quantity: " . number_format($coinQuantity2, 8) . " ETH\n";
echo "• Average Cost: $" . number_format($avgCost, 2) . " per ETH\n";
echo "• Purchase Value: $" . number_format($purchaseValue, 2) . "\n";
echo "• Current Value: $" . number_format($usdValue2, 2) . "\n";
echo "• Profit/Loss: $" . number_format($profitLoss, 2) . " (" . number_format($profitLossPercent, 2) . "%)\n\n";

echo "✅ BENEFITS:\n";
echo "• Users can enter holdings in the most natural way\n";
echo "• Automatic conversion between USD and coin quantity\n";
echo "• Real-time profit/loss calculations\n";
echo "• Clear examples and guidance\n";
echo "• Supports both investment tracking methods\n\n";

echo "🎯 PERFECT FOR:\n";
echo "• DCA investors who track dollar amounts\n";
echo "• Traders who know exact coin quantities\n";
echo "• Portfolio tracking from exchanges\n";
echo "• Tax reporting and analytics\n";
