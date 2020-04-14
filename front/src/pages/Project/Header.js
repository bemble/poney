import React, {useEffect, useState} from "react";
import store from "./Store";
import {
    faFileInvoiceDollar,
    faHandHoldingUsd,
    faCalendarCheck, faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";

export default React.memo(() => {
    const storeState = store.getState();
    const [amount, setAmount] = useState(storeState.Amount);
    const [expected, setExpected] = useState(storeState.Expected);
    const [alreadyPaid, setAlreadyPaid] = useState(storeState.AlreadyPaid);

    useEffect(() => {
        store.subscribe(() => {
            const {Amount, Expected, AlreadyPaid} = store.getState();
            setAmount(Amount);
            setExpected(Expected);
            setAlreadyPaid(AlreadyPaid);
        });
    }, []);

    const totalDiff = expected - amount - alreadyPaid;

    const data = [{
        title: "Total payé",
        isAmount: true,
        color: (totalDiff < 0 ? "red" : "green"),
        icon: faHandHoldingUsd,
        content: amount + alreadyPaid
    }, {
        title: "Total prévu",
        isAmount: true,
        color: "blueGrey",
        icon: faFileInvoiceDollar,
        content: expected
    }, {
        title: "Total payé lors de la fin du projet",
        isAmount: true,
        color: "teal",
        icon: faCalendarCheck,
        content: amount
    }, {
        title: "Total prévu lors de la fin du projet",
        isAmount: true,
        color: "blueGrey",
        icon: faCalendarAlt,
        content: expected - alreadyPaid
    }];

    return <Header data={data}/>;
});