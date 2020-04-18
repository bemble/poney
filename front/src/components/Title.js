import React, {useEffect, useState} from 'react';
import {makeStyles, Typography, CircularProgress} from "@material-ui/core";
import {pink, red} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(1)
        },
        position: "relative"
    },
    title: {
        fontSize: 36,
        borderBottomWidth: 2,
        borderStyle: "solid",
        borderImage: `linear-gradient(to right, ${pink[700]}, ${red[700]}, rgba(0,0,0,0)) 0 1 100%`
    },
    loader: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1) / 2
    }
}));

export default function Title(props) {
    const classes = useStyles();
    const [displayLoader, setDisplayLoader] = useState(false);

    useEffect(() => {
        setDisplayLoader(props.displayLoader);
    }, [props.displayLoader]);

    return <div className={classes.root}>
        <Typography variant="h1" component="h1" className={classes.title}>
            {props.children}
        </Typography>
        {displayLoader ? <CircularProgress className={classes.loader}/> : null}
    </div>;
}