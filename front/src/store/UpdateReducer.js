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
            case "SKIP_WAITING":
                const registrationWaiting = state.serviceWorkerRegistration && state.serviceWorkerRegistration.waiting;
                if (registrationWaiting) {
                    registrationWaiting.postMessage({type: 'SKIP_WAITING'});

                    registrationWaiting.addEventListener('statechange', e => {
                        if (e.target.state === 'activated') {
                            window.location.reload(true);
                        }
                    });
                }
                break;
            default:
        }
    });
};