import React, {useState, useEffect} from 'react';
import "moment/locale/fr";
import {
    Paper,
    List,
    ListItem,
    ListItemText
} from "@material-ui/core";

import Api from "../../core/Api";

import {makeStyles} from "@material-ui/core/styles";
import {formatDate, formatNumber} from "../../core/Tools";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt} from "@fortawesome/free-solid-svg-icons";

const useStyles = makeStyles(theme => ({
    root: {
        boxSizing: "border-box",
        width: "100%",
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 700,
        padding: 4
    },
    title: {
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        fontWeight: 400,
        color: theme.palette.text.secondary
    },
    icon: {
        marginRight: 4,
    },
    item: {
        paddingTop: 2,
        paddingBottom: 2,
        "& *": {
            fontSize: 12
        },
        "& .MuiListItemText-root": {
            marginTop: 0,
            marginBottom: 0
        },
        "& .MuiTypography-colorTextSecondary": {
            color: "rgba(0, 0, 0, 0.34)"
        }
    },
    amount: {
        fontWeight: "bold",
        fontFamily: "monospace"
    }
}));


export default React.memo(() => {
    const classes = useStyles();
    const [operations, setOperations] = useState([]);

    useEffect(() => {
        (async () => {
            setOperations(await Api.service('monitoring/latest'));
        })();
    }, []);

    return <Paper className={classes.root}>
        <div className={classes.title}>
            <FontAwesomeIcon icon={faCalendarAlt} className={classes.icon}/>
            <span>Dernières opérations</span>
        </div>
        <List dense={true} disablePadding={true}>
            {operations.map(operation => <ListItem key={operation.id} disableGutters={true} className={classes.item}>
                <ListItemText
                    primary={<span><span
                        className={classes.amount}>{formatNumber(operation.amount)}</span>  - {operation.label}
                        </span>}
                    secondary={formatDate(operation.date) + (operation.notes ? " - " + operation.notes : null)}/>
            </ListItem>)}
        </List>
    </Paper>
});