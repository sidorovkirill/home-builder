import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: "Trebuchet MS";
  }
  
  button {
    font-family: "Trebuchet MS";
  }
`;

import App from './app';

ReactDOM.render(
  <React.Fragment>
    <GlobalStyle/>
    <App/>
  </React.Fragment>,
  document.getElementById('root'));
