<?php

use App\Http\Controllers\RoutesController;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

//Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//    return $request->user();
//});


Route::get('/routes', [RoutesController::class, 'index']);
Route::post('/routes', [RoutesController::class, 'create']);
Route::post('/routes/{id}', [RoutesController::class, 'update']);

Route::post('/snap', function (Request $request) {
    $end_point = env('SNAP_SERVER', "http://159.69.178.233:3000");
    $client = new Client();
    $response = $client->post($end_point,
        [
            \GuzzleHttp\RequestOptions::JSON => [
                'token' => 'cd8c06d0040dac',
                'data' => $request->get('data'),
                'profile' => $request->get('profile', 'foot'),
            ]
        ]
    );
    $res = json_decode($response->getBody()->getContents(), true);
    return response()->json($res);
});

