import {
    makeStyles,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, {useState} from "react";
import {grey} from "@material-ui/core/colors";
import Tools from "./Tools";
import LineInput from "./LineInput";

import {operationKinds, linxoCategories} from "./core";

const useStyle = makeStyles({
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
        width: 56
    }
});

export default React.memo((props) => {
    const classes = useStyle();
    const [id, setId] = useState(props.id);
    const [color, setColor] = useState(props.color);

    const onCreated = (newId) => {
        setId(newId);
        props.onCreated && props.onCreated(props.id);
    };

    const fields = {
        "label": {},
        "amount": {number: true, isIncome: !!props.isIncome, alignRight: true},
        "operationKind": {possibleValues: operationKinds},
        "categories": {possibleValues: linxoCategories, grouped: true},
        "dayOfMonth": {}
    };
    return <TableRow hover>
        <TableCell size="small" className={classes.tools}>
            <Tools {...{...props, id, initialId: id}} onColorChanged={(hex) => setColor(hex)} />
        </TableCell>
        {Object.entries(fields).map(([name, options], i) => <TableCell key={i} size="small">
            <LineInput value={props[name]} {...{...options, name, id}} onCreated={onCreated}/>
        </TableCell>)}
    </TableRow>;
});