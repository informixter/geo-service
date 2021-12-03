import * as React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Button,
	FlatList,
	TextInput,
	SafeAreaView,
	ScrollView,
	Alert,
	Dimensions,
	TouchableOpacity
} from "react-native";
import {useSelector} from "react-redux";
import {useState} from "react";
import {useEffect} from "react";
import {setSelectedTrack as saveSelectedTrack, setTracks} from "./ducks/main";
import MapView from "react-native-maps/lib/components/MapView";
import MapMarker from "react-native-maps/lib/components/MapMarker";
import {Polyline} from "react-native-maps";
import {LocationAccuracy, LocationActivityType} from "expo-location/src/Location.types";
import {useActionSheet} from "@expo/react-native-action-sheet";
import { Pedometer } from 'expo-sensors';

import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';

export function calcDistance(
	userLatitude,
	userLongitude,
	pointLatitude,
	pointLongitude,
) {
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
			calcCrow(userLatitude, userLongitude, pointLatitude, pointLongitude) *
			1000,
		) / 1000

	let distance = null
	if (!isNaN(distanceInKM)) {
		distance = Math.round(distanceInKM * 1000);
	}

	return (distance || 0).toString()
}

const global = {
	setSelectedTrack: () => false,
	redefineTaskWithParams : () => false
};
const LOCATION_TRACKING = 'location-tracking';

function log (data)
{
	fetch('https://api.smartarget.online/log4', {method: "POST", body: JSON.stringify(data)});
}

TaskManager.defineTask(LOCATION_TRACKING, async (info) => {

	if (info.error) {
		log('LOCATION_TRACKING task ERROR:' + JSON.stringify(info.info));
		return;
	}
	if (info.data && info?.executionInfo?.appState !== "active") {
		const { locations } = info.data;
		const newPoint = {
			"coords": {
				"latitude": locations[0].coords.latitude,
				"accuracy": locations[0].coords.accuracy,
				"longitude": locations[0].coords.longitude,
				"speed": locations[0].coords.speed
			},
			"timestamp": locations[0].timestamp
		};

		const start = new Date();
		start.setMinutes(start.getMinutes() - 30);
		/*let {steps = 0} = await Pedometer.getStepCountAsync(start, new Date());

		if (steps === 0 || newPoint.coords.accuracy > 20)
		{
			return;
		}*/

		global.setSelectedTrack(selectedTrackPreviousState =>
		{
			let currentPoints =  [...(selectedTrackPreviousState?.points || [])];
			const nearPoint = currentPoints.find(point => calcDistance(point.coords.latitude, point.coords.longitude, newPoint.coords.latitude, newPoint.coords.longitude) < 10);

			if (nearPoint !== undefined)
			{
				currentPoints = currentPoints.map(point =>
				{
					if (point.coords.latitude === nearPoint.coords.latitude && point.coords.longitude === nearPoint.coords.longitude)
					{
						return {...point, timestamp: newPoint.timestamp};
					}

					return point;
				});
			}
			else
			{
				currentPoints = [...currentPoints, newPoint];
				log(selectedTrackPreviousState.name + ': ' + JSON.stringify(newPoint));
				fetch('https://api.smartarget.online/geodata', {method: "POST", body: JSON.stringify({...selectedTrackPreviousState, points: currentPoints})});
			}

			return {...selectedTrackPreviousState, points: currentPoints};
		});

		/*const currTaskOptions = await TaskManager.getTaskOptionsAsync(LOCATION_TRACKING);
		if (steps === 0 && currTaskOptions.timeInterval === currTaskOptions.timeIntervalLow)
		{
			global.redefineTaskWithParams({...currTaskOptions, timeInterval: currTaskOptions.timeIntervalHigh});
		}
		else if (steps !== 0 && currTaskOptions.timeInterval === currTaskOptions.timeIntervalHigh)
		{
			global.redefineTaskWithParams({...currTaskOptions, timeInterval: currTaskOptions.timeIntervalLow});
		}
		else
		{
			global.setSelectedTrack(selectedTrackPreviousState =>
			{
				//log(selectedTrackPreviousState.name + ': ' + JSON.stringify(newPoint));
				return {...selectedTrackPreviousState, points: [...selectedTrackPreviousState.points, newPoint]};
			});
		}*/
	}
});

