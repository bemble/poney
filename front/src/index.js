import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '../node_modules/react-vis/dist/style.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const updateVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};
window.addEventListener('resize', updateVh);
updateVh();

ReactDOM.render(<App/>, document.getElementById('root'));
serviceWorker.register({onUpdate: () => window.location.reload(true)});
