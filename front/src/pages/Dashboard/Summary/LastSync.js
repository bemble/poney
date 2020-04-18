import React from "react";
import * as MaterialColors from "@material-ui/core/colors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {faCircleNotch, faRocket} from "@fortawesome/free-solid-svg-icons";
import {makeStyles} from "@material-ui/core/styles";
import {Paper} from "@material-ui/core";

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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 4,
        color: theme.palette.text.hint,
        fontSize: 12,
        lineHeight: "12px",
        fontWeight: 700,
        position: "relative",
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
        border: `1px solid ${theme.palette.error.main}`,
        color: theme.palette.error.main,
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
    const content = isImporting
        ? "Synchronisation avec Linxo en cours..."
        : (props.data ? "Dernière synchronisation " + moment(props.data.lastRunnedAt, 'X').fromNow() : "En attente d'information.");

    return <div>
        <Paper className={classes.root}>
            <span className={classes.content}>{content}</span>
            <div className={classes.action + " " + (isImporting ? classes.hover : "")}
                 title={message}
                 onClick={() => props.onClick && props.onClick()}>
                <FontAwesomeIcon icon={isImporting ? faCircleNotch : faRocket} spin={isImporting}/>
            </div>
        </Paper>
        {props.data && props.data.message ? <div className={classes.synchAlert}>{props.data.message}</div> : null}
    </div>;
});