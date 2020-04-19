import React from "react";
import {CircularProgress} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyle = makeStyles(theme => ({
    root: {
        position: "fixed",
        top: theme.spacing(4),
        right: theme.spacing(4),
        width: `20px !important`,
        height: `20px !important`,
        display: "none"
    },
    visible: {
        display: "block"
    }
}));

export default React.memo((props) => {
    const classes = useStyle();
    return <CircularProgress className={classes.root + " " + (props.visible ? classes.visible : "")}/>;
});