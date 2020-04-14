import React, {useEffect, useState} from 'react';
import moment from "moment";
import {
    MuiPickersUtilsProvider, DatePicker,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import HealthGraph from "./HealthGraph";
import "moment/locale/fr";
import {Grid} from "@material-ui/core";
import Api from "../../core/Api";


export default React.memo(() => {
    const [lines, setLines] = useState([]);
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());

    useEffect(() => {
        const start = moment.utc();
        start.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        start.subtract(5, 'days');

        const end = moment.utc();
        end.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        end.add(35, 'days');

        setStartDate(start);
        setEndDate(end);
    }, []);

    useEffect(() => {
        (async () => {
            const {lines} = await Api.service(`monitoring`, null, {start: startDate.unix(), end: endDate.unix()});
            setLines(lines);
        })();
    }, [startDate, endDate]);

    return <div>
        <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
            <Grid container spacing={1} style={{padding: "0 16px"}}>
                <Grid item xs={6} sm={3}>
                    <DatePicker
                        disableToolbar
                        variant="inline"
                        format="DD/MM/YYYY"
                        margin="normal"
                        label="Début"
                        value={startDate}
                        maxDate={moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0})}
                        onChange={setStartDate}
                        autoOk={true}
                    />
                </Grid>
                <Grid item xs={6}>
                    <DatePicker
                        disableToolbar
                        variant="inline"
                        format="DD/MM/YYYY"
                        margin="normal"
                        label="Fin"
                        value={endDate}
                        minDate={startDate}
                        onChange={setEndDate}
                        autoOk={true}
                    />
                </Grid>
            </Grid>
        </MuiPickersUtilsProvider>
        <HealthGraph data={lines}/>
    </div>
});