export function Main ()
{
	const { showActionSheetWithOptions } = useActionSheet();

	const tracks = useSelector(state => state.main.tracks);

	const savedTr = useSelector(state => state.main.selectedTrack);
	const [selectedTrack, setSelectedTrack] = useState(null);

	const [newTrackName, setNewTrackName] = useState("");
	const [location, setLocation] = useState(null);
	const [runned, setRunned] = useState(false);
	const [intervalSeconds, setIntervalSeconds] = useState("90");
	const [acc, setAcc] = useState("5");
	const [distanceInterval, setDistanceInterval] = useState("50");
	const [pausesUpdatesAutomatically, setPausesUpdatesAutomatically] = useState(false);

	const startLocationTracking = async (acc, timeInterval, timeIntervalLow, timeIntervalHigh) => {

		let accuracy;
		switch (+acc)
		{
			case 6:
				accuracy = LocationAccuracy.BestForNavigation;
				break;
			case 5:
				accuracy = LocationAccuracy.Highest;
				break;
			case 4:
				accuracy = LocationAccuracy.High;
				break;
			case 3:
				accuracy = LocationAccuracy.Balanced;
				break;
			case 2:
				accuracy = LocationAccuracy.Low;
				break;
			default:
				accuracy = LocationAccuracy.Lowest;
		}

		try
		{
			await runTask({
				showsBackgroundLocationIndicator: true,
				accuracy: accuracy,
				timeInterval,
				deferredUpdatesInterval: timeInterval,

				activityType: LocationActivityType.Fitness,
				pausesUpdatesAutomatically,

				distanceInterval: +distanceInterval
			});
		}
		catch (e)
		{
			log('error running tracking: ' + e.toString());
		}
	};

	useEffect(() => {
		const config = async () => {
			let res = await Permissions.askAsync(Permissions.LOCATION);
			if (res.status !== 'granted') {
				alert('permissiom denied! please allow it: ' + res.status);
			} else {
			}
		};
		config();
	}, []);

	useEffect(() =>
	{
		(async () =>
		{
			const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.High});
			setLocation(location);
		})();
	}, []);

	useEffect(() =>
	{
		if (savedTr)
		{
			setSelectedTrack(savedTr);
		}
	}, []);

	useEffect(() =>
	{
		global.setSelectedTrack = setSelectedTrack;
	}, [selectedTrack]);

	useEffect(() =>
	{
		if (selectedTrack)
		{
			setTracks(tracks.map(track =>
			{
				if (track.id === selectedTrack.id)
				{
					return selectedTrack;
				}
				return track;
			}));

			saveSelectedTrack(selectedTrack);
		}
	}, [selectedTrack]);

	async function runTask (params)
	{
		try
		{
			await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
		}
		catch (e)
		{

		}
		await Location.startLocationUpdatesAsync(LOCATION_TRACKING, params);
	}

	useEffect(() => {

		(async () =>
		{
			if (runned)
			{
				const av = await Pedometer.isAvailableAsync();
				let intervalSecondsFact = intervalSeconds;
				if (intervalSecondsFact < 1000)
				{
					intervalSecondsFact = intervalSecondsFact * 1000;
				}

				if (av)
				{
					const start = new Date();
					start.setMinutes(start.getMinutes() - 1);
					let {steps} = await Pedometer.getStepCountAsync(start, new Date());
					if (false && steps === 0)
					{
						intervalSecondsFact = intervalSecondsFact * 3;
					}
				}

				startLocationTracking(acc, intervalSecondsFact, intervalSeconds, intervalSeconds * 3);
			}
			else
			{
				try
				{
					await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
				}
				catch (e)
				{

				}
			}
		})();
	}, [runned, intervalSeconds, acc, distanceInterval, pausesUpdatesAutomatically]);

	function addTrack ()
	{
		setTracks([...tracks, {id: Math.round(Math.random() * 100000000000000), name: newTrackName, points: []}]);
		setNewTrackName('');
	}

	function renderTrackItem ({item})
	{
		const isSelected = item.id === selectedTrack?.id;

		return (
			<TouchableOpacity onLongPress={() => confirmDelete(item)} onPress={() => {
				setSelectedTrack(item);
				setRunned(false);
			}} style={{padding: 8, borderRadius: 3, marginRight: 10, borderWidth: 1, borderColor: "#00990020", backgroundColor: isSelected ? "#00ff0040" : '#fff'}}>
				<Text>{item.name} ({item.points.length})</Text>
			</TouchableOpacity>
		);
	}

	function confirmDelete (trackForDelete)
	{
		Alert.alert('Удалить трек?', '', [
			{
				text: 'Отмена',
				style: 'cancel',
			},
			{ text: 'Удалить', onPress: () => {
					setTracks(tracks.filter(_ => _.id !== trackForDelete.id));
					if (trackForDelete.id === selectedTrack?.id)
					{
						setSelectedTrack(null);
					}
				} },
		]);
	}

	function renderFooter ()
	{
		return (
			<View style={{flexDirection: "row", height: 35}}>
				<TextInput placeholder="Название нового трека" style={{paddingHorizontal: 7, borderWidth: 1, borderColor: "#eee", borderRadius: 8, width: 200}} value={newTrackName} onChangeText={setNewTrackName}/>
				<Button title="Добавить" onPress={addTrack} disabled={!newTrackName}/>
			</View>
		);
	}

	function openIntervalSheet ()
	{
		const options = ['1 секунда', '2 секунды', '2.5 секунды', '3 секунды', '5 секунд', '10 секунд', '30 секунд', '45 секунд', '60 секунд', '90 секунд', 'Отмена'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex
			},
			(buttonIndex) => {
				if (options[buttonIndex] !== 'Отмена')
				{
					setIntervalSeconds(parseFloat(options[buttonIndex]));
				}
			}
		);
	}

	function openAccSheet ()
	{
		const options = ['1 - низкая точность', '2', '3', '4', '5', '6 - высокая точность', 'Отмена'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex
			},
			(buttonIndex) => {
				if (options[buttonIndex] !== 'Отмена')
				{
					setAcc(parseFloat(options[buttonIndex]));
				}
			}
		);
	}

	function openDistSheet ()
	{
		const options = ['5', '10', '15', '20', '25', '30', '35', '40', '50', '60', '75', '85', '100', '115', '125', '150', '175', '200', '225', 'Отмена'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex
			},
			(buttonIndex) => {
				if (options[buttonIndex] !== 'Отмена')
				{
					setDistanceInterval(parseFloat(options[buttonIndex]));
				}
			}
		);
	}

	async function upload ()
	{
		for await (let track of tracks)
		{
			await fetch('https://api.smartarget.online/geodata', {method: "POST", body: JSON.stringify(track)});
		}
	}

	function openPausesSheet ()
	{
		const options = ["true", "false", 'Отмена'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex
			},
			(buttonIndex) => {
				if (options[buttonIndex] !== 'Отмена')
				{
					setPausesUpdatesAutomatically(options[buttonIndex] === "true" ? true : false);
				}
			}
		);
	}


	return (
		<SafeAreaView style={styles.container}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingVertical: 10}}>

				<View style={{paddingHorizontal: 10}}>
					<FlatList style={{marginTop: 10, marginBottom: 10}} data={tracks} horizontal={true} showsHorizontalScrollIndicator={false} renderItem={renderTrackItem} ListFooterComponent={renderFooter()}/>

					<ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{flexDirection: "row", alignItems: "center"}}>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={openIntervalSheet}>
							<Text>Интервал {intervalSeconds} сек</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={openAccSheet}>
							<Text>Уровень точности: {acc}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={openDistSheet}>
							<Text>Интервал метров: {distanceInterval}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={openPausesSheet}>
							<Text>Pauses updates automatically: {pausesUpdatesAutomatically ? 'true' : 'false'}</Text>
						</TouchableOpacity>

					</ScrollView>

					<TouchableOpacity disabled={!selectedTrack} style={{marginTop: 10, marginBottom: 20, backgroundColor: runned ? "#ff000040" : "#00ff0040", paddingVertical: 10, marginRight: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={() => setRunned(!runned)}>
						<Text>{runned ? 'Остановить запись' : (selectedTrack ? 'Начать запись точек в трек' : 'Выберите или создайте трек')}</Text>
					</TouchableOpacity>

					<TouchableOpacity style={{marginTop: 10, marginBottom: 20, backgroundColor: runned ? "#ff000040" : "#00ff0040", paddingVertical: 10, marginRight: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} onPress={() => upload()}>
						<Text>Бахнуть данные на сервак</Text>
					</TouchableOpacity>

				</View>

				{/*<TextInput value={JSON.stringify(tracks)}/>*/}

				{
					location &&
					<MapView /*provider={PROVIDER_GOOGLE} */style={{width: '100%', height: Dimensions.get('window').height - 200}} initialRegion={{
						latitude: (selectedTrack?.points[0]?.coords?.latitude) || location.coords.latitude,
						longitude: (selectedTrack?.points[0]?.coords?.longitude) || location.coords.longitude,
						longitudeDelta: 0.0005,
						latitudeDelta: 0.0005
					}} liteMode={false}>

						<MapMarker flat={true} pinColor="#000" coordinate={{
							latitude: (selectedTrack?.points[0]?.coords?.latitude) || location.coords.latitude,
							longitude: (selectedTrack?.points[0]?.coords?.longitude) || location.coords.longitude
						}}/>
						{
							(selectedTrack?.points || []).map(point =>
								<MapMarker key={point.id}
								           title= {
									           new Date(point.timestamp).getHours().toString().padStart(2, '0') + ':'
									           + new Date(point.timestamp).getMinutes().toString().padStart(2, '0') + ':'
									           + new Date(point.timestamp).getSeconds().toString().padStart(2, '0')
								           }
								           coordinate={{latitude: point.coords.latitude, longitude: point.coords.longitude}}/>
							)
						}

						<Polyline
							coordinates={(selectedTrack?.points || []).map(point => ({latitude: point.coords.latitude, longitude: point.coords.longitude}))}
							strokeColor="#000"
							strokeColors={['#7F0000']}
							strokeWidth={6}
						/>
					</MapView>
				}

			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
});
