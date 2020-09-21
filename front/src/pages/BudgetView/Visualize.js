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
import {
    faCalendarAlt,
    faCheckCircle,
    faExclamationCircle,
    faExclamationTriangle,
    faTag
} from "@fortawesome/free-solid-svg-icons";
import {formatNumber} from "../../core/Tools";
import {Close as CloseIcon} from "@material-ui/icons";
import {blue, indigo} from "@material-ui/core/colors";

import "./Visualize.scss";
import SlideUpTransition from "../../components/SlideUpTransition";

const useStyles = makeStyles(theme => ({
    barContainer: {
        position: "relative",
        width: "67%",
        border: `1px solid ${theme.palette.text.hint}`,
        borderRadius: 2,
        overflow: "hidden",
        paddingLeft: 4
    },
    bar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "100%",
        background: theme.palette.text.hint,
        opacity: 0.4
    },
    warningIcon: {
        marginRight: theme.spacing(),
        color: theme.palette.warning.light
    },
    lightWarningIcon: {
        marginRight: theme.spacing(),
        color: theme.palette.text.hint
    },
    noWarning: {
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.success.main,
        "& svg": {
            marginRight: theme.spacing()
        }
    },
    off: {
        "& .category-name": {
            color: theme.palette.warning.dark
        },
        "& .barContainer": {
            borderColor: theme.palette.warning.main
        },
        "& .bar": {
            backgroundColor: theme.palette.warning.main
        }
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
    },
    dataCategory: {
        fontSize: 12,
        color: theme.palette.info.light,
        "& svg": {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing()
        }
    }
}));

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
                if ((props.onlyWarnings && apiUsage[k].hasWarning && !apiUsage[k].isLightWarning) || !props.onlyWarnings) {
                    newUsage[k] = apiUsage[k];
                }
            });
            setUsage(newUsage);
            setIsLoading(false);
        })();
    }, [props.month, props.onlyWarnings]);

    const closeDetails = () => setDetails(null);
    const showDetails = async (category, budgetLineId, onlyComing) => {
        setIsLoading(true);
        const path = `budgets/usage/details${props.id ? `/${props.id}` : ""}`;
        const queryParams = {category};
        if (budgetLineId) {
            queryParams.budgetLineId = budgetLineId;
        }
        if (onlyComing) {
            queryParams.onlyComing = onlyComing;
        }
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

    return <div className="budget-visualize">
        {Object.keys(usage).map(k => <div key={k} className={"item " + (k === "off" ? classes.off : "")}
                                          onClick={() => showDetails(k, usage[k].budgetLineId, !(usage[k].hasWarning && usage[k].isLightWarning))}>
            <div className="category">
                {!props.onlyWarnings && usage[k].hasWarning && !usage[k].isLightWarning ?
                    <FontAwesomeIcon icon={faExclamationTriangle} className={classes.warningIcon}/> : null}
                {!props.onlyWarnings && usage[k].hasWarning && usage[k].isLightWarning ?
                    <FontAwesomeIcon icon={faExclamationCircle} className={classes.lightWarningIcon}/> : null}
                <span
                    className={"category-name " + (usage[k].isIncome ? classes.income : "")}>{k === "off" ? "Hors budget" : k}</span>
            </div>
            <div className={classes.barContainer} style={{borderColor: usage[k].color}}>
                <div className={classes.bar} style={{
                    width: `${Math.min(usage[k].total / (usage[k].expected || -0.01), 1) * 100}%`,
                    backgroundColor: usage[k].color
                }}>
                </div>
                <span>{formatNumber(usage[k].total)}{usage[k].expected ? "/" + formatNumber(usage[k].expected) : ""}</span>
            </div>
        </div>)}
        <Dialog fullScreen className={classes.dialog} open={!!details} TransitionComponent={SlideUpTransition}
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
                            {line.label}{line.notes ? ` (${line.notes})` : ""}<br/>
                            <span className={classes.calendar}>
                                <FontAwesomeIcon icon={faCalendarAlt}/>
                                Opération attendue le {line.dayOfMonth}
                            </span>
                        </TableCell>
                        <TableCell className={classes.details} align="right">{formatNumber(line.amount)}</TableCell>
                    </TableRow>)}
                    {details.data.map((line, i) => <TableRow hover key={`data-${i}`}>
                        <TableCell className={classes.data}>
                            {line.label}{line.notes ? ` (${line.notes})` : ""}<br/>
                            <span className={classes.dataCalendar}>
                                <FontAwesomeIcon icon={faCalendarAlt}/>
                                {moment.unix(line.date).format("DD/MM")}
                            </span>
                            <span className={classes.dataCategory}>
                                <FontAwesomeIcon icon={faTag}/>
                                {line.category}
                            </span>
                        </TableCell>
                        <TableCell className={classes.data} align="right">{formatNumber(line.amount)}</TableCell>
                    </TableRow>)}
                </TableBody> : null}
            </Table>
        </Dialog>
    </div>;
});