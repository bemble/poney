import store from "../../Store";
import Api from "../../../../core/Api";

export default async function updateField(lineId, name, value) {
    const line = await Api.addOrUpdate(`budget_line`, lineId, {
        [name]: value,
        idBudget: store.getState().idBudget
    });
    return line.id;
};