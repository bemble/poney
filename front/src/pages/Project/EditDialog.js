import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button, CircularProgress,
    useTheme,
    useMediaQuery, Grid, TextField
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Api from "../../core/Api";
import store from "./Store";

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
    const [label, setLabel] = useState(props.label || "");
    const [amount, setAmount] = useState(props.amount || 0);
    const [expectedAmount, setExpectedAmount] = useState(props.expectedAmount || 0);
    const [alreadyPaidAmount, setAlreadyPaidAmount] = useState(props.alreadyPaidAmount || 0);
    const [comment, setComment] = useState(props.comment || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleClose = async (save) => {
        if (save) {
            setIsSaving(true);
            const newAmount = parseFloat(("" + amount).replace(',', '.'));
            const newExpectedAmount = parseFloat(("" + expectedAmount).replace(',', '.'));
            const newAlreadyPaidAmount = parseFloat(("" + alreadyPaidAmount).replace(',', '.'));
            save = await Api.addOrUpdate(`projectLine`, props.id, {
                idProject: props.idProject,
                label, amount: newAmount, expectedAmount: newExpectedAmount,
                alreadyPaidAmount: newAlreadyPaidAmount, comment
            });

            setIsSaving(false);
        }
        props.onClose && props.onClose(save);
    };

    const isEdit = props.id;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    return <Dialog open={true} fullScreen={fullScreen} onClose={() => handleClose()}
                   aria-labelledby="form-dialog-title" className={classes.dialog}>
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