import {
    makeStyles,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, {useState} from "react";
import {grey} from "@material-ui/core/colors";
import Tools from "./Tools";
import {formatNumber} from "../../../core/Tools"

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
    const classes = useStyle();
    const [id] = useState(props.id);

    return <TableRow hover>
        <TableCell size="small">
            {props.label}<br/>
            <span className={classes.subInfo}>
                Payé en {props.endAt.format("MM/YYYY")} : {formatNumber(props.amount)},
                avancé : {formatNumber(props.alreadyPaidAmount)}
            </span>
        </TableCell>
        <TableCell size="small" align="right">
            <span className={classes.expected}>{formatNumber(props.expectedAmount)}</span><br/>
            <span className={classes.real}>{formatNumber(props.alreadyPaidAmount + props.amount)}</span>
        </TableCell>
        <TableCell size="small" className={classes.tools}>
            <Tools {...{...props, id, initialId: id}} />
        </TableCell>
    </TableRow>;
});