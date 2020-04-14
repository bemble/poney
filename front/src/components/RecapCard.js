import {makeStyles} from "@material-ui/core";
import {formatNumber} from "../core/Tools";
import React from "react";
import * as MaterialColors from "@material-ui/core/colors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const colors = {};
Object.entries(MaterialColors).forEach(([name, color]) => {
    colors[name] = {
        background: color[500],
        "& svg": {
            color: color[600]
        }
    };
});

const useStyles = makeStyles(theme => ({
    root: {
        background: MaterialColors.grey[500],
        maxWidth: 130,
        textAlign: 'center',
        padding: 16,
        color: "#FFF",
        borderRadius: 4,
        fontSize: 18,
        fontWeight: 700,
        position: "relative",
        "& svg": {
            zIndex: 1,
            left: 2,
            bottom: 2,
            position: "absolute",
            fontSize: "1.4rem",
            color: MaterialColors.grey[700]
        },
        [theme.breakpoints.up("sm")]: {
            minWidth: 90
        },
        [theme.breakpoints.down("xs")]: {
            padding: 4,
            fontSize: 12,
            "& svg": {
                fontSize: "0.9rem"
            }
        }
    },
    content: {
        position: "relative",
        zIndex: 2
    },
    ...colors
}));

export default React.memo((props) => {
    const classes = useStyles();
    const content = props.children || props.content;

    return <div title={props.title} className={classes.root + " " + classes[props.color]}>
        {props.icon ? <FontAwesomeIcon icon={props.icon}/> : null}
        <span className={classes.content}>{props.isAmount ? formatNumber(content) : content}</span>
    </div>;
});