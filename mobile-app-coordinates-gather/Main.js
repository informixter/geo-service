import * as React from 'react';
import {
	SafeAreaView, ScrollView,
	StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import MapView from "react-native-maps/lib/components/MapView";
import MapMarker from "react-native-maps/lib/components/MapMarker";
import {useSelector} from "react-redux";
import {useState} from "react";


export function Main ()
{
	const tracks = useSelector(state => state.main.tracks);

	/**
	 * параметры процесс беграунд записи location
	 */
	const [location, setLocation] = useState(null);
	const [intervalSeconds, setIntervalSeconds] = useState(null);
	const [acc, setAcc] = useState(null);
	const [distanceInterval, setDistanceInterval] = useState( null);
	const [pausesUpdatesAutomatically, setPausesUpdatesAutomatically] = useState(false);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingVertical: 10}}>

				<View style={{paddingHorizontal: 10}}>

					<ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{flexDirection: "row", alignItems: "center"}}>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}}>
							<Text>Интервал {intervalSeconds} сек</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} >
							<Text>Уровень точности: {acc}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} >
							<Text>Интервал метров: {distanceInterval}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{marginRight: 5, backgroundColor: "#f5f5f550", padding: 5, alignItems: "center", borderWidth: 1, borderRadius: 4}} >
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
