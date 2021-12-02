const { json } = require("body-parser");
var express = require("express");
var app = express();
var http = require('http'),
    fileSystem = require('fs'),
    path = require('path');


var decodePath = function (encoded, is3D) {
    var len = encoded.length;
    var index = 0;
    var array = [];
    var lat = 0;
    var lng = 0;
    var ele = 0;

    while (index < len) {
        var b;
        var shift = 0;
        var result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var deltaLon = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += deltaLon;

        if (is3D) {
            // elevation
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var deltaEle = ((result & 1) ? ~(result >> 1) : (result >> 1));
            ele += deltaEle;
            array.push([lng * 1e-5, lat * 1e-5, ele / 100]);
        } else
            array.push([lng * 1e-5, lat * 1e-5]);
    }
    // var end = new Date().getTime();
    // console.log("decoded " + len + " coordinates in " + ((end - start) / 1000) + "s");
    return array;
};

app.use(express.json());

app.post("/", (req, res, next) => {
    // console.log(req.body[0]);
    if (req.body['token'] != "cd8c06d0040dac") {
        res.json({ "msg": 'not valid password' });
    }
    var str = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="gpx.py -- https://github.com/tkrajina/gpxpy"><trk><trkseg>`
    req.body['data'].forEach(element => {
        str += `<trkpt lat="${element['lat']}" lon="${element['lon']}"></trkpt>`
    });
    str += `</trkseg></trk></gpx>`

    var sendRequest = {
        host: "graphhopper",
        path: '/match?profile=' + req.body['profile'] + '&type=json',
        port: 8989,
        method: 'POST',
        headers: {
            'Content-Type': 'application/gpx+xml'
        },
    }
    retData = []
    var s = http.request(sendRequest, function (routerRes) {
        routerRes.on('data', function (body) {
            var parsedJson = JSON.parse(body.toString())
            decodedCords = decodePath(parsedJson['paths'][0]['points']);

            decodedCords.forEach(function (it) {
                retData.push({ "lat": it[1], 'lon': it[0] })
            })
            res.json({ "points": retData, "distance": parsedJson['paths'][0]['distance'] });
        })
    })
    s.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.json({ "err": 'problem with request: ' + e.message });
    })

    s.write(str);
    s.end();
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});