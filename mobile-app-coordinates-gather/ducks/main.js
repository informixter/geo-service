import {createAction, createReducer} from "redux-act";

export const setTest = createAction('gogo test');
export const setTracks = createAction('gogo test');
export const setSelectedTrack = createAction('gogo test');

const initialState =  {
    test : '12312312',
	tracks: [],
	selectedTrack: null,
};

const main = createReducer({
    [setTest]: (state, payload) => ({...state, test: payload}),
    [setTracks]: (state, payload) => ({...state, tracks: payload}),
    [setSelectedTrack]: (state, payload) => ({...state, selectedTrack: payload}),
}, initialState);

export default main;
