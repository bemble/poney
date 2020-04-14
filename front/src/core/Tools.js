import moment from "moment";
import "moment/locale/fr";

export function formatDate(d) {
    const m = typeof d === "number" ? moment.utc(d, 'X') : moment(d);
    return m.format("L");
}

export function formatNumber(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
}