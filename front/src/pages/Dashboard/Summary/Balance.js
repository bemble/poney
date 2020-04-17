import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {grey, teal, deepOrange} from "@material-ui/core/colors";
import {faMoneyCheckAlt} from "@fortawesome/free-solid-svg-icons";
import {makeStyles} from "@material-ui/core/styles";
import {formatNumber} from "../../../core/Tools";

const useStyles = makeStyles(theme => ({
    root: {
        background: teal[500],
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
    warning: {
        background: deepOrange[500],
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
    }
}));

export default React.memo((props) => {
    const classes = useStyles();

    return <div className={classes.root + " " + (props.data < props.warning ? classes.warning : "")}>
        <span className={classes.title}>
            <FontAwesomeIcon icon={faMoneyCheckAlt} className={classes.icon}/>
            <span>Compte courant</span>
        </span>
        <div className={classes.content}>{formatNumber(props.data)}</div>
    </div>;
});