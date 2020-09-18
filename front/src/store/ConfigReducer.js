export default function appReducer(state = {}, action) {
    switch (action.type) {
        case "SET_CONFIG":
            const newValues = Object.assign({}, action);
            delete newValues.type;
            return Object.assign({}, state, newValues);
        default:
            return state;
    }
};