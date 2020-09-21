import {
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableRow,
    makeStyles,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {formatNumber} from "../../core/Tools";
import React, {useEffect, useState} from "react";
import SlideUpTransition from "../../components/SlideUpTransition";
import store from "../../store";
import {blue, blueGrey, indigo} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    paid: {
        color: theme.palette.type === "light" ? indigo[500] : indigo[300]
    },
    alreadyPaid: {
        fontSize: 10,
        color: theme.palette.type === "light" ? blueGrey[200] : blueGrey[500]
    },
    expected: {
        color: theme.palette.type === "light" ? blueGrey[300] : blueGrey[500]
    },
    list: {
        margin: 0
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

export default React.memo(() => {
    const {project} = store.getState();
    const line = project.lines.filter(l => l.id === project.editLineId)[0] || {};

    const [editLineId, setEditLineId] = useState(project.editLineId);
    const [label, setLabel] = useState(line.label || "");
    const [amount, setAmount] = useState(line.amount || 0);
    const [expectedAmount, setExpectedAmount] = useState(line.expectedAmount || 0);
    const [alreadyPaidAmount, setAlreadyPaidAmount] = useState(line.alreadyPaidAmount || 0);
    const [comment, setComment] = useState(line.comment || "");

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const {project} = store.getState();
            const line = project.lines.filter(l => l.id === project.editLineId)[0] || {};

            setEditLineId(project.editLineId);
            setLabel(line.label || "");
            setAmount(line.amount || 0);
            setExpectedAmount(line.expectedAmount || 0);
            setAlreadyPaidAmount(line.alreadyPaidAmount || 0);
            setComment(line.comment || "");
        });

        return () => unsubscribe();
    }, []);

    const handleClose = async () => {
        store.dispatch({
            type: "SET", project: {editLineId: -1}
        });
    };

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    return <Dialog open={editLineId >= 0} fullScreen={fullScreen} onClose={handleClose}
                   className={classes.dialog} TransitionComponent={SlideUpTransition}>
        <DialogTitle className={classes.dialogTitle}>
            Détails
            <FontAwesomeIcon icon={faTimesCircle} onClick={handleClose}/>
        </DialogTitle>
        <DialogContent>
            <h4>{label}</h4>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.cell}>Payé</TableCell>
                        <TableCell align="right">
                                <span
                                    className={classes.paid}>{formatNumber((amount || 0) + (alreadyPaidAmount || 0))}</span>
                            <br/>
                            <span
                                className={classes.alreadyPaid}>Avancé : {formatNumber(alreadyPaidAmount)}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Prévu</TableCell>
                        <TableCell align="right"
                                   className={classes.expected}>{formatNumber(expectedAmount)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {comment ? <div>
                <h5>Commentaires</h5>
                <ul className={classes.list}>{(comment || "").split("\n").map((c, i) =>
                    <li>{c}</li>)}</ul>
            </div> : null}
        </DialogContent>
    </Dialog>;
});