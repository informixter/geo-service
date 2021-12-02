import * as React from 'react';
import {
	SafeAreaView, ScrollView,
	StyleSheet
} from "react-native";


export function Main ()
{
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingVertical: 10}}>

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
