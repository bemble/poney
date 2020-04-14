import store from "../../Store";
import Api from "../../../../core/Api";

export default async function updateField(lineId, name, value) {
    const line = await Api.addOrUpdate(`project_line`, lineId, {
        [name]: value,
        idProject: store.getState().idProject
    });
    return line.id;
};