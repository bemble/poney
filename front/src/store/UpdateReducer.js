import produce from "immer";

const initialState = {
    serviceWorkerInitialized: false,
    serviceWorkerUpdated: false,
    serviceWorkerRegistration: null,
};

export default function updateReducer(state = initialState, action) {
    return produce(state, draft => {
        switch (action.type) {
            case "SW_INIT":
                draft.serviceWorkerInitialized = !state.serviceWorkerInitialized;
                break;
            case "SW_UPDATE":
                draft.serviceWorkerUpdated = !state.serviceWorkerUpdated;
                draft.serviceWorkerRegistration = action.payload;
                break;
            default:
        }
    });
};