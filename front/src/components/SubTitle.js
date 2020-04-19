import React from 'react';
import {makeStyles, Typography} from "@material-ui/core";
import {pink, red} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1),
        position: "relative"
    },
    title: {
        fontSize: 24,
        fontWeight: 200,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderImage: `linear-gradient(to right, ${pink[700]}, ${red[700]}, rgba(0,0,0,0)) 0 1 100%`,
        color: theme.palette.text.primary
    }
}));

export default function SubTitle(props) {
    const classes = useStyles();

    return <div className={classes.root}>
        <Typography variant="h2" component="h2" className={classes.title}>{props.children}</Typography>
    </div>;
}