import produce from "immer";

const initialState = {
    id: -1,
    editLineId: -1,
    expected: 0,
    alreadyPaid: 0,
    amount: 0,
    info: {},
    lines: []
};

export default function projectReducer(state = initialState, {type, project}) {
    return produce(state, draft => {
        if (!project) return;
        switch (type) {
            case 'ADD':
                Object.keys(project).forEach(k => draft[k] += project[k]);
                break;
            case "SET":
                Object.keys(project).forEach(k => draft[k] = project[k]);
                break;
            case "DELETE":
                Object.keys(project).forEach(k => {
                    if (k === "lines") {
                        const line = draft[k][project[k]];
                        draft.amount -= line.amount;
                        draft.expected -= line.expectedAmount;
                        draft.alreadyPaid -= line.alreadyPaidAmount;
                    }
                    draft[k].splice(project[k], 1);
                });
                break;
            default:
        }
    });
};