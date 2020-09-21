import React, {useEffect, useState} from 'react';
import {Fab, Grid} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import Table from "./Table";
import Header from "./Header";
import store from "./Store";
import moment from "moment";
import {useParams, useLocation} from "react-router-dom";
import Api from "../../core/Api";
import {Add as AddIcon} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import EditDialog from "./EditDialog";

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
    const [lines, setLines] = useState([]);
    const {id} = useParams();

    const [edit, setEdit] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);

    const load = async () => {
        const project = await Api.get(`project`, id);
        project.endAt = moment.unix(project.endAt);
        setProject(project);
        const lines = (await Api.search(`project_line`, {$where: {idProject: id}})) || [];
        setLines(lines);
        await store.refreshFromDatabase(id);

        setIsLoading(false);
    };

    useEffect(() => {
        store.setProject(id);
        (async () => {
            await load();
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
        <Title>{project ? project.label : 'Projet'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <Grid container spacing={1} className={classes.root}>
            <Header/>
            <Grid item xs={12}>
                <Table projectId={id} lines={lines} endAt={project.endAt}
                       onEditLine={(line) => setEdit(line)}/>
            </Grid>
            <Fab aria-label="Ajouter une nouvelle ligne" className={classes.fab} color="primary"
                 onClick={() => setDisplayDialog(true)}>
                <AddIcon/>
            </Fab>
            {displayDialog || edit ? <EditDialog onClose={(saved) => handleClose(saved)} {...edit} idProject={id}/> : null}
        </Grid> : null}
    </div>;
};