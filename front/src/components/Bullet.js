import React from "react";
import {green, red} from "@material-ui/core/colors";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    bullet: {
        display: "inline-block",
        width: 8,
        height: 8,
        marginRight: theme.spacing(1),
        borderRadius: 8
    },
    alert: {
        backgroundColor: red[500],
        boxShadow: `0 0 1px ${red[500]}`
    },
    cool: {
        backgroundColor: green[500],
        boxShadow: `0 0 1px ${green[500]}`
    }
}));

export default React.memo((props) => {
    const classes = useStyles();
    return <span className={classes.bullet + " " + (props.variant === "alert" ? classes.alert : classes.cool)} />;
});