import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    TableHead, Dialog, Slide
} from "@material-ui/core";
import moment from "moment";
import {makeStyles} from "@material-ui/core/styles";

import Api from "../../core/Api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faCheckCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {formatNumber} from "../../core/Tools";
import {Close as CloseIcon} from "@material-ui/icons";
import {amber, blue, green, indigo} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    warningIcon: {
        marginRight: theme.spacing(2),
        color: theme.palette.warning.light
    },
    noWarning: {
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.success.main,
        "& svg": {
            marginRight: theme.spacing()
        }
    },
    expected: {
        color: theme.palette.text.hint
    },
    off: {
        backgroundColor: theme.palette.warning.main
    },
    income: {
        color: theme.palette.success.main
    },
    calendar: {
        fontSize: 12,
        color: theme.palette.info.light,
        "& svg": {
            marginRight: theme.spacing()
        }
    },
    dialog: {
        top: '10vh !important',
        [theme.breakpoints.up("sm")]: {
            top: '40vh !important',
            left: '15vw !important',
            right: '15vw !important'
        }
    },
    appBar: {
        position: "sticky",
        background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
    },
    table: {
        marginBottom: `env(safe-area-inset-bottom)`
    },
    details: {
        fontSize: 12,
        color: theme.palette.info.main
    },
    data: {
        fontSize: 12
    },
    dataCalendar: {
        fontSize: 12,
        color: theme.palette.text.hint,
        "& svg": {
            marginRight: theme.spacing()
        }
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

export default React.memo((props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [usage, setUsage] = useState({});
    const [details, setDetails] = useState(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const path = `budgets/usage${props.id ? `/${props.id}` : ""}`;
            const queryParams = {};
            if (props.month) {
                queryParams.month = props.month;
            }
            const apiUsage = await Api.service(path, {}, queryParams);
            const newUsage = {};
            Object.keys(apiUsage).forEach(k => {
                if ((props.onlyWarnings && apiUsage[k].hasWarning) || !props.onlyWarnings) {
                    newUsage[k] = apiUsage[k];
                }
            });
            setUsage(newUsage);
            setIsLoading(false);
        })();
    }, [props.month]);

    const closeDetails = () => setDetails(null);
    const showDetails = async (category) => {
        setIsLoading(true);
        const path = `budgets/usage/details${props.id ? `/${props.id}` : ""}`;
        const queryParams = {category};
        if (props.month) {
            queryParams.month = props.month;
        }
        setDetails(await Api.service(path, {}, queryParams));
        setIsLoading(false);
    };

    const classes = useStyles();

    if (props.onlyWarnings && !Object.keys(usage).length) {
        return <div className={classes.noWarning}>
            <FontAwesomeIcon icon={faCheckCircle}/>
            Aucune alerte !
        </div>
    }

    return <div><Table>
        <TableBody>
            {Object.keys(usage).map(k => <TableRow key={k} className={k === "off" ? classes.off : ""}>
                <TableCell onClick={() => showDetails(k)}>
                    {usage[k].hasWarning ?
                        <FontAwesomeIcon icon={faExclamationTriangle} className={classes.warningIcon}/> : null}
                    <span
                        className={usage[k].isIncome ? classes.income : ""}>{k === "off" ? "Hors budget" : k}</span> : {formatNumber(usage[k].total)}
                    <span className={classes.expected}>/{formatNumber(usage[k].expected)}</span><br/>
                    {usage[k].displayCalendar.length ? <span className={classes.calendar}>
                            <FontAwesomeIcon icon={faCalendarAlt}/>
                            Opérations attendues
                        {usage[k].displayCalendar.length === 1 ? " le " : " les "}
                        {usage[k].displayCalendar.join(', ')}
                            </span> : null}
                </TableCell>
            </TableRow>)}
        </TableBody>
    </Table>
        <Dialog fullScreen className={classes.dialog} open={!!details} TransitionComponent={Transition}
                onClose={closeDetails}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="close" onClick={closeDetails}>
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>Détails</Typography>
                </Toolbar>
            </AppBar>
            <Table size="small" className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Libelle</TableCell>
                        <TableCell align="right">Montant</TableCell>
                    </TableRow>
                </TableHead>
                {details ? <TableBody>
                    {details.budgetLines.map((line, i) => <TableRow hover key={`budget-${i}`}>
                        <TableCell className={classes.details}>
                            {line.label}<br/>
                            <span className={classes.calendar}>
                                <FontAwesomeIcon icon={faCalendarAlt}/>
                                Opération attendue le {line.dayOfMonth}
                            </span>
                        </TableCell>
                        <TableCell className={classes.details} align="right">{formatNumber(line.amount)}</TableCell>
                    </TableRow>)}
                    {details.data.map((line, i) => <TableRow hover key={`data-${i}`}>
                        <TableCell className={classes.data}>
                            {line.label}<br/>
                            <span className={classes.dataCalendar}>
                                <FontAwesomeIcon icon={faCalendarAlt}/>
                                {moment.unix(line.date).format("DD/MM")}
                            </span>
                        </TableCell>
                        <TableCell className={classes.data} align="right">{formatNumber(line.amount)}</TableCell>
                    </TableRow>)}
                </TableBody> : null}
            </Table>
        </Dialog>
    </div>;
});