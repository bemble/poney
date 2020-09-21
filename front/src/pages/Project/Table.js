import React, {useState} from 'react';
import {
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import ProjectLine from "./ProjectLine";
import store from "./Store";

const useStyles = makeStyles({
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
    }
});

export default React.memo((props) => {
    const initialLines = [...props.lines.map(e => {
        if (!(e.categories instanceof Array)) {
            e.categories = (e.categories || "").split('|').filter(e => !!e.trim().length);
        }
        return e;
    })];

    const classes = useStyles();
    const [lines, setLines] = useState(initialLines);

    const handleOnDeleted = async (id) => {
        const index = lines.findIndex(l => l.id === id);
        if (index >= 0) {
            const newLines = [...lines];
            newLines.splice(index, 1);
            setLines(newLines);
        }
        store.refreshFromDatabase(props.projectId);
    };

    const handleOnCreated = async (id) => {
        const index = lines.findIndex(l => l.id === id);
        if (index >= 0) {
            setLines([...lines]);
        }
    };

    return <Table className={classes.root}>
        <TableHead>
            <TableRow>
                <TableCell className={classes.title}
                           colSpan={3}>Dépenses</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {lines.map((line) => <ProjectLine key={line.id} {...line} endAt={props.endAt}
                                              onDeleted={handleOnDeleted}
                                              onCreated={handleOnCreated}
                                              onEdit={() => props.onEditLine && props.onEditLine(line)}/>)}
        </TableBody>
    </Table>;
});