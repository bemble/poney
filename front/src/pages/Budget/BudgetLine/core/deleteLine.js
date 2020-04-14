import Api from "../../../../core/Api";

export default async function deleteLine(lineId) {
    return Api.delete(`budget_line`, lineId);
};