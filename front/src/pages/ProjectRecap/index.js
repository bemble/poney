import React, {useEffect, useState} from 'react';
import {Grid} from "@material-ui/core";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import Table from "./Table";
import Header from "./Header";
import store from "../../store";
import moment from "moment";
import {useParams} from "react-router-dom";
import Api from "../../core/Api";

export default function Project() {
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState(null);
    const {id} = useParams();

    useEffect(() => {
        (async () => {
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
        })();
    }, []);

    return <div>
        <Title>{project ? project.label : 'Projet'}</Title>
        {isLoading ? <Loading/> : null}
        {!isLoading ? <Grid container spacing={1}>
                <Header/>
                <Grid item xs={12}>
                    <Table/>
                </Grid>
            </Grid> : null}
    </div>;
};