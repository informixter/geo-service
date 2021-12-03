import {Circle, GoogleMap, Marker, Polyline, useJsApiLoader} from '@react-google-maps/api';
import React, {useCallback, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { PinDrop } from '@material-ui/icons';
import {mapStyles, snap} from "./helper";
import * as moment from "moment";

function App() {
	const { isLoaded } = useJsApiLoader({id: 'google-map-script', googleMapsApiKey: "AIzaSyB0RQ7Buz5dpvv51Z8M8x1BS4KipinEojo"})

	const [routes, setRoutes] = useState([]);
	const [selectedRoute, setSelectedRoute] = useState(null);
	const [center, setCenter] = useState(null);
	const [snapMode, setSnapMode] = useState("foot");
	const [visibleRoutes, setVisibleRoutes] = useState([]);
	const [snappedRoute, setSnappedRoute] = useState(null);

	const [clusters, setClusters] = useState([]);
	const [clustersVisible, setClustersVisible] = useState(false);

	const [manualMode, setManualMode] = useState(false);

	/**
	 *  Инициализация карты + зум
	 * */
	const onLoad = useCallback(function callback(map) {
		const bounds = new window.google.maps.LatLngBounds();
		map.fitBounds(bounds);
		setTimeout(() => map.setZoom(17), 100);
		setTimeout(() => map.setZoom(17), 500);
	}, [])


	/**
	 * Получение сохраненных на сервере роутов
	 * */
	useEffect(() =>
	{
		(async () =>
		{
			const response = await fetch('http://159.69.178.233:8080/api/routes');
			const data = await response.json();

			/**
			 * фильтрация маршрутов кинбери (остальные тестовые)
			 */
			let paths = data.sort((a, b) => a.name > b.name ? 1 : -1);

			setRoutes(paths);

			if (!selectedRoute)
			{
				setSelectedRoute(paths[0]);
			}
			else
			{
				const updatedSelectedData = paths.find(_ => _.id === selectedRoute.id);
				if (updatedSelectedData !== undefined)
				{
					setSelectedRoute(updatedSelectedData);
				}
			}
		})();

	}, []);

	/**
	 * Получение центров кластеров (кластеры формируются на сервере и пересчитываются после добавления новых точек через мобильное приложение)
	 * */
	useEffect(() =>
	{
		(async () =>
		{
			const response = await fetch('http://159.69.178.233:8080/api/similar_center');
			const data = await response.json();
			setClusters(data);
		})();

	}, []);

	/**
	 * Обработка кликов на карту при построении маргрута вручную
	 */
	async function onClick (e)
	{
		if (!selectedRoute)
		{
			return;
		}

		const latitude = e.latLng.lat();
		const longitude = e.latLng.lng();
		let date;

		date = new Date();

		setSelectedRoute({...selectedRoute, points: [...selectedRoute.points,
				{
					coords: {
						accuracy: 0,
						latitude,
						longitude,
						speed: 0,
					},
					timestamp: +date
				}
			]});

		if (!clustersVisible)
		{
			return;
		}

		/**
		 * АНАЛИЗ НОВОЙ ТОЧКИ НА БЛИЗОСТЬ К КЛАСТЕРАМ (ПРЕДЫДУЩИМ МАРШРУТАМ)
		 */
		const response = await fetch('http://159.69.178.233:8080/api/similar_coord', {headers: {'Content-Type' : 'application/json'}, method: "POST", body: JSON.stringify([{lat: latitude, lon: longitude}])})
		const data = await response.json();
		const nearCluster = data.find(cluster => cluster.score > 0.8);
		if (nearCluster === undefined )
		{
			alert('Нет предыдущих маршрутов в округе. Замер раз в 2 минуты');
		}
		else
		{
			console.log(nearCluster);
			alert('Рядом найден предыдущий маршрут. Увеличиваем интервал замеров до 3 минут');
		}
	}

	function isRouteVisible (route)
	{
		return visibleRoutes.find(_ => _.id === route?.id) !== undefined;
	}

	/**
	 * Закрепление / открепление маршрута на карте
	 */
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

	/**
	 * Выбор маршрута для отображения
	 **/
	function selectTrack (trackId)
	{
		const track = routes.find(_ => +_.id === +trackId);

		setSelectedRoute(selectedRoute?.id === track?.id ? null : track);

		if ((track?.points || []).length > 0)
		{
			setCenter({
				lat: track?.points[0].coords.latitude,
				lng: track?.points[0].coords.longitude,
			});
		}
	}

	function toggleManualMode ()
	{
		if (manualMode)
		{
			setManualMode(false);
		}
		else
		{
			setManualMode(true);
			const newRoute = {
				id : Math.random() * 12321321321,
				name: 'ручной маршрут ' + (Math.random() * 1031231200),
				color: 'black',
				points : []
			};

			setRoutes([...routes, newRoute]);
			setSelectedRoute(newRoute);
		}
	}

	if (!isLoaded)
	{
		return null;
	}

	const points = (selectedRoute?.points || []).sort((p1, p2) => p1.timestamp > p2.timestamp ? 1 : -1);

	return (
		<div>

			<div className="d-flex justify-content-between p-2">

				<div className="d-flex">
					<select style={{marginRight: 10}} className="form-control form-control-sm d-inline-block" onChange={(e) => selectTrack(e.target.value)}>
						<option selected>Выберите маршрут</option>
						{routes.filter(route => route.name.match(/маршрут/)).map(track => (
							<option value={track.id} selected={track.id === selectedRoute?.id} onClick={() => selectTrack(track)}>
								{track.name} ({track.points.length} точек) {isRouteVisible(track) ? ' [ЗАКРЕПЛЕН]' : ''}
							</option>
						))}
					</select>
					<button style={{marginRight: 10, whiteSpace: 'nowrap'}} disabled={!selectedRoute} onClick={() => snap(selectedRoute, snapMode, setVisibleRoutes, setSnappedRoute)} className={`ml-2 btn btn-sm  btn-primary`}>
						<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/><path d="M9.78,11.16l-1.42,1.42c-0.68-0.69-1.34-1.58-1.79-2.94l1.94-0.49C8.83,10.04,9.28,10.65,9.78,11.16z M11,6L7,2L3,6h3.02 C6.04,6.81,6.1,7.54,6.21,8.17l1.94-0.49C8.08,7.2,8.03,6.63,8.02,6H11z M21,6l-4-4l-4,4h2.99c-0.1,3.68-1.28,4.75-2.54,5.88 c-0.5,0.44-1.01,0.92-1.45,1.55c-0.34-0.49-0.73-0.88-1.13-1.24L9.46,13.6C10.39,14.45,11,15.14,11,17c0,0,0,0,0,0h0v5h2v-5 c0,0,0,0,0,0c0-2.02,0.71-2.66,1.79-3.63c1.38-1.24,3.08-2.78,3.2-7.37H21z"/></g></svg>
						Уточнить маршрут
					</button>

					<select style={{marginRight: 10, width: 200}} className="form-control form-control-sm d-inline-block" onChange={(e) => setSnapMode(e.target.value)}>
						<option value="auto" selected={snapMode === 'auto'}>Режим по ср. скорости</option>
						<option value="foot" selected={snapMode === 'walk'}>Режим - пеший</option>
						<option value="car" selected={snapMode === 'car'}>Режим - машина</option>
					</select>

				</div>

				<button disabled={!selectedRoute} style={{marginRight: 10}} onClick={() => toggleVisibleRoute(selectedRoute)} className={`ml-2 btn btn-sm btn-default`}>
					<PinDrop/>
					{isRouteVisible(selectedRoute) ? 'Скрыть' : 'Зафиксировать'} маршрут
				</button>

				<button onClick={() => toggleManualMode()} className={`ml-2 btn btn-sm btn-default`}>
					{manualMode ? 'Выкл' : 'Вкл'} ручной режим
				</button>

				<button onClick={() => setClustersVisible(!clustersVisible)} className={`ml-2 btn btn-sm btn-default`}>
					{clustersVisible ? 'Выкл' : 'Вкл'} кластеры
				</button>

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

				{
					clustersVisible && routes.filter(route => route.id !== selectedRoute?.id && route.id !== snappedRoute?.id).map(route =>
						<Polyline options={{strokeColor: 'blue'}} path={route.points.map(point => ({lat: point.coords.latitude, lng: point.coords.longitude}))}/>
					)
				}
				{clustersVisible && clusters.map(cluster => <Circle onClick={onClick} center={{lat : cluster.lat, lng: cluster.lon}} radius={80}/>)}
			</GoogleMap>

			{
				selectedRoute?.img &&
					<div style={{width: 350, position: 'absolute', left: 0, bottom: 0, backgroundColor: "#fff"}}>
						{
							snappedRoute && selectedRoute?.batteryPercent &&
							<div className="d-flex text-center p-2">
								<div>
									<h3 className="text-success">на {selectedRoute?.batteryPercent}%</h3>
									<div className="small text-muted">меньше расхода батареи относительно Kinbery</div>
								</div>
								<div>
									<h3 className="text-success">на {selectedRoute?.precisionPercent}%</h3>
									<div className="small text-muted">выше точность построения маршрута относительно Kinbery</div>
								</div>
							</div>
						}
						<img src={selectedRoute?.img} style={{width: '100%'}} />
					</div>
			}
		</div>
	)
}

export default App;
