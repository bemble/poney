import produce from "immer";

const initialState = {
    id: -1,
    income: 0,
    expense: 0,
    transfer: 0
};

export default function budgetReducer(state = initialState, {type, budget}) {
    return produce(state, draft => {
        if (!budget) return;
        switch (type) {
            case 'ADD':
                Object.keys(budget).forEach(k => draft[k] += budget[k]);
                break;
            case "SET":
                Object.keys(budget).forEach(k => draft[k] = budget[k]);
                break;
            default:
        }
    });
};