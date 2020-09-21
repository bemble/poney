import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    useTheme,
    useMediaQuery, Grid
} from "@material-ui/core";
import Api from "../../core/Api";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";

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
    link: {
        textDecoration: "none",
        textAlign: "center"
    }
}));

export default React.memo((props) => {
    const [label, setLabel] = useState(props.label || "");

    const handleClose = async (save) => {
        if (save) {
            await Api.addOrUpdate(`budget`, props.id, {label, inUse: props.inUse});
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
                     id="form-dialog-title">{isEdit ? "Editer le budget" : "Créer un budget"}
        </DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                {isEdit ? <Link to={`/budgets/${props.id}`} className={classes.link}>
                    <Button variant="contained" color="secondary">
                        Editer le contenu
                    </Button>
                </Link> : null}
                <Grid item>
                    <TextField
                        autoFocus
                        value={label}
                        margin="dense"
                        id="label"
                        label="Libelle"
                        fullWidth
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose()} variant="contained" color="default">
                Annuler
            </Button>
            <Button onClick={() => handleClose(true)} variant="contained" color="primary">
                {isEdit ? "Editer" : "Créer"}
            </Button>
        </DialogActions>
    </Dialog>
});