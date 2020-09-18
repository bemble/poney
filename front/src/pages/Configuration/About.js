import React from "react";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing()
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
        <div className={classes.version}>Poney version <span>{process.env.REACT_APP_VERSION || "dev"}</span></div>
    </div>;
});