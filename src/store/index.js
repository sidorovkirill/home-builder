import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createRootReducer from "reducers";
import history from './history';
import { routerMiddleware as createRouterMiddleware } from "connected-react-router";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

const routerMiddleware = createRouterMiddleware(history);
const defaultMiddleware = getDefaultMiddleware({ thunk: true });

const middleware = [...defaultMiddleware, routerMiddleware];
const reducer = createRootReducer(history);


const store = configureStore({
  reducer,
  devTools: true,
  middleware,
});



export default store;
