import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import structure from "reducers/structure";

export default (history) => combineReducers({
	router: connectRouter(history),
	structure
});
