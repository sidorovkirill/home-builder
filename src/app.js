import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import store from 'store';
import history from 'store/history';
import Editor from 'components/editor';
import { ConnectedRouter } from "connected-react-router";
import createKeyboardTracker from "utils/keyboard-tracker";

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Editor/>
    </ConnectedRouter>
  </Provider>
);

createKeyboardTracker(store);

export default hot(App);
