import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button, CircularProgress,
    useTheme,
    useMediaQuery, Grid, TextField, Slide
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Api from "../../core/Api";
import store from "../../store";
import SlideUpTransition from "../../components/SlideUpTransition";

const useStyles = makeStyles(theme => ({
    dialog: {
        "& .MuiPaper-root.MuiDialog-paper": {
            paddingBottom: `env(safe-area-inset-bottom)`
        }
    },
    dialogTitle: {
        [theme.breakpoints.down("sm")]: {
            color: theme.palette.primary.contrastText,
            background: theme.palette.primary.dark,
            "& *": {
                fontWeight: 400
            }
        }
    },
    switch: {
        color: theme.palette.text.primary
    },
    item: {
        marginBottom: theme.spacing(4)
    },
    parentCategory: {
        paddingLeft: theme.spacing(),
        borderBottom: `1px solid ${theme.palette.primary.main}`
    },
    picker: {
        width: '100%',
        background: `${theme.palette.background.default} !important`,
        "& > div:nth-child(2)": {
            height: `38px !important`
        },
        "& > div:nth-child(2) > *": {
            display: "none"
        },
        "& input": {
            background: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
        }
    },
    loader: {
        width: `24px !important`,
        height: `24px !important`,
        marginLeft: theme.spacing()
    }
}));

export default React.memo((props) => {
    const {project} = store.getState();
    const line = project.lines.filter(l => l.id === project.editLineId)[0] || {};

    const [editLineId, setEditLineId] = useState(project.editLineId);
    const [label, setLabel] = useState(line.label || "");
    const [amount, setAmount] = useState(line.amount || 0);
    const [expectedAmount, setExpectedAmount] = useState(line.expectedAmount || 0);
    const [alreadyPaidAmount, setAlreadyPaidAmount] = useState(line.alreadyPaidAmount || 0);
    const [comment, setComment] = useState(line.comment || "");
    const [isSaving, setIsSaving] = useState(false);

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

    const handleClose = async (save) => {
        if (save) {
            setIsSaving(true);
            const newAmount = parseFloat(("" + amount).replace(',', '.'));
            const newExpectedAmount = parseFloat(("" + expectedAmount).replace(',', '.'));
            const newAlreadyPaidAmount = parseFloat(("" + alreadyPaidAmount).replace(',', '.'));
            await Api.addOrUpdate(`projectLine`, store.getState().project.editLineId, {
                idProject: store.getState().project.id,
                label, amount: newAmount, expectedAmount: newExpectedAmount,
                alreadyPaidAmount: newAlreadyPaidAmount, comment
            });

            props.onSaved && props.onSaved();
            setIsSaving(false);
        }
        store.dispatch({
            type: "SET", project: {editLineId: -1}
        });
    };

    const isEdit = editLineId > 0;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    return <Dialog open={editLineId >= 0} fullScreen={fullScreen} onClose={handleClose}
                   className={classes.dialog} TransitionComponent={SlideUpTransition}>
        <DialogTitle className={classes.dialogTitle}
                     id="form-dialog-title">{isEdit ? "Editer la ligne" : "Créer une ligne"}
        </DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12} className={classes.item}>
                    <TextField value={label} onChange={({target}) => setLabel(target.value)} fullWidth label="Libellé"/>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <TextField value={expectedAmount}
                               onChange={({target}) => setExpectedAmount(target.value)}
                               fullWidth label="Montant budgetisé"/>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <TextField value={alreadyPaidAmount}
                               onChange={({target}) => setAlreadyPaidAmount(target.value)}
                               fullWidth label="Montant avancé"/>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <TextField value={amount}
                               onChange={({target}) => setAmount(target.value)}
                               fullWidth label={`Montant payé `}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField multiline label="Commentaires"
                               rows={4} fullWidth value={comment}
                               onChange={(e) => setComment(e.target.value)}/>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose()} variant="contained" color="default" disabled={isSaving}>
                Annuler
            </Button>
            <Button onClick={() => handleClose(true)} variant="contained" color="primary"
                    disabled={!(label && expectedAmount) || isSaving}>
                {isEdit ? "Editer" : "Créer"}
                {isSaving ? <CircularProgress className={classes.loader}/> : null}
            </Button>
        </DialogActions>
    </Dialog>
});