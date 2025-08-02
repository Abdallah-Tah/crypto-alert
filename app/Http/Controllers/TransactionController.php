<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\CCXTService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Carbon\Carbon;

class TransactionController extends Controller
{
    private CCXTService $ccxtService;

    public function __construct(CCXTService $ccxtService)
    {
        $this->ccxtService = $ccxtService;
    }

    /**
     * Display transaction management page
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        $transactions = Transaction::forUser($user->id)
            ->orderBy('transaction_date', 'desc')
            ->with('user')
            ->paginate(50);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'transactionTypes' => Transaction::TRANSACTION_TYPES
        ]);
    }

    /**
     * Store a new transaction
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'symbol' => 'required|string|max:10|uppercase',
            'type' => ['required', Rule::in(array_keys(Transaction::TRANSACTION_TYPES))],
            'quantity' => 'required|numeric|min:0.00000001',
            'price_per_unit' => 'required|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'exchange' => 'nullable|string|max:100',
            'external_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'transaction_date' => 'required|date|before_or_equal:now',
            'is_taxable' => 'boolean',
        ]);

        $user = $request->user();
        $fees = $validated['fees'] ?? 0;
        $totalValue = $validated['quantity'] * $validated['price_per_unit'];

        try {
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'symbol' => $validated['symbol'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'price_per_unit' => $validated['price_per_unit'],
                'total_value' => $totalValue,
                'fees' => $fees,
                'exchange' => $validated['exchange'],
                'external_id' => $validated['external_id'],
                'notes' => $validated['notes'],
                'transaction_date' => Carbon::parse($validated['transaction_date']),
                'is_taxable' => $validated['is_taxable'] ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction added successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing transaction
     */
    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        // Ensure user owns this transaction
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'symbol' => 'required|string|max:10|uppercase',
            'type' => ['required', Rule::in(array_keys(Transaction::TRANSACTION_TYPES))],
            'quantity' => 'required|numeric|min:0.00000001',
            'price_per_unit' => 'required|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'exchange' => 'nullable|string|max:100',
            'external_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'transaction_date' => 'required|date|before_or_equal:now',
            'is_taxable' => 'boolean',
        ]);

        $fees = $validated['fees'] ?? 0;
        $totalValue = $validated['quantity'] * $validated['price_per_unit'];

        try {
            $transaction->update([
                'symbol' => $validated['symbol'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'price_per_unit' => $validated['price_per_unit'],
                'total_value' => $totalValue,
                'fees' => $fees,
                'exchange' => $validated['exchange'],
                'external_id' => $validated['external_id'],
                'notes' => $validated['notes'],
                'transaction_date' => Carbon::parse($validated['transaction_date']),
                'is_taxable' => $validated['is_taxable'] ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction updated successfully',
                'transaction' => $transaction->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a transaction
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        // Ensure user owns this transaction
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $transaction->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transaction deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current price for a symbol to help with data entry
     */
    public function getCurrentPrice(Request $request, string $symbol): JsonResponse
    {
        try {
            $priceData = $this->ccxtService->getCurrentPrice(strtoupper($symbol));
            $price = is_array($priceData) && isset($priceData['price'])
                ? (float) $priceData['price']
                : (float) $priceData;

            return response()->json([
                'success' => true,
                'symbol' => strtoupper($symbol),
                'price' => $price
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not fetch current price for ' . strtoupper($symbol)
            ], 404);
        }
    }

    /**
     * Bulk import transactions from CSV
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $user = $request->user();
        $file = $request->file('file');

        try {
            $handle = fopen($file->path(), 'r');
            $headers = fgetcsv($handle);
            $imported = 0;
            $errors = [];

            // Expected CSV headers: Date,Type,Symbol,Quantity,Price,Fees,Exchange,Notes
            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < 5)
                    continue; // Skip incomplete rows

                try {
                    $totalValue = (float) $row[3] * (float) $row[4]; // quantity * price

                    Transaction::create([
                        'user_id' => $user->id,
                        'transaction_date' => Carbon::parse($row[0]),
                        'type' => strtolower($row[1]),
                        'symbol' => strtoupper($row[2]),
                        'quantity' => (float) $row[3],
                        'price_per_unit' => (float) $row[4],
                        'total_value' => $totalValue,
                        'fees' => isset($row[5]) ? (float) $row[5] : 0,
                        'exchange' => $row[6] ?? null,
                        'notes' => $row[7] ?? null,
                        'is_taxable' => true,
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($imported + count($errors) + 2) . ": " . $e->getMessage();
                }
            }

            fclose($handle);

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$imported} transactions",
                'imported' => $imported,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download CSV template for bulk import
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="crypto_transactions_template.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($file, [
                'Date (YYYY-MM-DD)',
                'Type (buy/sell)',
                'Symbol (BTC)',
                'Quantity',
                'Price Per Unit (USD)',
                'Fees (USD)',
                'Exchange',
                'Notes'
            ]);

            // Example rows
            fputcsv($file, [
                '2024-01-15',
                'buy',
                'BTC',
                '0.5',
                '42000',
                '50',
                'Coinbase',
                'Bitcoin purchase'
            ]);

            fputcsv($file, [
                '2024-06-20',
                'sell',
                'BTC',
                '0.25',
                '65000',
                '75',
                'Coinbase',
                'Partial bitcoin sale'
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
