import React from 'react';
import "moment/locale/fr";
import {Paper} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileInvoiceDollar} from "@fortawesome/free-solid-svg-icons";

import {makeStyles} from "@material-ui/core/styles";
import Visualize from "../BudgetView/Visualize";

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
    }
}));


export default React.memo((props) => {
    const classes = useStyles();

    return <Paper className={classes.root}>
        <span className={classes.title}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} className={classes.icon}/>
            <span>Alertes budget</span>
        </span>
        <Visualize onlyWarnings={true}/>
    </Paper>
});