import React, {useEffect, useState} from 'react';
import {Fab, Paper, Tab, Tabs} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import BudgetTable from "./BudgetTable";
import Header from "./Header";
import store from "./Store";
import Api from "../../core/Api";
import EditDialog from "./EditDialog";
import {Add as AddIcon} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        marginBottom: 64
    },
    fab: {
        position: 'fixed',
        bottom: `calc(64px + ${theme.spacing(2)}px + env(safe-area-inset-bottom))`,
        right: theme.spacing(2),
    },
}));

export default function Budget(props) {
    const [idBudget, setIdBudget] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [budget, setBudget] = useState(null);
    const [lines, setLines] = useState([]);
    const [currentPanel, setCurrentPanel] = useState(0);

    const [edit, setEdit] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);

    const load = async (id) => {
        id = id || idBudget || store.getState().idBudget;

        setIsLoading(true);
        setBudget(await Api.get(`budget`, id));
        setLines(await Api.search(`budget_line`, {$where: {idBudget: id}, $orderBy:["order", "id"]}));
        await store.refreshFromDatabase(id);
        setIsLoading(false);
    };

    useEffect(() => {
        const {id} = props.match.params;
        store.setBudget(id);
        setIdBudget(id);
        (async () => {
            await load(id);
        })();
    }, []);

    const handleClose = async (saved) => {
        setEdit(null);
        setDisplayDialog(false);
        if (saved) {
            (async () => {
                await load();
            })();
        }
    };

    const classes = useStyles();
    return <div>
        <Title>{budget ? budget.label : 'Budget'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <div className={classes.root}>
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
            <Fab aria-label="Ajouter une nouvelle ligne" className={classes.fab} color="primary"
                 onClick={() => setDisplayDialog(true)}>
                <AddIcon/>
            </Fab>
            {displayDialog || edit ? <EditDialog onClose={(saved) => handleClose(saved)} {...edit} idBudget={idBudget}
                                                 isIncome={currentPanel === 1}/> : null}
        </div> : null}
    </div>;
};