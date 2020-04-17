import React from "react";
import * as MaterialColors from "@material-ui/core/colors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {grey, red} from "@material-ui/core/colors";
import moment from "moment";
import {faCircleNotch, faRocket} from "@fortawesome/free-solid-svg-icons";
import {makeStyles} from "@material-ui/core/styles";

const colors = {};
Object.entries(MaterialColors).forEach(([name, color]) => {
    colors[name] = {
        background: color[500],
        "& > svg": {
            color: color[600]
        }
    };
});

const useStyles = makeStyles(theme => ({
    root: {
        background: grey[200],
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: 4,
        color: grey[500],
        borderRadius: 2,
        fontSize: 12,
        fontWeight: 700,
        position: "relative",
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.3)",
        boxSizing: "border-box"
    },
    content: {
        position: "relative",
        zIndex: 2
    },
    action: {
        borderLeft: "1px solid rgba(0, 0, 0, 0.10)",
        width: 16,
        textAlign: "center",
        paddingLeft: 4,
        '&:hover': {
            cursor: "pointer"
        }
    },
    synchAlert: {
        border: `1px solid ${red[400]}`,
        color: red[800],
        borderLeftWidth: 3,
        fontSize: 8,
        fontFamily: "monospace",
        overflow: "hidden",
        padding: theme.spacing(0.5),
        borderRadius: "0 0 2px 2px",
        marginTop: -1
    }
}));

export default React.memo((props) => {
    const classes = useStyles();

    const isImporting = props.data && props.data.status === 2;
    const message = isImporting ? "Importation en cours" : "Lancer l'importation des données";

    return <div>
        <div className={classes.root}>
            <span className={classes.content}>
                {props.data ? "Dernière synchronisation " + moment(props.data.lastRunnedAt, 'X').fromNow() : "..."}
            </span>
            <div className={classes.action + " " + (isImporting ? classes.hover : "")}
                 title={message}
                 onClick={() => props.onClick && props.onClick()}>
                <FontAwesomeIcon icon={isImporting ? faCircleNotch : faRocket} spin={isImporting}/>
            </div>
        </div>
        {props.data && props.data.message ? <div className={classes.synchAlert}>{props.data.message}</div> : null}
    </div>;
});