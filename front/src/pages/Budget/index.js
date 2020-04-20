import React, {useEffect, useState} from 'react';
import {Paper, Tab, Tabs} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import BudgetTable from "./BudgetTable";
import Header from "./Header";
import store from "./Store";
import Api from "../../core/Api";
import EditDialog from "./BudgetLine/EditDialog";

export default function Budget(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [budget, setBudget] = useState(null);
    const [lines, setLines] = useState([]);
    const [currentPanel, setCurrentPanel] = useState(0);

    const [edit, setEdit] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);

    const load = async (id) => {
        id = id || store.getState().idBudget;

        setIsLoading(true);
        setBudget(await Api.get(`budget`, id));
        setLines(await Api.search(`budget_line`, {$where: {idBudget: id}}));
        await store.refreshFromDatabase(id);
        setIsLoading(false);
    };

    useEffect(() => {
        const {id} = props.match.params;
        store.setBudget(id);
        load(id);
    }, []);

    const handleClose = async (saved) => {
        setEdit(null);
        setDisplayDialog(false);
        if (saved) {
            load();
        }
    };

    return <div>
        <Title>{budget ? budget.label : 'Budget'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <div>
            <Header/>
            <Tabs
                value={currentPanel}
                indicatorColor="primary"
                textColor="primary"
                aria-label="Configuration"
                onChange={(e, currentPanel) => setCurrentPanel(currentPanel)}
            >
                <Tab label="Débits"/>
                <Tab label="Crédits"/>
            </Tabs>
            <Paper hidden={currentPanel !== 0}>
                <BudgetTable budgetId={props.match.params.id} lines={lines.filter(d => !d.isIncome)}
                             onEditLine={(line) => setEdit(line)}/>
            </Paper>
            <Paper hidden={currentPanel !== 1}>
                <BudgetTable budgetId={props.match.params.id} isIncome={true}
                             lines={lines.filter(d => !!d.isIncome)}
                             onEditLine={(line) => setEdit(line)}/>
            </Paper>
            {displayDialog || edit ? <EditDialog onClose={(saved) => handleClose(saved)} {...edit}/> : null}
        </div> : null}
    </div>;
};