import React, {useEffect, useState} from 'react';
import {Fab, Grid} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import Table from "./Table";
import Header from "./Header";
import store from "../../store";
import moment from "moment";
import {useParams} from "react-router-dom";
import Api from "../../core/Api";
import {Add as AddIcon} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import EditLineDialog from "./EditLineDialog";

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

export default function Project() {
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState(null);
    const {id} = useParams();

    const load = async () => {
        const info = await Api.get(`project`, id);
        info.endAt = moment.unix(info.endAt);
        setProject(info);
        const lines = (await Api.search(`project_line`, {$where: {idProject: id}})) || [];
        const totals = (await Api.service(`projects/totals/${id}`));
        store.dispatch({
            type: "SET",
            project: {id, info, lines, ...totals}
        });

        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            await load();
        })();
    }, []);

    const handleAddLine = async () => {
        store.dispatch({
            type: "SET",
            project: {editLineId: 0}
        });
    };

    const handleSaved = async () => {
        (async () => {
            await load();
        })();
    };
    const classes = useStyles();

    return <div>
        <Title>{project ? project.label : 'Projet'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <Grid container spacing={1} className={classes.root}>
            <Header/>
            <Grid item xs={12}>
                <Table/>
            </Grid>
            <Fab aria-label="Ajouter une nouvelle ligne" className={classes.fab} color="primary"
                 onClick={handleAddLine}>
                <AddIcon/>
            </Fab>
            <EditLineDialog onSaved={handleSaved}/>
        </Grid> : null}
    </div>;
};