import React, {useEffect, useState} from 'react';
import moment from "moment";
import {
    MuiPickersUtilsProvider, DatePicker,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import HealthGraph from "./HealthGraph";
import "moment/locale/fr";
import {Grid} from "@material-ui/core";
import Api from "../../../core/Api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudSun} from "@fortawesome/free-solid-svg-icons";

import {makeStyles} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(),
        paddingRight: theme.spacing(),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        [theme.breakpoints.down("xs")]: {
            paddingTop: theme.spacing()
        }
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
        boxSizing: "border-box",
        background: grey[50],
        width: "100%",
        textAlign: 'center',
        color: grey[500],
        borderRadius: 2,
        fontSize: 18,
        fontWeight: 700,
        position: "relative",
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.3)",
        padding: 4
    }
}));


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

    const classes = useStyles();

    return <div className={classes.root}>
        <div className={classes.content}>
        <span className={classes.title}>
            <FontAwesomeIcon icon={faCloudSun} className={classes.icon}/>
            <span>Météo du compte courant</span>
        </span>
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
    </div>
});