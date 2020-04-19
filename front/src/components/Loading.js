import React from 'react';
import {makeStyles, Typography, CircularProgress} from "@material-ui/core";

const useStyle = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(12)
    },
    title: {
        fontSize: 36,
        color: theme.palette.text.primary
    }
}));

export default function Loading() {
    const classes = useStyle();

    return <div className={classes.root}>
        <CircularProgress className={classes.loader}/>
        <Typography variant="h1" component="h1" className={classes.title}>Chargement...</Typography>
    </div>
}