import * as moment from "moment";

/**
 * стили карты для google maps
 */
export const mapStyles = [
	{
		"featureType": "all",
		"elementType": "labels.text",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "poi",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#fff"
			}
		]
	},
];


/**
 * определение расстояния между 2мя точками (в метрах) по формуле с учетом изгиба земли
 */
export function calcDistance (point1, point2)
{
	function calcCrow(lat1, lon1, lat2, lon2) {
		const R = 6371 // km
		const dLat = toRad(lat2 - lat1)
		const dLon = toRad(lon2 - lon1)
		lat1 = toRad(lat1)
		lat2 = toRad(lat2)

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		const d = R * c
		return d
	}

	function toRad(value) {
		return (value * Math.PI) / 180
	}

	const distanceInKM =
		Math.round(
			calcCrow(point1.coords.latitude, point1.coords.longitude, point2.coords.latitude, point2.coords.longitude) *
			1000,
		) / 1000

	let distance = null
	if (!isNaN(distanceInKM)) {
		distance = Math.round(distanceInKM * 1000);
	}

	return (distance || 0)
}

/**
 * lookup алгоритм устранения петлей в маршрутах
 */
export function lookup (route, pointsCount = 2, maxDistance = 75)
{
	let filteredPoints = [];
	let i = 0, max = route.points.length;

	while (i < max)
	{
		filteredPoints.push(route.points[i]);
		const group = route.points.slice(i, i + pointsCount + 1);

		if (group.length === pointsCount + 1)
		{
			const totalSum = group.reduce((sum, point, tempI, tempPoints) =>
			{
				if (tempPoints[tempI + 1])
				{
					return sum + calcDistance(tempPoints[tempI], tempPoints[tempI + 1]);
				}
				else
				{
					return sum;
				}
			}, 0);

			const directSum = calcDistance(route.points[i], route.points[i + pointsCount]);
			if (directSum < totalSum && totalSum < maxDistance)
			{
				filteredPoints.push(route.points[i + pointsCount]);
				i+= (pointsCount - 1);
			}
		}

		i++;
	}

	route.points = filteredPoints;
}

/**
 * прикрепление маршрута к дорогам и пешим маршрутам (map snapping)
 */
export async function snap (path, snapMode, setVisibleRoutes, setSnappedRoute, setLoading, addToast)
{
	addToast('Уточняем маршрут, ждите...', { appearance: 'info' });
	setLoading(true);
	let groups = [];
	let points = [...path.points];
	let startPoints = [];
	let endPoints = [];

	startPoints.push(points[0]);

	points.forEach((p, i) =>
	{
		if (points[i + 1] === undefined)
		{
			endPoints.push(p);
			return;
		}
		else
		{
			let gr = [p, points[i + 1]];
			/*if (points[i + 2] !== undefined)
			{
				gr.push(points[i + 2]);
			}*/

			groups.push(gr);
		}
	});

	endPoints.push(points[points.length - 1]);

	const snappedRoute = {
		id : Math.random() * 1000,
		name: path.name + ' SNAPPED',
		color: 'green',
		points : []
	};

	//setVisibleRoutes([]);

	for await (let group of groups)
	{
		const velocity = calcDistance(...group) / ((group[group.length - 1].timestamp - group[0].timestamp) / 1000);

		console.log(velocity);
		const params = {
			profile: snapMode === 'auto' ? (velocity > 5 ? 'car' : 'foot') : snapMode,
			data: group.map(point => ({lat: point.coords.latitude, lon: point.coords.longitude, time: moment(point.timestamp).format("HH:mm:ss")}))
		};

		const response = await fetch('http://159.69.178.233:8080/api/snap', {headers: {'Content-Type': 'application/json'}, method: "POST", body: JSON.stringify(params)});
		const data = await response.json();
		const newPoints = data.points.map(p => ({coords: {latitude: p.lat, longitude: p.lon}}));

		/*setVisibleRoutes(prev => [...prev, {
			id : Math.random() * 1000,
			name: path.name + ' SNAPPED',
			color: '#' + Math.floor(Math.random()*16777215).toString(16),
			points : [group[0], ...newPoints, group[group.length - 1]]
		}]);*/

		snappedRoute.points = [...snappedRoute.points, ...newPoints];
	}

	snappedRoute.points = [...startPoints, ...snappedRoute.points, ...endPoints];
	lookup(snappedRoute, 3);
	lookup(snappedRoute, 2, 100);

	addToast('Маршрут уточнён', { appearance: 'success' });
	setSnappedRoute(snappedRoute);
	setLoading(false);
}
