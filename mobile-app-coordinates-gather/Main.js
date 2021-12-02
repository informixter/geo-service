import * as React from 'react';
import {
	SafeAreaView, ScrollView,
	StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import MapView from "react-native-maps/lib/components/MapView";
import MapMarker from "react-native-maps/lib/components/MapMarker";
import {useState} from "react";
import {useActionSheet} from "@expo/react-native-action-sheet";


export function Main ()
{
	const { showActionSheetWithOptions } = useActionSheet();

	const [location, setLocation] = useState(null);
	const [intervalSeconds, setIntervalSeconds] = useState("90");
	const [acc, setAcc] = useState("5");
	const [distanceInterval, setDistanceInterval] = useState("50");
	const [pausesUpdatesAutomatically, setPausesUpdatesAutomatically] = useState(false);

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

	function openPausesSheet ()
	{
		const options = ["tr    ue", "false", 'Отмена'];
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

				</View>

				{
					location &&
					<MapView /*provider={PROVIDER_GOOGLE} */style={{width: '100%', height: Dimensions.get('window').height - 200}} initialRegion={{
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						longitudeDelta: 0.0005,
						latitudeDelta: 0.0005
					}} liteMode={false}>

						<MapMarker flat={true} pinColor="#000" coordinate={{
							latitude: location.coords.latitude,
							longitude: location.coords.longitude
						}}/>

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
