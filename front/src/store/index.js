import {createStore, combineReducers} from "redux";

import app from "./AppReducer";
import config from "./ConfigReducer";
import update from "./UpdateReducer";

const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({name: "Poney"});
const reducer = combineReducers({app, config, update});
const store = createStore(reducer, enhancer);

export default store;