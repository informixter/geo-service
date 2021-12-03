<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SnapController extends Controller
{
    /**
     * Прокси для работы со снеп API
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function snap(Request $request)
    {
        $end_point = env('SNAP_SERVER', "http://159.69.178.233:3000");
        $client = new Client();
        $response = $client->post($end_point,
            [
                RequestOptions::JSON => [
                    'token' => 'cd8c06d0040dac',
                    'data' => $request->get('data'),
                    'profile' => $request->get('profile', 'foot'),
                ]
            ]
        );
        $res = json_decode($response->getBody()->getContents(), true);
        return response()->json($res);
    }

    /**
     * Обработка пачками снепинг
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function snap_batch(Request $request)
    {
        $end_point = env('SNAP_SERVER', "http://159.69.178.233:3000");
        $client = new Client();
        $all = $request->all();
        foreach ($all as $i => $snap_request) {
            $response = $client->post($end_point,
                [
                    RequestOptions::JSON => [
                        'token' => 'cd8c06d0040dac',
                        'data' => $snap_request['data'],
                        'profile' => $snap_request['profile'],
                    ]
                ]
            );
            $res = json_decode($response->getBody()->getContents(), true);
            $all[$i]['response'] = $res;
        }
        return response()->json($all);
    }

    /**
     * Получение данных калькуляции
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function similar(Request $request)
    {
        $end_point = env('SIMILAR_SERVER', "http://calc:5000");
        $client = new Client();
        $id = $request->route('id', 0);
//        $n_cl = $request->n('n_cl', 15);
        $n_cl = 15;
        $response = $client->get($end_point . "/?id=" . $id . "&n_cl=" . $n_cl);
        $res = json_decode($response->getBody()->getContents(), true);
        return response()->json($res);
    }

    /**
     * Получение координат кластера
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function similar_center(Request $request)
    {
        $end_point = env('SIMILAR_SERVER', "http://calc:5000");
        $client = new Client();
        $id = $request->route('id', 0);
        $n_cl = 15;
        $response = $client->get($end_point . "/centers?n_cl=" . $n_cl);
        $res = json_decode($response->getBody()->getContents(), true);
        return response()->json($res);
    }

    public function similar_coord(Request $request){
        $end_point = env('SIMILAR_SERVER', "http://calc:5000");
        $client = new Client();
        $n_cl = 15;
        $response = $client->post($end_point . "/similar_coords?n_cl=" . $n_cl, $request->all());
        $res = json_decode($response->getBody()->getContents(), true);
        return response()->json($res);
    }
}
