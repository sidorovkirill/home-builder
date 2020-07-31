import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import store from 'store';
import history from 'store/history';
import Editor from 'components/editor';
import { ConnectedRouter } from "connected-react-router";

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Editor/>
    </ConnectedRouter>
  </Provider>
);

export default hot(App);
