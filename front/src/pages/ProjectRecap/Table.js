import React, {useState, useEffect} from 'react';
import {
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import LineDetailsDialog from "./LineDetailsDialog";
import Bullet from "../../components/Bullet";
import {formatNumber} from "../../core/Tools";
import {blue, blueGrey, grey, indigo} from "@material-ui/core/colors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import store from "../../store";

const useStyles = makeStyles(theme => ({
    details: {
        margin: 0,
        "& > *": {
            padding: "0 4px"
        }
    },
    paid: {
        color: theme.palette.type === "light" ? indigo[500] : indigo[300]
    },
    expected: {
        color: theme.palette.type === "light" ? blueGrey[300] : blueGrey[600]
    },
    list: {
        margin: 0
    },
    cell: {
        verticalAlign: "top"
    },
    tools: {
        width: 20,
        fontSize: 18,
        color: grey[300]
    },
    dialog: {
        top: '10vh !important'
    },
    dialogTitle: {
        color: "#FFF",
        background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
        "& *": {
            fontWeight: 400
        }
    }
}));

export default React.memo(() => {
    const {project} = store.getState();
    const [lines, setLines] = useState(project.lines || []);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const {project} = store.getState();
            setLines(project.lines || []);
        });

        return () => unsubscribe();
    }, []);

    const handleView = (editLineId) => {
        store.dispatch({
            type: "SET",
            project: {editLineId}
        });
    };

    const classes = useStyles();

    return <div>
        <Table style={{width: "100%"}}>
            <TableBody>
                {lines.map((line) => <TableRow key={line.id}>
                    <TableCell size="small" onClick={() => handleView(line.id)}>
                        <Bullet
                            variant={(line.amount || 0) + (line.alreadyPaidAmount || 0) > (line.expectedAmount || 0) ? "alert" : "cool"}/>
                        {line.label}
                        <p className={classes.details}>
                            <span
                                className={classes.paid}>{formatNumber((line.amount || 0) + (line.alreadyPaidAmount || 0))}</span>
                            <span>|</span>
                            <span className={classes.expected}>{formatNumber(line.expectedAmount || 0)}</span>
                        </p>
                    </TableCell>
                    <TableCell className={classes.tools}>
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => handleView(line.id)}/>
                    </TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
        <LineDetailsDialog/>
    </div>;
});