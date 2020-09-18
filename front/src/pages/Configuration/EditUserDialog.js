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
    link: {
        textDecoration: "none",
        textAlign: "center"
    }
}));

export default React.memo((props) => {
    const [email, setEmail] = useState(props.email || "");
    const [password, setPassword] = useState("");

    const handleClose = async (save) => {
        if (save) {
            await Api.addOrUpdate(`users`, props.id, {email, password: password.length ? password: undefined});
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
                     id="form-dialog-title">{isEdit ? "Editer l'utilisateur" : "Créer un utilisateur"}
        </DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <TextField
                        autoFocus
                        value={email}
                        margin="dense"
                        id="email"
                        label="E-mail"
                        fullWidth
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        value={password}
                        margin="dense"
                        id="password"
                        label="Mot de passe"
                        type="password"
                        inputProps={{pattern: "[0-9]*", inputMode: "numeric"}}
                        autoComplete="current-password"
                        fullWidth
                        onChange={(e) => setPassword(e.target.value)}
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