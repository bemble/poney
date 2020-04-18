import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Paper} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {formatNumber} from "../../../core/Tools";
import * as MaterialColors from "@material-ui/core/colors";

const colors = {};
Object.entries(MaterialColors).forEach(([name, color]) => {
    colors[name] = {
        background: color[500]
    };
});

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: 80,
        padding: 4,
        color: "#FFF"
    },
    title: {
        fontSize: 12,
        display: "flex",
        alignItems: "center"
    },
    icon: {
        marginRight: 4,
    },
    content: {
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: 28,
        fontFamily: "monospace",
        [theme.breakpoints.up("sm")]: {
            paddingLeft: 16,
            paddingRight: 16
        },
    },
    ...colors
}));

export default React.memo((props) => {
    const classes = useStyles();

    const color = (props.data !== -1 && ([null, undefined].indexOf(props.warning) === -1) && props.data <= props.warning)
        ? props.colors[1]
        : props.colors[0];

    return <Paper className={classes.root + " " + classes[color]} onClick={() => props.onClick && props.onClick()}>
        <span className={classes.title}>
            <FontAwesomeIcon icon={props.icon} className={classes.icon}/>
            <span>{props.title}</span>
        </span>
        <div className={classes.content}>{props.data === -1 ? "..." : formatNumber(props.data)}</div>
    </Paper>;
});