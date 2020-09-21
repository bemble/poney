import {
    makeStyles,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, {useState, useEffect} from "react";
import {grey} from "@material-ui/core/colors";
import Tools from "./Tools";
import {formatNumber} from "../../../core/Tools"
import store from "../../../store";

const useStyle = makeStyles(theme => ({
    root: {
        "& .MuiTableCell-sizeSmall": {
            padding: 2
        },
        "& .MuiInputBase-input": {
            fontSize: 12,
            lineHeight: "0.9em"
        }
    },
    title: {
        background: grey[700],
        color: grey[50],
        fontSize: 20,
        fontWeight: 200,
        textAlign: "center"
    },
    tools: {
        width: 44
    },
    subInfo: {
        fontSize: 11,
        color: theme.palette.type === "dark" ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)"
    },
    expected: {
        fontWeight: "bold",
        fontFamily: "monospace"
    },
    real: {
        fontFamily: "monospace"
    }
}));

export default React.memo((props) => {
    const {project} = store.getState();
    const line = project.lines.filter(l => l.id === props.id)[0];

    const classes = useStyle();
    const [label, setLabel] = useState(line.label);
    const [amount, setAmount] = useState(line.amount);
    const [expectedAmount, setExpectedAmount] = useState(line.expectedAmount);
    const [alreadyPaidAmount, setAlreadyPaidAmount] = useState(line.alreadyPaidAmount);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const {project} = store.getState();
            const line = project.lines.filter(l => l.id === props.id)[0];
            if(line) {
                setLabel(line.label);
                setAmount(line.amount);
                setExpectedAmount(line.expectedAmount);
                setAlreadyPaidAmount(line.alreadyPaidAmount);
            }
        });

        return () => unsubscribe();
    }, []);

    return <TableRow hover>
        <TableCell size="small">
            {label}<br/>
            <span className={classes.subInfo}>
                Payé en {project.info.endAt.format("MM/YYYY")} : {formatNumber(amount)},
                avancé : {formatNumber(alreadyPaidAmount)}
            </span>
        </TableCell>
        <TableCell size="small" align="right">
            <span className={classes.expected}>{formatNumber(expectedAmount)}</span><br/>
            <span className={classes.real}>{formatNumber(alreadyPaidAmount + amount)}</span>
        </TableCell>
        <TableCell size="small" className={classes.tools}>
            <Tools id={props.id} />
        </TableCell>
    </TableRow>;
});