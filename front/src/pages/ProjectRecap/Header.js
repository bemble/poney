import React, {useEffect, useState} from "react";
import store from "../../store";
import {
    faFileInvoiceDollar,
    faHandHoldingUsd,
    faCalendarCheck, faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";

export default React.memo(() => {
    const {project} = store.getState();
    const [amount, setAmount] = useState(project.amount);
    const [expected, setExpected] = useState(project.expected);
    const [alreadyPaid, setAlreadyPaid] = useState(project.alreadyPaid);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const {amount, expected, alreadyPaid} = store.getState().project;
            setAmount(amount);
            setExpected(expected);
            setAlreadyPaid(alreadyPaid);
        });
        return () => unsubscribe();
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