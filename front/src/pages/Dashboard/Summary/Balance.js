import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {teal, deepOrange} from "@material-ui/core/colors";
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
        color: "#FFF",
        borderRadius: 2,
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.3)",
        boxSizing: "border-box"
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
        fontSize: 32,
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

    return <div
        className={classes.root + " " + classes[color]}>
        <span className={classes.title}>
            <FontAwesomeIcon icon={props.icon} className={classes.icon}/>
            <span>{props.title}</span>
        </span>
        <div className={classes.content}>{props.data === -1 ? "..." : formatNumber(props.data)}</div>
    </div>;
});