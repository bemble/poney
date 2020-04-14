import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    makeStyles,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import Bullet from "../../components/Bullet";
import {formatNumber} from "../../core/Tools";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {blue, blueGrey, grey, indigo} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
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
            },
            "& svg": {
                position: "absolute",
                right: 16,
                top: 18
            }
        }
    }));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

export default React.memo((props) => {
    const classes = useStyles();
    const [lineDetails, setLineDetails] = useState(null);

    return <div>
        <Table style={{width: "100%"}}>
            <TableBody>
                {props.lines.map((line) => <TableRow key={line.id}>
                    <TableCell size="small">
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
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => setLineDetails(line)}/>
                    </TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
        <Dialog fullScreen open={lineDetails !== null} className={classes.dialog} onClose={() => setLineDetails(null)}
                TransitionComponent={Transition}>
            <DialogTitle className={classes.dialogTitle}>
                Détails
                <FontAwesomeIcon icon={faTimesCircle} onClick={() => setLineDetails(null)}/>
            </DialogTitle>
            {lineDetails ? <DialogContent>
                <h4>{lineDetails.label}</h4>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell}>Payé</TableCell>
                            <TableCell align="right">
                                <span
                                    className={classes.paid}>{formatNumber((lineDetails.amount || 0) + (lineDetails.alreadyPaidAmount || 0))}</span>
                                <br/>
                                <span
                                    className={classes.alreadyPaid}>Avancé : {formatNumber(lineDetails.alreadyPaidAmount)}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Prévu</TableCell>
                            <TableCell align="right"
                                       className={classes.expected}>{formatNumber(lineDetails.expectedAmount)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {lineDetails.comment ? <div>
                    <h5>Commentaires</h5>
                    <ul className={classes.list}>{(lineDetails.comment || "").split("\n").map(c =>
                        <li>{c}</li>)}</ul>
                </div> : null}
            </DialogContent> : null}
        </Dialog>
    </div>;
});