const initialState = {
    serviceWorkerInitialized: false,
    serviceWorkerUpdated: false,
    serviceWorkerRegistration: null,
};

export default function updateReducer(state = initialState, action) {
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
};