import {createStore} from 'redux';

const initialState = {
    token: "",
    config: {}
};

function appReducer(state = initialState, action) {
    switch (action.type) {
        case "SET":
            const newValues = Object.assign({}, action);
            delete newValues.type;
            return Object.assign({}, state, newValues);
        default:
            return state;
    }
}

const store = createStore(appReducer);
store.setToken = (token) => {
    store.dispatch({type: "SET", token});
};

export default store;