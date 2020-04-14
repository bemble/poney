import {createStore} from 'redux';
import Api from "../../core/Api";

const initialState = {
    idBudget: -1,
    incomes: 0,
    expenses: 0,
    transfers: 0
};

function budgetReducer(state = initialState, action) {
    switch (action.type) {
        case 'ADD':
            return Object.assign({}, state, {
                [action.field]: state[action.field] + action.value
            });
        case "SET":
            return Object.assign({}, state, {
                [action.field]: action.value
            });
        default:
            return state;
    }
}

const store = createStore(budgetReducer);
["Income", "Expense", "Transfer"].forEach(op => {
    store[`add${op}`] = (value) => {
        store.dispatch({type: `ADD`, field: op.toLowerCase() + "s", value});
    };
    store[`set${op}`] = (value) => {
        store.dispatch({type: `SET`, field: op.toLowerCase() + "s", value});
    };
});
store.setBudget = (idBudget) => {
    store.dispatch({type: "SET", field: "idBudget", value: idBudget});
};

store.refreshFromDatabase = async (id) => {
    if (!id) {
        id = store.getState().idBudget;
    }

    const counts = await Api.service(`budgets/totals/${id}`);

    ["Income", "Expense", "Transfer"].forEach(op => {
        store[`set${op}`](counts[op.toLowerCase() + "s"]);
    });
};

export default store;