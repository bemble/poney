import {createStore} from 'redux';

const initialState = {
    isMenuOpen: false,
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
store.toggleMenu = () => {
    store.dispatch({type: "SET", isMenuOpen: !store.getState().isMenuOpen});
};
store.openMenu = () => {
    store.dispatch({type: "SET", isMenuOpen: true});
};
store.closeMenu = () => {
    store.dispatch({type: "SET", isMenuOpen: false});
};
store.setToken = (token) => {
    store.dispatch({type: "SET", token});
};

export default store;