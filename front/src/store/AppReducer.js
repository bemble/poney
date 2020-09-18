const initialState = {
    token: ""
};

export default function appReducer(state = initialState, action) {
    switch (action.type) {
        case "SET":
            const newValues = Object.assign({}, action);
            delete newValues.type;
            return Object.assign({}, state, newValues);
        default:
            return state;
    }
};