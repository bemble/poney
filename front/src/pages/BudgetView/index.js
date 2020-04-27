import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Visualize from "./Visualize";
import {Paper} from "@material-ui/core";
import Title from "../../components/Title";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    content: {
        marginTop: theme.spacing()
    }
}));

export default React.memo((props) => {
    const [budget, setBudget] = useState({});
    useEffect(() => {
        (async () => {
            setBudget(await Api.get(`budget`, props.match.params.id));
        })();
    }, []);

    const classes = useStyles();
    return <div>
        <Title>{budget.label || 'Budget'}</Title>
        <Paper className={classes.content}><Visualize id={props.match.params.id}/></Paper>
    </div>;
});