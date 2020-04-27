import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableRow, TableCell} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

import Api from "../../core/Api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faCheckCircle, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {formatNumber} from "../../core/Tools";

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
    calendar: {
        fontSize: 12,
        color: theme.palette.text.hint,
        "& svg": {
            marginRight: theme.spacing()
        }
    }
}));

export default React.memo((props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [usage, setUsage] = useState({});

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const apiUsage = await Api.service(`budgets/usage${props.id ? `/${props.id}` : ""}`);
            const newUsage = {};
            Object.keys(apiUsage).forEach(k => {
                if ((props.onlyWarnings && apiUsage[k].hasWarning) || !props.onlyWarnings) {
                    newUsage[k] = apiUsage[k];
                }
            });
            setUsage(newUsage);
            setIsLoading(false);
        })();
    }, []);

    const classes = useStyles();

    if (props.onlyWarnings && !Object.keys(usage).length) {
        return <div className={classes.noWarning}>
            <FontAwesomeIcon icon={faCheckCircle}/>
            Aucune alerte !
        </div>
    }
    return <Table>
        <TableBody>
            {Object.keys(usage).map(k => <TableRow key={k} className={k === "off" ? classes.off : ""}>
                <TableCell>
                    {usage[k].hasWarning ?
                        <FontAwesomeIcon icon={faExclamationTriangle} className={classes.warningIcon}/> : null}
                    {k === "off" ? "Hors budget" : k} : {formatNumber(usage[k].total)}
                    <span className={classes.expected}>/{formatNumber(usage[k].expected)}</span><br/>
                    {usage[k].displayCalendar.length ? <span className={classes.calendar}>
                            <FontAwesomeIcon icon={faCalendarAlt}/>
                            Opérations attendues : {usage[k].displayCalendar.join(', ')}
                            </span> : null}
                </TableCell>
            </TableRow>)}
        </TableBody>
    </Table>;
});