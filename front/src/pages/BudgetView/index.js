import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Visualize from "./Visualize";
import {Grid, Paper} from "@material-ui/core";
import Title from "../../components/Title";
import Api from "../../core/Api";
import moment from "moment";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import "moment/locale/fr";

const useStyles = makeStyles(theme => ({
    content: {
        marginTop: theme.spacing()
    },
    datePicker: {
        padding: theme.spacing()
    }
}));

export default React.memo((props) => {
    const [budget, setBudget] = useState({});
    const [month, setMonth] = useState(moment.utc());

    useEffect(() => {
        (async () => {
            setBudget(await Api.get(`budget`, props.match.params.id));
        })();
    }, []);

    const classes = useStyles();
    return <div>
        <Title>{budget.label || 'Budget'}</Title>
        <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
            <Grid className={classes.datePicker}>
                <Grid item xs={12}>
                    <DatePicker
                        fullWidth
                        variant="inline"
                        views={["year", "month"]}
                        openTo="month"
                        margin="normal"
                        label="Mois"
                        value={month}
                        maxDate={moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0})}
                        onChange={setMonth}
                        autoOk={true}
                    />
                </Grid>
            </Grid>
        </MuiPickersUtilsProvider>
        <Paper className={classes.content}>
            <Visualize id={props.match.params.id} month={month.format("YYYY-MM")}/>
        </Paper>
    </div>;
});