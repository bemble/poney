import React, {useEffect, useState} from "react";
import {Table, TableHead, TableRow, TableCell, TableBody, makeStyles} from "@material-ui/core";
import {formatNumber} from "../../core/Tools";
import moment from "moment";
import {blueGrey, green, grey, red} from "@material-ui/core/colors";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import Api from "../../core/Api";

const useStyles = makeStyles({
    table: {
        "& td": {
            padding: "6px 12px 6px 8px"
        },
        "& td:last-child": {
            paddingRight: "8px"
        }
    },
    ok: {
        background: blueGrey[50],
        color: green[800]
    },
    warning: {
        background: red[50],
        color: red[800]
    },
    tools: {
        width: 20,
        fontSize: 18,
        color: grey[300]
    },
    income: {
        color: blueGrey[900]
    },
    expense: {
        color: red[900]
    },
    noData: {
        color: blueGrey[100]
    }
});

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
        props.onLineSelect && props.onLineSelect({
            label: props.saving.label + ', ' + month,
            ...details
        });
    };

    const classes = useStyles();

    return <Table size="small" className={classes.table}>
        <TableHead>
            <TableRow>
                <TableCell colSpan={4} align="center"
                           style={{background: props.saving.color}}>
                    {props.saving.label}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={4} align="center"
                           className={total < 0 ? classes.warning : classes.ok}>{formatNumber(total)}</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {months.map((month, i) => <TableRow key={month}>
                <TableCell
                    style={{fontWeight: i === 0 ? "bold" : "normal"}}>{moment(month, "YYYY-MM").format("MM/YYYY")}</TableCell>
                <TableCell align="right"
                           className={lines[month] && lines[month].amountIncomes ? classes.income : classes.noData}>{formatNumber(lines[month] ? lines[month].amountIncomes : 0)}</TableCell>
                <TableCell align="right"
                           className={lines[month] && lines[month].amountExpenses ? classes.expense : classes.noData}>{formatNumber(lines[month] ? lines[month].amountExpenses : 0)}</TableCell>
                <TableCell className={classes.tools}>{lines[month] && lines[month].comment ?
                    <FontAwesomeIcon icon={faInfoCircle}
                                     onClick={() => handleShowInfo(moment(month, "YYYY-MM").format("MM/YYYY"), lines[month])}/> : null}</TableCell>
            </TableRow>)}
        </TableBody>
    </Table>
});