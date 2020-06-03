import React, {useEffect, useState} from 'react';
import {
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, IconButton
} from "@material-ui/core";
import BudgetLine from "./BudgetLine";
import store from "./Store";
import {faExchangeAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    tools: {
        width: "60px !important",
        minWidth: "60px !important",
        textAlign: "right"
    },
    amount: {
        width: 70,
        paddingRight: 0
    },
    dayOfMonth: {
        width: 46,
        paddingRight: 0
    }
}));

const createLine = (id = -1) => ({
    id,
    label: "",
    amount: "",
    operationKind: "",
    categories: [],
    dayOfMonth: "",
    order: 0
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
    const [isReordering, setIsReordering] = useState(false);

    const handleOnDeleted = async (id) => {
        const index = lines.findIndex(l => l.id === id);
        if (index >= 0) {
            const newLines = [...lines];
            newLines.splice(index, 1);
            setLines(newLines);
        }
        store.refreshFromDatabase(props.budgetId);
    };

    const handleOnCreated = async (id, newId) => {
        const index = lines.findIndex(l => l.id === id);
        if (index >= 0) {
            const newLines = [...lines];
            newLines[index].newId = newId;
            let minId = Math.min(...lines.map(l => l.id));
            if (minId > 0) {
                minId = 0;
            }
            minId--;
            newLines.push(createLine(minId));
            setLines(newLines);
        }
    };

    const handleToggleOrder = () => {
        setIsReordering(!isReordering);
    };

    const handleOnUpClicked = (id) => {
        const curIndex = lines.findIndex(e => e.id === id);
        const newLines = [...lines];
        newLines[curIndex - 1] = lines[curIndex];
        newLines[curIndex] = lines[curIndex - 1];
        const newOrder = newLines.map(e => e.id);
        Api.service(`budgets/reorder/${props.budgetId}`, {body: newOrder});
        setLines(newLines);
    };
    const handleOnDownClicked = (id) => {
        const curIndex = lines.findIndex(e => e.id === id);
        const newLines = [...lines];
        newLines[curIndex + 1] = lines[curIndex];
        newLines[curIndex] = lines[curIndex + 1];
        const newOrder = newLines.map(e => e.id);
        Api.service(`budgets/reorder/${props.budgetId}`, {method: "POST", body: newOrder});
        setLines(newLines);
    };

    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>Libelle</TableCell>
                <TableCell className={classes.amount}>Montant</TableCell>
                <TableCell className={classes.dayOfMonth}>Jour</TableCell>
                <TableCell className={classes.tools}>
                    <IconButton aria-label="Supprimer" onClick={() => handleToggleOrder()} size="small"
                                color={isReordering ? "primary" : "default"}>
                        <FontAwesomeIcon icon={faExchangeAlt} rotation={90}/>
                    </IconButton>
                </TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {lines.map((line, i) => <BudgetLine key={line.id} {...line} isReordering={isReordering}
                                                isLast={i === lines.length - 1} isFirst={i === 0}
                                                onUpClicked={handleOnUpClicked} onDownClicked={handleOnDownClicked}
                                                onDeleted={handleOnDeleted} onCreated={handleOnCreated}
                                                onEdit={() => props.onEditLine && props.onEditLine(line)}/>)}
        </TableBody>
    </Table>;
});