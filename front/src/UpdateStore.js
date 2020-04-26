import {createStore} from 'redux';

const initialState = {
    serviceWorkerInitialized: false,
    serviceWorkerUpdated: false,
    serviceWorkerRegistration: null,
};

function updateReducer(state = {}, action) {
    switch (action.type) {
        case "SW_INIT":
            return {
                ...state,
                serviceWorkerInitialized: !state.serviceWorkerInitialized,
            };
        case "SW_UPDATE":
            return {
                ...state,
                serviceWorkerUpdated: !state.serviceWorkerUpdated,
                serviceWorkerRegistration: action.payload,
            };
        default:
            return state;
    }
}

const store = createStore(updateReducer, initialState);
export default store;