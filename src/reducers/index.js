import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import structure from "reducers/structure";
import camera from "reducers/camera";
import keyboard from "reducers/keyboard";

export default (history) => combineReducers({
	router: connectRouter(history),
	structure,
	camera,
	keyboard
});

