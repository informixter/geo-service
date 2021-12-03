<?php

namespace App\Console\Commands;

use App\Http\Controllers\Auth\MapsReseter;
use Illuminate\Console\Command;

class MapsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'map:reseter';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Банальный ресетер';


    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $rester = new MapsReseter();
        $rester->run();
        return Command::SUCCESS;
    }
}
