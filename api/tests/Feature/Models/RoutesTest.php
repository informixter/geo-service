<?php

namespace Tests\Feature\Models;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RoutesTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_example()
    {
        $str = '
        {
            "id": '.mt_rand(1,9999999).',
            "name": "demotest",
            "color": "",
            "points": [
                    {
                         "coords" : {
                            "latitude": 0.2,
                            "longitude": 0.4,
                            "accuracy": 0.5,
                            "speed": 0.6
                         },
                         "timestamp": 12344
                    }
            ]}';

        $postData = json_decode($str, true);


        $response = $this->postJson('/api/routes', $postData);
        $response->assertStatus(200);
        $this->assertDatabaseHas('routes', ['name'=>$postData['name'], 'id' => $postData['id']]);

        $postData['name'] = "22";
//        $postData['id'] = $response->decodeResponseJson()->json('id');
        $response = $this->postJson('/api/routes', $postData);
        $response->assertStatus(200);
        $this->assertDatabaseHas('routes', ['name'=>$postData['name'], 'id'=>$postData['id']]);

        $response = $this->getJson('/api/routes');
        $response->assertStatus(200);

        $points = $postData['points'];
        $points['coords']['latitude'] = 0.11;
        $points['coords']['longitude'] = 0.12;
        $this->postJson('/api/routes/'.$postData['id'], $points)->status(200);
        $this->assertDatabaseHas('routes', ['name'=>$postData['name'], 'id'=>$postData['id']]);
//        dd($response->decodeResponseJson()->json);
//        dd($response->decodeResponseJson()->json);
    }
}
