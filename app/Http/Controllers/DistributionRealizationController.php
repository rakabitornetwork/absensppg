<?php

namespace App\Http\Controllers;

use App\Models\Distribution;
use App\Models\SppgSetting;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DistributionRealizationController extends Controller
{
    public function index(): Response
    {
        $todayStr = Carbon::today()->toDateString();
        
        // 1. Get today's active settings configuration
        $settings = SppgSetting::pluck('value', 'key')->toArray();
        
        $todayMenu = isset($settings['today_menu']) 
            ? json_decode($settings['today_menu'], true) 
            : [
                'carbohydrate' => 'Nasi Putih Organik',
                'protein_hewan' => 'Ayam Goreng Lengkuas',
                'protein_nabati' => 'Tempe Mendoan Hangat',
                'vegetable' => 'Sayur Sop Wortel & Bakso',
                'beverage' => 'Susu Kotak UHT & Buah Jeruk Manis'
            ];

        $distributionPoints = isset($settings['distribution_points'])
            ? json_decode($settings['distribution_points'], true)
            : [];

        $mealTarget = isset($settings['meal_target']) ? (int) $settings['meal_target'] : 250;
        
        // Compute total delivered for today's current settings
        $totalDeliveredToday = 0;
        foreach ($distributionPoints as $point) {
            if (isset($point['status']) && $point['status'] === 'Delivered') {
                $totalDeliveredToday += (int) ($point['qty'] ?? 0);
            }
        }

        // 2. Check if today's record is already locked/saved in DB
        $todayRecord = Distribution::where('date', $todayStr)->first();
        $isLocked = $todayRecord ? true : false;

        // When locked, show the saved snapshot (live settings may already be reset)
        if ($isLocked && $todayRecord) {
            $todayMenu = $todayRecord->menu_data ?? $todayMenu;
            $distributionPoints = $todayRecord->points_data ?? $distributionPoints;
            $mealTarget = (int) ($todayRecord->total_target ?? $mealTarget);
            $totalDeliveredToday = (int) ($todayRecord->total_delivered ?? $totalDeliveredToday);
        }

        // 3. Fetch past 30 days history for monthly calendar and trend graphs
        $history = Distribution::orderBy('date', 'desc')
            ->take(30)
            ->get();

        return Inertia::render('DistributionRealizations', [
            'todayConfig' => [
                'date' => Carbon::today()->format('d F Y'),
                'date_raw' => $todayStr,
                'menu' => $todayMenu,
                'points' => $distributionPoints,
                'meal_target' => $mealTarget,
                'total_delivered' => $totalDeliveredToday,
                'is_locked' => $isLocked,
                'locked_record' => $todayRecord
            ],
            'history' => $history,
            'shifts' => Shift::all(),
            'systemSettings' => $settings,
        ]);
    }

    public function lockToday(Request $request)
    {
        $todayStr = Carbon::today()->toDateString();
        
        // Load active configurations from settings
        $settings = SppgSetting::pluck('value', 'key')->toArray();
        
        $todayMenu = isset($settings['today_menu']) 
            ? json_decode($settings['today_menu'], true) 
            : [
                'carbohydrate' => 'Nasi Putih Organik',
                'protein_hewan' => 'Ayam Goreng Lengkuas',
                'protein_nabati' => 'Tempe Mendoan Hangat',
                'vegetable' => 'Sayur Sop Wortel & Bakso',
                'beverage' => 'Susu Kotak UHT & Buah Jeruk Manis'
            ];

        $distributionPoints = isset($settings['distribution_points'])
            ? json_decode($settings['distribution_points'], true)
            : [];

        $mealTarget = isset($settings['meal_target']) ? (int) $settings['meal_target'] : 250;
        
        // Calculate total delivered and prepare snapshot points
        $totalDelivered = 0;
        $allDelivered = true;
        $snapshotPoints = [];
        
        foreach ($distributionPoints as $point) {
            $snapshotPoint = $point;

            if (isset($point['status']) && $point['status'] === 'Delivered') {
                $totalDelivered += (int) ($point['qty'] ?? 0);
                if (!isset($point['delivered_at']) || $point['delivered_at'] === '-') {
                    $snapshotPoint['delivered_at'] = Carbon::now()->format('H:i');
                }
            } else {
                $allDelivered = false;
                $snapshotPoint['delivered_at'] = '-';
            }

            $snapshotPoints[] = $snapshotPoint;
        }

        // Lock/Save into distributions database
        Distribution::updateOrCreate(
            ['date' => $todayStr],
            [
                'menu_data' => $todayMenu,
                'points_data' => $snapshotPoints,
                'total_target' => $mealTarget,
                'total_delivered' => $totalDelivered,
                'status' => $allDelivered ? 'Completed' : 'Ready'
            ]
        );

        // Reset live delivery status for next cycle (keep names & qty)
        $resetPoints = array_map(function ($point) {
            $point['status'] = 'Pending';
            $point['delivered_at'] = '-';
            return $point;
        }, $distributionPoints);

        SppgSetting::setValue('distribution_points', json_encode(array_values($resetPoints)));

        return redirect()->back()->with('success', 'Data realisasi berhasil dikunci. Status pengiriman di Target Distribusi di-reset ke Pending.');
    }

    public function unlockToday(Request $request)
    {
        // Enforce superadmin only
        if ($request->user()->role !== 'superadmin') {
            abort(403, 'Hanya Superuser yang dapat membuka kunci atau menghapus laporan.');
        }

        $todayStr = Carbon::today()->toDateString();
        $record = Distribution::where('date', $todayStr)->first();
        if ($record) {
            $record->delete();
        }

        if ($request->has('redirect_to_target')) {
            return redirect('/target-distribusi')->with('success', 'Laporan dibuka kunci. Silakan edit target distribusi di sini.');
        }

        return redirect()->back()->with('success', 'Laporan hari ini berhasil dibuka kunci.');
    }
}
