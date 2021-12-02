import {persistReducer, persistStore} from "redux-persist";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import main, {setSelectedTrack, setTest, setTracks} from './ducks/main';
import AsyncStorage from '@react-native-async-storage/async-storage';

export let persistorLink;

export function configureStore ()
{
    const middlewares = [];
    const withStorage = true;

    const rootReducer = combineReducers({
        main : withStorage ? persistReducer({key: "main", storage : AsyncStorage, blacklist: []}, main) : main,
    });

    const enhancer = compose(applyMiddleware(...middlewares));
    const store = createStore(rootReducer, enhancer);
    const persistor = persistStore(store);
    persistorLink = persistor;

    assignActionsCreators(store);

    return {store, persistor};
}

function assignActionsCreators (store) {
    setTest.assignTo(store);
	setTracks.assignTo(store);
	setSelectedTrack.assignTo(store);
}
