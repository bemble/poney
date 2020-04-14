import {
    makeStyles,
    TableCell,
    TableRow
} from "@material-ui/core";
import React, {useState} from "react";
import {grey} from "@material-ui/core/colors";
import Tools from "./Tools";
import LineInput from "./LineInput";

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
        width: 44
    },
    cell: {
        verticalAlign: "top"
    }
});

export default React.memo((props) => {
    const classes = useStyle();
    const [id, setId] = useState(props.id);

    const onCreated = (newId) => {
        setId(newId);
        props.onCreated && props.onCreated(props.id);
    };

    const fields = {
        "label": {},
        "amount": {number: true, alignRight: true},
        "alreadyPaidAmount": {number: true, alignRight: true},
        "expectedAmount": {number: true, alignRight: true},
        "comment": {multiline: true}
    };

    const cleanFields = Object.entries(fields);

    return <TableRow hover>
        <TableCell size="small" className={classes.tools}>
            <Tools {...{...props, id, initialId: id}} />
        </TableCell>
        {cleanFields.map(([name, options], i) => <TableCell key={i} size="small" className={classes.cell}>
            <LineInput value={props[name]} {...{...options, name, id}} onCreated={onCreated}/>
        </TableCell>)}
    </TableRow>;
});