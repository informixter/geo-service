import {GoogleMap, Marker, Polyline, useJsApiLoader} from '@react-google-maps/api';
import React, {useCallback, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { PinDrop } from '@material-ui/icons';
import {calcDistance, mapStyles, polygonCenter, snap} from "./helper";
import * as moment from "moment";

function App() {
	const { isLoaded } = useJsApiLoader({id: 'google-map-script', googleMapsApiKey: "AIzaSyB0RQ7Buz5dpvv51Z8M8x1BS4KipinEojo"})

	const [data, setData] = useState([]);
	const [selectedData, setSelectedData] = useState(null);
	const [center, setCenter] = useState(null);
	const [snapMode, setSnapMode] = useState("foot");
	const [visibleRoutes, setVisibleRoutes] = useState([]);
	const [snappedRoute, setSnappedRoute] = useState(null);

	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());

	const onLoad = useCallback(function callback(map) {
		const bounds = new window.google.maps.LatLngBounds();
		map.fitBounds(bounds);
		setTimeout(() => map.setZoom(17), 100);
		setTimeout(() => map.setZoom(17), 500);
	}, [])

	useEffect(() =>
	{
		(async () =>
		{
			const response = await fetch('https://api.smartarget.online/geo/data');
			const data = await response.json();
			let paths = data.data.sort((a, b) => a.name > b.name ? 1 : -1);
			cluster(paths);
			cluster(paths);
			cluster(paths);
			getOptimized(paths);

			setData(paths);

			if (!selectedData)
			{
				setSelectedData(paths[0]);
			}
			else
			{
				const updatedSelectedData = paths.find(_ => _.id === selectedData.id);
				if (updatedSelectedData !== undefined)
				{
					setSelectedData(updatedSelectedData);
				}
			}
		})();

	}, []);

	function cluster (paths)
	{
		paths.filter(path => path.name.match('cluster')).forEach(path =>
		{
			const newPoints = [];
			path.points.forEach((point, i) =>
			{
				newPoints.push(point);

				if (i >= path.points.length - 1)
				{
					return;
				}

				const center = polygonCenter([point, path.points[i + 1]]);
				newPoints.push({...point, coords: {...point.coords, ...center}});
			});

			path.points = newPoints;
		});
	}

	function getOptimized (paths)
	{
		const optimizedPath = {
			id: 21312312,
			name: 'optimized',
			color: 'red',
			points: []
		};

		const clusterPaths = paths.filter(path => path.name.match('cluster')).sort((a, b) => a.points.length > b.points.length ? -1 : 1);
		const longestPath = clusterPaths[0];
		const shortClusterPaths = clusterPaths.slice(1);

		while (shortClusterPaths.length > 0)
		{
			let shortPath = shortClusterPaths.pop();
			longestPath.points.forEach((point, i) =>
			{
				let shortPathPointToSnap = null;
				let shortestDistance = 1000000;
				shortPath.points.filter(shortPathPoint => calcDistance(point, shortPathPoint) < 5)
				.forEach(p =>
				{
					const d = calcDistance(point, p);
					if (d < shortestDistance)
					{
						shortPathPointToSnap = p;
						shortestDistance = d;
					}
				});

				if (!shortPathPointToSnap)
				{
					return;
				}

				const center = polygonCenter([point, shortPathPointToSnap]);
				optimizedPath.points.push({...point, coords: {...point.coords, ...center}, timestamp: i});
			}, []);
		}

		paths.push(optimizedPath);
	}

	function getTitle (timestamp)
	{
		return moment(timestamp).format("HH:mm:ss");
	}

	function onClick (e)
	{
		if (!selectedData || !params.mode)
		{
			return;
		}

		const latitude = e.latLng.lat();
		const longitude = e.latLng.lng();
		let date;

		if (params.mode === 'manual1')
		{
			let timestamp = selectedData.points[0].timestamp;

			date = new Date(timestamp);

			let newTime = prompt('');
			if (!newTime || !newTime.split)
			{
				return;
			}

			let components = newTime.split(':');

			if (!components[0] || !components[1] || !components[2])
			{
				return;
			}

			date.setHours(components[0]);
			date.setMinutes(components[1]);
			date.setSeconds(components[2]);
		}
		else
		{
			date = new Date();
		}

		setSelectedData({...selectedData, points: [...selectedData.points,
				{
					coords: {
						accuracy: 4.989270751271548,
						latitude,
						longitude,
						speed: 0,
					},
					timestamp: +date
				}
			]});
	}

	function isRouteVisible (route)
	{
		return visibleRoutes.find(_ => _.id === route?.id) !== undefined;
	}

	function toggleVisibleRoute (route)
	{
		if (!isRouteVisible(route))
		{
			setVisibleRoutes([...visibleRoutes, route]);
		}
		else
		{
			setVisibleRoutes(visibleRoutes.filter(_ => _.id !== route.id));
		}
	}

	function selectTrack (trackId)
	{
		const track = data.find(_ => +_.id === +trackId);

		setSelectedData(selectedData?.id === track?.id ? null : track);
		if ((track?.points || []).length > 0)
		{
			setCenter({
				lat: track?.points[0].coords.latitude,
				lng: track?.points[0].coords.longitude,
			});
		}
	}

	if (!isLoaded)
	{
		return null;
	}

	const points = (selectedData?.points || []).sort((p1, p2) => p1.timestamp > p2.timestamp ? 1 : -1);

	return (
		<div>

			<div className="d-flex justify-content-between p-2">

				<div className="d-flex">
					<select style={{marginRight: 10}} className="form-control form-control-sm d-inline-block" onChange={(e) => selectTrack(e.target.value)}>
						<option selected>Выберите маршрут</option>
						{data.map(track => (
							<option value={track.id} selected={track.id === selectedData?.id} onClick={() => selectTrack(track)}>
								{track.name} ({track.points.length} точек) {isRouteVisible(track) ? ' [ЗАКРЕПЛЕН]' : ''}
							</option>
						))}
					</select>
					<button style={{marginRight: 10, whiteSpace: 'nowrap'}} disabled={!selectedData} onClick={() => snap(selectedData, snapMode, setVisibleRoutes, setSnappedRoute)} className={`ml-2 btn btn-sm  btn-primary`}>
						<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/><path d="M9.78,11.16l-1.42,1.42c-0.68-0.69-1.34-1.58-1.79-2.94l1.94-0.49C8.83,10.04,9.28,10.65,9.78,11.16z M11,6L7,2L3,6h3.02 C6.04,6.81,6.1,7.54,6.21,8.17l1.94-0.49C8.08,7.2,8.03,6.63,8.02,6H11z M21,6l-4-4l-4,4h2.99c-0.1,3.68-1.28,4.75-2.54,5.88 c-0.5,0.44-1.01,0.92-1.45,1.55c-0.34-0.49-0.73-0.88-1.13-1.24L9.46,13.6C10.39,14.45,11,15.14,11,17c0,0,0,0,0,0h0v5h2v-5 c0,0,0,0,0,0c0-2.02,0.71-2.66,1.79-3.63c1.38-1.24,3.08-2.78,3.2-7.37H21z"/></g></svg>
						Прикрепить к дорогам и улицам
					</button>

					<select style={{marginRight: 10}} className="form-control form-control-sm d-inline-block" onChange={(e) => setSnapMode(e.target.value)}>
						<option value="auto" selected={snapMode === 'auto'}>Режим (пеший/машина) - определять по средней скорости</option>
						<option value="foot" selected={snapMode === 'walk'}>Режим - пеший</option>
						<option value="car" selected={snapMode === 'car'}>Режим - машина</option>
					</select>

				</div>

				<button disabled={!selectedData} style={{marginRight: 10}} onClick={() => toggleVisibleRoute(selectedData)} className={`ml-2 btn btn-sm btn-default`}>
					<PinDrop/>
					{isRouteVisible(selectedData) ? 'Скрыть' : 'Зафиксировать'} маршрут на карте
				</button>

				{
					false && params.mode &&
					<div className="col-md-2">
						<input value={JSON.stringify(selectedData)}/>
					</div>
				}
			</div>

			<GoogleMap
				onClick={onClick}
				labelClass="label"
				options={{styles: mapStyles, labelClass: 'test'}}
				mapContainerStyle={{width: window.innerWidth, height: window.innerHeight - 50}}
				center={center || {lat: 54.7253477385935, lng: 55.94946199861226}}
				zoom={17}
				onLoad={onLoad}
			>
				{
					visibleRoutes.map(route => <Polyline options={{strokeColor: route.color || 'red'}} path={route.points.map(point => ({lat: point.coords.latitude, lng: point.coords.longitude}))}/>)
				}
				<Polyline path={points.map(point => ({lat: point.coords.latitude, lng: point.coords.longitude}))}/>

				{
					snappedRoute &&
					<Polyline options={{strokeColor: snappedRoute.color || '#000'}} path={snappedRoute.points.map(point => ({lat: point.coords.latitude, lng: point.coords.longitude}))}/>
				}

				{/*{(snappedRoute?.points || []).map((point, index, points) => <Marker label={moment(point.timestamp).format("HH:mm:ss") && ""}
				                                              position={{lat: point.coords.latitude, lng: point.coords.longitude}}/>)}*/}


				{points.map((point, index, points) => <Marker label={moment(point.timestamp).format("HH:mm:ss") && ""}
				                                              position={{lat: point.coords.latitude, lng: point.coords.longitude}}/>)}
			</GoogleMap>

			{
				selectedData?.img &&
					<div style={{width: 350, position: 'absolute', left: 0, bottom: 0, backgroundColor: "#fff"}}>
						{
							snappedRoute && selectedData?.batteryPercent &&
							<div className="d-flex text-center p-2">
								<div>
									<h3 className="text-success">на {selectedData?.batteryPercent}%</h3>
									<div className="small text-muted">меньше расхода батареи относительно Kinbery</div>
								</div>
								<div>
									<h3 className="text-success">на {selectedData?.precisionPercent}%</h3>
									<div className="small text-muted">выше точность построения маршрута относительно Kinbery</div>
								</div>
							</div>
						}
						<img src={selectedData?.img} style={{width: '100%'}} />
					</div>
			}
		</div>
	)
}

export default App;
