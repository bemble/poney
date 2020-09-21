import {
    Dialog,
    DialogContent,
    DialogTitle,
    Slide,
    makeStyles, TextField, DialogActions, Button
} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import React, {useState, useEffect} from "react";
import {blue, green, indigo, red} from "@material-ui/core/colors";
import Api from "../../core/Api";
import SlideUpTransition from "../../components/SlideUpTransition";

const useStyles = makeStyles(theme => ({
    dialog: {
        top: '10vh !important',
        maxWidth: 600,
        margin: "0 auto",
        "& .MuiPaper-root.MuiDialog-paper": {
            paddingBottom: `env(safe-area-inset-bottom)`
        }
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

export default React.memo((props) => {
    const [isSaving, setIsSaving] = useState(false);
    const [amountIncomes, setAmountIncomes] = useState(props.line && props.line.amountIncomes || 0);
    const [amountExpenses, setAmountExpenses] = useState(props.line && props.line.amountExpenses || 0);
    const [comment, setComment] = useState(props.line && props.line.comment || "");

    useEffect(() => {
        setAmountIncomes(props.line && props.line.amountIncomes || 0);
        setAmountExpenses(props.line && props.line.amountExpenses || 0);
        setComment(props.line && props.line.comment || "");
    }, [props.line]);

    const handleClose = (saved) => {
        (async () => {
            if (saved) {
                setIsSaving(true);
                await Api.addOrUpdate('saving_line', props.line.id, {
                    amountExpenses, amountIncomes, comment
                });
            }
            setIsSaving(false);
            props.onClose && props.onClose(saved);
        })();
    };

    const classes = useStyles();

    return <Dialog fullScreen open={props.line !== null} className={classes.dialog}
                   TransitionComponent={SlideUpTransition}>
        <DialogTitle className={classes.dialogTitle}>
            Edition
            {!isSaving ? <FontAwesomeIcon icon={faTimesCircle} onClick={handleClose}/> : null}
        </DialogTitle>
        {props.line ? <DialogContent>
            <h4>{props.line.label}</h4>
            <TextField label="Revenus" fullWidth value={amountIncomes}
                       onChange={(e) => setAmountIncomes(e.target.value)}
                       type="number"/>
            <TextField label="Dépenses" fullWidth value={amountExpenses}
                       onChange={(e) => setAmountExpenses(e.target.value)}
                       type="number"/>
            <TextField multiline label="Commentaires"
                       rows={4} fullWidth value={comment}
                       onChange={(e) => setComment(e.target.value)}/>
        </DialogContent> : null}
        <DialogActions>
            <Button disabled={isSaving} onClick={() => handleClose()} variant="contained" color="default">
                Annuler
            </Button>
            <Button disabled={isSaving} onClick={() => handleClose(true)} variant="contained" color="primary">
                Editer
            </Button>
        </DialogActions>
    </Dialog>;
});