import React, {useEffect, useState} from "react";
import store from "./Store";
import {
    faPiggyBank,
    faBalanceScale,
    faLevelUpAlt,
    faLevelDownAlt
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";

export default React.memo(() => {
    const storeState = store.getState();
    const [incomes, setIncomes] = useState(storeState.incomes);
    const [expenses, setExpenses] = useState(storeState.expenses);
    const [transfers, setTransfers] = useState(storeState.transfers);

    useEffect(() => {
        store.subscribe(() => {
            const {incomes, expenses, transfers} = store.getState();
            setIncomes(incomes);
            setExpenses(expenses);
            setTransfers(transfers);
        });
    }, []);

    const totalDiff = incomes - expenses;

    const data = [{
        title: "Équilibre crédits/débits",
        isAmount: true,
        color: (totalDiff < 50 ? "red" : "green"),
        icon: faBalanceScale,
        content: totalDiff
    }, {
        title: "Crédits",
        isAmount: true,
        color: "teal",
        icon: faLevelUpAlt,
        content: incomes
    }, {
        title: "Débits",
        isAmount: true,
        color: "amber",
        icon: faLevelDownAlt,
        content: expenses
    }, {
        title: "Montant à virer sur le compte d'épargne",
        isAmount: true,
        color: "blueGrey",
        icon: faPiggyBank,
        content: transfers
    }];

    return <Header data={data}/>;
});