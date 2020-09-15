import React, {useState} from 'react';
import "moment/locale/fr";
import {Paper, FormControlLabel, Switch} from "@material-ui/core";
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
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 400,
        color: theme.palette.text.secondary,
        paddingLeft: 4,
        marginBottom: 8,
        "& *": {
            fontSize: 12
        }
    },
    icon: {
        marginRight: 4,
    },
    switch: {
        marginRight: 4
    }
}));


export default React.memo((props) => {
    const classes = useStyles();
    const [displayAll, setDisplayAll] = useState(false);

    const handleChangeDisplayAll = () => {
        setDisplayAll((prev) => !prev);
    };

    return <Paper className={classes.root}>
        <div className={classes.title}>
            <div>
                <FontAwesomeIcon icon={faFileInvoiceDollar} className={classes.icon}/>
                <span>Budget</span>
            </div>
            <FormControlLabel className={classes.switch}
                control={
                    <Switch
                        size="small"
                        checked={displayAll}
                        onChange={handleChangeDisplayAll}
                        color="primary"
                    />
                }
                label="Tout afficher"
            />
        </div>
        <Visualize onlyWarnings={!displayAll}/>
    </Paper>
});