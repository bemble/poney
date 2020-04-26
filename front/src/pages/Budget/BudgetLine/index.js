import {
    makeStyles,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, {useState} from "react";
import {grey} from "@material-ui/core/colors";
import Tools from "./Tools";

import {operationKinds} from "./core";

const useStyle = makeStyles(theme => ({
    root: {
        "& .MuiTableCell-root": {
            verticalAlign: "top"
        },
        "& .MuiTableCell-sizeSmall": {
            padding: 4
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
    sub: {
        fontSize: 10,
        color: theme.palette.text.hint
    },
    color: {
        width: 8,
        height: 8,
        display: "inline-block",
        borderRadius: 4,
        marginRight: 4
    }
}));

export default React.memo((props) => {
    const classes = useStyle();
    const [id, setId] = useState(props.id);
    const [color, setColor] = useState(props.color);

    const onCreated = (newId) => {
        setId(newId);
        props.onCreated && props.onCreated(props.id, newId);
    };

    const getOperationKindLabel = (operationKind) => {
        if (!operationKind) return "";
        const [elt] = operationKinds.filter(e => e.value === props.operationKind);
        return elt ? elt.label : "";
    };
    return <TableRow hover className={classes.root}>
        <TableCell size="small" onClick={() => props.onEdit && props.onEdit()}>
            <span>{props.label}</span><br/>
            <span className={classes.sub}>
                <span className={classes.color} style={{backgroundColor: color}}/>
                {props.categories.join(', ')}
            </span>
        </TableCell>
        <TableCell size="small" align="right" onClick={() => props.onEdit && props.onEdit()}>
            <span>{props.amount}</span><br/>
            <span className={classes.sub}>{getOperationKindLabel(props.operationKind)}</span>
        </TableCell>
        <TableCell size="small" align="right" onClick={() => props.onEdit && props.onEdit()}>
            <span>{props.dayOfMonth}</span>
        </TableCell>
        <TableCell size="small" style={{verticalAlign: "middle"}}>
            <Tools {...{...props, id, initialId: id}} onColorChanged={(hex) => setColor(hex)}/>
        </TableCell>
    </TableRow>;
});