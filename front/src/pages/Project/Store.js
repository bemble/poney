import {createStore} from 'redux';

const initialState = {
    idProject: -1,
    Expected: 0,
    AlreadyPaid: 0,
    Amount: 0
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
["Amount", "Expected", "AlreadyPaid"].forEach(op => {
    store[`add${op}`] = (value) => {
        store.dispatch({type: `ADD`, field: op, value});
    };
    store[`set${op}`] = (value) => {
        store.dispatch({type: `SET`, field: op, value});
    };
});
store.setProject = (idProject) => {
    store.dispatch({type: "SET", field: "idProject", value: idProject});
};

store.refreshFromDatabase = async (id) => {
    if (!id) {
        id = store.getState().idProject;
    }

    /*const [counts] = await Database.all(`SELECT
                                           SUM(amount)            AS Amount,
                                           SUM(expectedAmount)    AS Expected,
                                           SUM(alreadyPaidAmount) AS AlreadyPaid
                                         FROM projectLine
                                         WHERE idProject = ?`, [id]);

    ["Amount", "Expected", "AlreadyPaid"].forEach(op => {
        store[`set${op}`](counts[op]);
    });*/
};

export default store;