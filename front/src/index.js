import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '../node_modules/react-vis/dist/style.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
//import store from "./UpdateStore";

const updateVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};
window.addEventListener('resize', updateVh);
updateVh();

ReactDOM.render(<App/>, document.getElementById('root'));

/*serviceWorker.register({
    onSuccess: () => store.dispatch({type: "SW_INIT"}),
    onUpdate: reg => store.dispatch({type: "SW_UPDATE", payload: reg}),
});*/
serviceWorker.unregister();