import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import Table from "./Table";
import Header from "./Header";
import store from "./Store";
import moment from "moment";
import {useParams, useLocation} from "react-router-dom";
import Api from "../../core/Api";

export default function Project() {
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [lines, setLines] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        store.setProject(id);

        (async () => {
            const project = await Api.get(`project`, id);
            project.endAt = moment.unix(project.endAt);
            setProject(project);
            const lines = (await Api.search(`project_line`, {$where: {idProject: id}})) || [];
            setLines(lines);
            await store.refreshFromDatabase(id);

            setIsLoading(false);
        })();
    }, []);
    const location = useLocation();

    return <div>
        <Title>{project ? project.label : 'Projet'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <Grid container spacing={1}>
            <Header/>
            <Grid item xs={12}>
                <Table projectId={id} lines={lines} endAt={project.endAt}
                       isEdit={location.pathname.indexOf("recap") < 0}/>
            </Grid>
        </Grid> : null}
    </div>;
};