import {createStore, combineReducers} from "redux";

import app from "./AppReducer";
import budget from "./BudgetReducer";
import config from "./ConfigReducer";
import update from "./UpdateReducer";
import project from "./ProjectReducer";

const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({name: "Poney"});
const reducer = combineReducers({app, config, budget, update, project});
const store = createStore(reducer, enhancer);

export default store;