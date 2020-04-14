import React from 'react';
import {
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import Bullet from "../../components/Bullet";
import {formatNumber} from "../../core/Tools";
import {blue, blueGrey, grey, indigo} from "@material-ui/core/colors";
import XsTable from "./XsTable";

const useStyles = makeStyles({
    details: {
        margin: 0,
        "& > *": {
            padding: "0 4px"
        }
    },
    paid: {
        color: indigo[500],
    },
    alreadyPaid: {
        fontSize: 10,
        color: blueGrey[200]
    },
    expected: {
        color: blueGrey[300],
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
});

export default React.memo((props) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

    const classes = useStyles();

    return <div>
        {!isLargeScreen ? <XsTable lines={props.lines} /> : <Table style={{minWidth: "100%"}}>
            <TableHead>
                <TableRow>
                    <TableCell>Libelle</TableCell>
                    <TableCell align="right">Payé</TableCell>
                    <TableCell align="right">Budgetisé</TableCell>
                    <TableCell>Commentaire</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.lines.map((line) => <TableRow hover={isLargeScreen} key={line.id}>
                    <TableCell size="small" className={classes.cell}>
                        <Bullet
                            variant={(line.amount || 0) + (line.alreadyPaidAmount || 0) > (line.expectedAmount || 0) ? "alert" : "cool"}/>
                        {line.label}
                    </TableCell>
                    <TableCell size="small" align="right" className={classes.cell}>
                        {formatNumber((line.amount || 0) + (line.alreadyPaidAmount || 0))}
                    </TableCell>
                    <TableCell size="small" align="right" className={classes.cell}>
                        {formatNumber(line.expectedAmount || 0)}
                        </TableCell>
                    <TableCell size="small" className={classes.cell}>
                        {line.comment ? <ul className={classes.list}>{(line.comment || "").split("\n").map(c =>
                            <li>{c}</li>)}</ul> : null}
                    </TableCell>
                </TableRow>)}
            </TableBody>
        </Table>}
    </div>;
});