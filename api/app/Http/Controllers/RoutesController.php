<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoutesRequest;
use App\Http\Requests\UpdateRoutesRequest;
use App\Models\Routes;
use Illuminate\Http\Request;

class RoutesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $listing = Routes::all()->map(function ($item) {
            return json_decode($item['data'], true);
        });
        return response()->json($listing->toArray());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $route = Routes::find($request->get('id'));
        if (is_null($route)) {
            $route = new Routes();
        }

        $route->id = $request->get('id');
        $route->name = $request->get('name');
        $route->data = json_encode($request->all());
        $route->save();

        return response()->json(['id' => $route->id]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \App\Http\Requests\StoreRoutesRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRoutesRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param \App\Models\Routes $routes
     * @return \Illuminate\Http\Response
     */
    public function show(Routes $routes)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param \App\Models\Routes $routes
     * @return \Illuminate\Http\Response
     */
    public function edit(Routes $routes)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \App\Http\Requests\UpdateRoutesRequest $request
     * @param \App\Models\Routes $routes
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Routes $routes)
    {
        $id = $request->route('id');
        $route = Routes::find($id);
        $data = json_decode($route->data, true);
//        foreach ($request->all() as $row) {
//            $data['points'][] = $row;
//        }
        $data['points'][] = $request->all();
        $route->data = json_encode($data);
        $route->save();
        return $data;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param \App\Models\Routes $routes
     * @return \Illuminate\Http\Response
     */
    public function destroy(Routes $routes)
    {
        //
    }
}
