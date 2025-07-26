<?php

namespace App\Http\Controllers;

use App\Services\TaxReportingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TaxReportController extends Controller
{
    private TaxReportingService $taxReportingService;

    public function __construct(TaxReportingService $taxReportingService)
    {
        $this->taxReportingService = $taxReportingService;
    }

    /**
     * Display tax reporting dashboard
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        $currentYear = date('Y');
        $availableYears = range($currentYear - 5, $currentYear);

        return Inertia::render('TaxReport', [
            'availableYears' => $availableYears,
            'currentYear' => $currentYear
        ]);
    }

    /**
     * Generate tax report for a specific year
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'tax_year' => 'required|integer|min:2020|max:' . (date('Y') + 1)
        ]);

        $user = $request->user();
        $taxYear = $request->input('tax_year');

        try {
            $taxReport = $this->taxReportingService->generateTaxReport($user->id, $taxYear);

            return response()->json([
                'success' => true,
                'data' => $taxReport
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate tax report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export tax report to CSV
     */
    public function exportCSV(Request $request): Response
    {
        $request->validate([
            'tax_year' => 'required|integer|min:2020|max:' . (date('Y') + 1)
        ]);

        $user = $request->user();
        $taxYear = $request->input('tax_year');

        try {
            $taxReport = $this->taxReportingService->generateTaxReport($user->id, $taxYear);
            $filePath = $this->taxReportingService->exportToCSV($taxReport);

            return response()->download($filePath)->deleteFileAfterSend();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export tax report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tax optimization suggestions
     */
    public function getOptimizationSuggestions(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $taxReport = $this->taxReportingService->generateTaxReport($user->id, date('Y'));

            return response()->json([
                'success' => true,
                'suggestions' => $taxReport['tax_optimization']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get optimization suggestions: ' . $e->getMessage()
            ], 500);
        }
    }
}
