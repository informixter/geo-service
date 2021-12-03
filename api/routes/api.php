<?php

use App\Http\Controllers\RoutesController;
use App\Http\Controllers\SnapController;
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

Route::post('/snap', [SnapController::class, 'snap']);
Route::post('/snap_batch', [SnapController::class, 'snap_batch']);
Route::get('/similar/{id}', [SnapController::class, 'similar']);

