import React from "react";
import {makeStyles} from "@material-ui/core";
import store from "../../store";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
        fontSize: 16
    },
    version: {
        "& span": {
            fontFamily: "monospace",
            fontWeight: "bold"
        }
    }
}));

export default React.memo(() => {
    const classes = useStyles();

    return <div className={classes.root}>
        <div className={classes.version}>
            Version de l'application : <span>{process.env.REACT_APP_VERSION || "dev"}</span><br />
            Version de l'API : <span>{store.getState().config.apiVersion}</span>
        </div>
    </div>;
});