import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import BudgetTable from "./BudgetTable";
import Header from "./Header";
import store from "./Store";
import Api from "../../core/Api";

export default function Budget(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [budget, setBudget] = useState(null);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const {id} = props.match.params;
        store.setBudget(id);

        (async () => {
            setBudget(await Api.get(`budget`, id));
            setLines(await Api.search(`budget_line`, {$where: {idBudget: id}}));
            await store.refreshFromDatabase(id);
            setIsLoading(false);
        })();
    }, []);

    return <div>
        <Title>{budget ? budget.label : 'Budget'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <Grid container spacing={1}>
            <Header/>
            <Grid item xs={12}>
                <BudgetTable budgetId={props.match.params.id} lines={lines.filter(d => !d.isIncome)}/>
            </Grid>
            <Grid item xs={12}>
                <BudgetTable budgetId={props.match.params.id} isIncome={true}
                             lines={lines.filter(d => !!d.isIncome)}/>
            </Grid>
        </Grid> : null}
    </div>;
};