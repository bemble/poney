import React, {useEffect, useState} from 'react';
import {
    Fab, makeStyles, Switch, FormControlLabel
} from "@material-ui/core";
import {Add as AddIcon} from "@material-ui/icons";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import EditDialog from "./EditDialog";
import List from "./List";
import moment from "moment";
import AddExpense from "./AddExpense";
import {useParams, useHistory} from "react-router-dom";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    tools: {
      padding: theme.spacing(1)
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    }
}));

export default React.memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const [isInnerLoading, setIsInnerLoading] = useState(true);
    const [data, setData] = useState([]);
    const [edit, setEdit] = useState(null);
    const [showHidden, setShowHidden] = useState(false);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [addExpenseProjectId, setAddExpenseProjectId] = useState(0);
    const projectId = useParams().id;
    const history = useHistory();

    const load = async (isFirst) => {
        isFirst ? setIsLoading(true) : setIsInnerLoading(true);
        const data = await Api.service(`projects/summaries`);
        data.forEach(line => {
            line.endAt = moment.unix(line.endAt);
        });
        isFirst ? setIsLoading(false) : setIsInnerLoading(false);
        setData(data);
    };

    useEffect(() => {
        setAddExpenseProjectId(projectId);
        load(true);
    }, [projectId]);

    const handleDelete = async (id) => {
        await Api.delete(`project`, id);
        load();
    };

    const handleClose = async (saved) => {
        setEdit(null);
        setDisplayDialog(false);
        if (saved) {
            load();
        }
    };

    const handleAddExpenseClose = async () => {
        history.push(`/projets/${addExpenseProjectId}/recapitulatif`);
    };

    const classes = useStyles();

    return <div>
        <Title displayLoading={isInnerLoading}>Projets</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading && data && data.filter(l => l.hidden).length ? <div className={classes.tools}>
            <FormControlLabel control={<Switch onChange={(e) => setShowHidden(e.target.checked)} checked={showHidden}/>}
                              label="Afficher les projets cachés"/>
        </div> : null}
        {!isLoading && data ?
            <List lines={data.filter(l => showHidden || !l.hidden)} onEdit={setEdit} onDelete={handleDelete}/> : null}
        {displayDialog || edit ? <EditDialog onClose={(saved) => handleClose(saved)} {...edit}/> : null}
        <AddExpense projectId={addExpenseProjectId} onClose={handleAddExpenseClose}/>
        <Fab aria-label="Créer un nouveau projet" className={classes.fab} color="primary"
             onClick={() => setDisplayDialog(true)}>
            <AddIcon/>
        </Fab>
    </div>
});