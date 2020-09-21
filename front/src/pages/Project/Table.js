import React, {useState, useEffect} from 'react';
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
import store from "../../store";

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
    const classes = useStyles();
    const [lines, setLines] = useState(store.getState().project.lines.map(({id}) => id));

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const {lines} = store.getState().project;
            setLines(lines.map(({id}) => id))
        });

        return () => unsubscribe();
    }, []);

    return <Table className={classes.root}>
        <TableHead>
            <TableRow>
                <TableCell className={classes.title}
                           colSpan={3}>Dépenses</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {lines.map((id) => <ProjectLine key={id} id={id}/>)}
        </TableBody>
    </Table>;
});