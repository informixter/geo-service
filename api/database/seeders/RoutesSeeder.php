<?php

namespace Database\Seeders;

use App\Models\Routes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class RoutesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $d = Storage::disk('local')->path('exp2.csv');

        $data = $this->csv_to_array($d, ",");

        foreach ($data as $row) {
            $route = Routes::find($row['id']);
            if (is_null($route)) {
                $route = new Routes();
            }

            $route->id = $row['id'];
            $route->name = $row['name'];
            $route->data = $row['data'];
            $route->save();
        }

    }

    private function csv_to_array($filename = '', $delimiter = ',')
    {
        if (!file_exists($filename) || !is_readable($filename))
            return FALSE;

        $header = NULL;
        $data = array();
        if (($handle = fopen($filename, 'r')) !== FALSE) {
            while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
                if (!$header)
                    $header = $row;
                else
                    $data[] = array_combine($header, $row);
            }
            fclose($handle);
        }
        return $data;
    }
}
