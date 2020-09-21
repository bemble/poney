import produce from "immer";

const initialState = {
    token: ""
};

export default function projectReducer(state = initialState, {type, app}) {
    return produce(state, draft => {
        if (!app) return;
        switch (type) {
            case "SET":
                Object.keys(app).forEach(k => draft[k] = app[k]);
                break;
            default:
        }
    });
};