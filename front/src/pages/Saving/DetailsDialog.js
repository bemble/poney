import {
    Dialog,
    DialogContent,
    DialogTitle,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableRow,
    makeStyles
} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {formatNumber} from "../../core/Tools";
import React from "react";
import {blue, green, indigo, red} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    dialog: {
        top: '10vh !important',
        maxWidth: 600,
        margin: "0 auto"
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
    },
    income: {
        color: green[800]
    },
    expense: {
        color: red[800]
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

export default React.memo((props) => {
    const handleClose = () => {
        props.onClose && props.onClose();
    };

    const classes = useStyles();

    return <Dialog fullScreen open={props.lineDetails !== null} className={classes.dialog} onClose={handleClose}
                   TransitionComponent={Transition}>
        <DialogTitle className={classes.dialogTitle}>
            Détails
            <FontAwesomeIcon icon={faTimesCircle} onClick={handleClose}/>
        </DialogTitle>
        {props.lineDetails ? <DialogContent>
            <h4>{props.lineDetails.label}</h4>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.cell}>Revenus</TableCell>
                        <TableCell align="right" className={classes.income}>
                            {formatNumber(props.lineDetails.amountIncomes || 0)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Dépenses</TableCell>
                        <TableCell align="right" className={classes.expense}>
                            {formatNumber(props.lineDetails.amountExpenses || 0)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {props.lineDetails.comment ? <div>
                <h5>Commentaires</h5>
                <ul className={classes.list}>{(props.lineDetails.comment || "").split("\n").map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div> : null}
        </DialogContent> : null}
    </Dialog>;
});