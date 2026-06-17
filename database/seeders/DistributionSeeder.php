<?php

namespace Database\Seeders;

use App\Models\Distribution;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DistributionSeeder extends Seeder
{
    public function run(): void
    {
        $carbohydrates = ['Nasi Putih Organik', 'Nasi Merah Giling', 'Kentang Tumbuk Keju', 'Nasi Kuning Harum'];
        $proteins_hewan = ['Ayam Goreng Lengkuas', 'Ayam Bakar Madu', 'Semur Daging Sapi', 'Telur Puyuh Balado', 'Ikan Fillet Crispy'];
        $proteins_nabati = ['Tempe Mendoan', 'Tahu Bacem Manis', 'Tahu Goreng Tepung', 'Tempe Orek Manis', 'Tahu Semur'];
        $vegetables = ['Sayur Sop Wortel Bakso', 'Capcay Bakso & Jamur', 'Sayur Asem Segar', 'Sup Jagung Manis', 'Sayur Bening Bayam'];
        $beverages = ['Susu UHT & Buah Jeruk', 'Susu Kotak & Buah Pisang', 'Susu UHT & Buah Apel', 'Susu Kotak & Buah Melon'];

        $schools = [
            'SDN 01 Sukajadi',
            'SDN 02 Sukajadi',
            'Pos PAUD Melati',
            'SDN 03 Sukajadi',
            'TK Kartika Candra'
        ];

        // Seed distributions for the last 30 days
        for ($i = 30; $i >= 1; $i--) {
            $date = Carbon::today()->subDays($i);
            
            // Skip weekends (optional, but realistic)
            if ($date->isWeekend()) {
                continue;
            }

            $menu = [
                'carbohydrate' => $carbohydrates[array_rand($carbohydrates)],
                'protein_hewan' => $proteins_hewan[array_rand($proteins_hewan)],
                'protein_nabati' => $proteins_nabati[array_rand($proteins_nabati)],
                'vegetable' => $vegetables[array_rand($vegetables)],
                'beverage' => $beverages[array_rand($beverages)]
            ];

            // Distribute 250 portions among a random subset of schools
            $dailyPoints = [];
            $totalTarget = 250;
            $totalDelivered = 0;
            
            // Let's choose 3 to 4 schools randomly
            $selectedSchools = (array) array_rand(array_flip($schools), rand(3, 4));
            $remainingPortions = $totalTarget;

            foreach ($selectedSchools as $index => $schoolName) {
                // If it's the last school, allocate all remaining portions
                if ($index === array_key_last($selectedSchools)) {
                    $qty = $remainingPortions;
                } else {
                    $qty = rand(40, round($remainingPortions / 1.5));
                }
                $remainingPortions -= $qty;

                // Random status (mostly Delivered for historical data)
                $isDelivered = rand(1, 10) <= 9; // 90% chance it was successfully delivered in the past
                $status = $isDelivered ? 'Delivered' : 'Pending';

                if ($isDelivered) {
                    $totalDelivered += $qty;
                    // Random delivery time between 08:35 and 09:45
                    $hour = rand(8, 9);
                    $minute = $hour === 8 ? rand(30, 59) : rand(0, 45);
                    $time = sprintf('%02d:%02d', $hour, $minute);
                } else {
                    $time = '-';
                }

                $dailyPoints[] = [
                    'id' => $index + 1,
                    'name' => $schoolName,
                    'qty' => $qty,
                    'status' => $status,
                    'delivered_at' => $time
                ];
            }

            Distribution::create([
                'date' => $date->toDateString(),
                'menu_data' => $menu,
                'points_data' => $dailyPoints,
                'total_target' => $totalTarget,
                'total_delivered' => $totalDelivered,
                'status' => 'Completed'
            ]);
        }
    }
}
