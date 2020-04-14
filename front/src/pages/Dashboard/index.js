import React from 'react';
import AccountHealth from "./AccountHealth";
import Summary from "./Summary";
import {makeStyles} from "@material-ui/core";
import Title from "../../components/Title";

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    }
}));

export default React.memo(() => {
    const classes = useStyles();
    return <div>
        <Title>Dashboard</Title>
        <div>
            <Summary/>
            <AccountHealth className={classes.root}/>
        </div>
    </div>
});