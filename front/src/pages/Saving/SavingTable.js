import React, {useEffect, useState} from "react";
import {Table, TableHead, TableRow, TableCell, TableBody, makeStyles} from "@material-ui/core";
import {formatNumber} from "../../core/Tools";
import moment from "moment";
import {blueGrey, green, red} from "@material-ui/core/colors";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    table: {
        "& td": {
            padding: "6px 12px 6px 8px"
        },
        "& td:last-child": {
            paddingRight: "8px"
        }
    },
    head: {
        color: "rgba(0,0,0,0.72)"
    },
    amountTotal: {
        position: "relative"
    },
    ok: {
        background: blueGrey[50],
        color: green[800]
    },
    warning: {
        background: red[50],
        color: red[800]
    },
    monthly: {
        color: `rgba(0,0,0,0.32)`,
        fontWeight: 200,
        position: "absolute",
        right: theme.spacing()
    },
    tools: {
        width: 20,
        fontSize: 18,
        color: theme.palette.type === "light" ? blueGrey[300] : blueGrey[500],
        textAlign: "right"
    },
    income: {
        color: theme.palette.type === "light" ? blueGrey[900] : blueGrey[100]
    },
    expense: {
        color: theme.palette.type === "light" ? red[900] : red[200]
    },
    noData: {
        color: theme.palette.type === "light" ? blueGrey[100] : blueGrey[600]
    }
}));

export default React.memo((props) => {
    const [months, setMonths] = useState([]);
    const [lines, setLines] = useState({});
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newMonths = [];
        const curMoment = moment(props.from);
        curMoment.set({date: 1, hour: 0, minute: 0, second: 0, millisecond: 0});
        const endMoment = moment();
        while (curMoment < endMoment) {
            newMonths.push(curMoment.format("YYYY-MM"));
            curMoment.add(1, "months");
        }
        newMonths.sort((a, b) => a < b ? 1 : -1);
        setMonths(newMonths);

        (async () => {
            const dbLines = await Api.search(`saving_line`, {
                $where: {
                    idSaving: props.saving.id,
                    month: {$in: newMonths}
                }
            });
            const newLines = {};
            dbLines.forEach(line => newLines[line.month] = line);
            setLines(newLines);

            const newTotal = await Api.service(`savings/total/${props.saving.id}`);
            setTotal(newTotal ? newTotal.amount : 0);
        })();
    }, [props.from]);

    const handleShowInfo = (month, details) => {
        month = moment(month, "YYYY-MM").format("MM/YYYY");
        props.onLineSelect && props.onLineSelect({
            label: props.saving.label + ', ' + month,
            ...details
        });
    };
    const handleEdit = (month, details) => {
        props.onEditLineSelect && props.onEditLineSelect({
            label: props.saving.label + ', ' + month,
            ...details
        });
    };

    const classes = useStyles();

    return <Table size="small" className={classes.table}>
        <TableHead>
            <TableRow style={{background: props.saving.color}}
                      onClick={() => props.onSavingSelect && props.onSavingSelect(total)}>
                <TableCell colSpan={4} align="center" className={classes.head}>
                    {props.saving.label}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={4} align="center"
                           className={classes.amountTotal + " " + (total < 0 ? classes.warning : classes.ok)}>
                    {formatNumber(total)}{props.budgetLines[props.saving.idBudgetLine] ?
                    <span className={classes.monthly}>
                    +{formatNumber(props.budgetLines[props.saving.idBudgetLine].amount)}/mois
                </span> : null}
                </TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {months.map((month, i) => <TableRow key={month}>
                <TableCell style={{fontWeight: i === 0 ? "bold" : "normal"}}
                           onClick={() => lines[month] && lines[month].comment && handleShowInfo(month, lines[month])}>
                    {moment(month, "YYYY-MM").format("MM/YYYY")}
                </TableCell>
                <TableCell align="right"
                           className={lines[month] && lines[month].amountIncomes ? classes.income : classes.noData}
                           onClick={() => lines[month] && lines[month].comment && handleShowInfo(month, lines[month])}>
                    {formatNumber(lines[month] ? lines[month].amountIncomes : 0)}
                </TableCell>
                <TableCell align="right"
                           className={lines[month] && lines[month].amountExpenses ? classes.expense : classes.noData}
                           onClick={() => lines[month] && lines[month].comment && handleShowInfo(month, lines[month])}>
                    {formatNumber(lines[month] ? lines[month].amountExpenses : 0)}
                </TableCell>
                <TableCell className={classes.tools}>{lines[month] && lines[month].comment ?
                    <FontAwesomeIcon icon={faEdit}
                                     onClick={() => handleEdit(moment(month, "YYYY-MM").format("MM/YYYY"), lines[month])}/> : null}
                </TableCell>
            </TableRow>)}
        </TableBody>
    </Table>
});