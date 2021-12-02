import React from 'react';
import {configureStore} from "./store";
import {Provider} from "react-redux";
import {PersistGate} from 'redux-persist/integration/react'
import {Main} from "./Main";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const storage = configureStore();

export default function App ()
{
	return (
		<Provider store={storage.store}>
			<PersistGate persistor={storage.persistor}>
				<ActionSheetProvider>
					<Main/>
				</ActionSheetProvider>
			</PersistGate>
		</Provider>
	);
}
