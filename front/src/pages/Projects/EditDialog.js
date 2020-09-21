import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    FormControlLabel,
    Switch, useMediaQuery, useTheme, makeStyles
} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import moment from "moment";
import "moment/locale/fr";
import {Link} from "react-router-dom";
import Api from "../../core/Api";

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
    const [endAt, setEndAt] = useState(props.endAt || moment.utc());
    const [hidden, setHidden] = useState(!!props.hidden);

    const handleClose = async (save) => {
        if (save) {
            await Api.addOrUpdate(`project`, props.id, {
                label, endAt: endAt.unix(), hidden
            });
        }
        props.onClose && props.onClose(save);
    };

    const isEdit = props.id;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    return <Dialog open={true} fullScreen={fullScreen} onClose={() => handleClose()} className={classes.dialog}>
        <DialogTitle className={classes.dialogTitle} id="form-dialog-title">{isEdit ? "Editer le projet" : "Créer un projet"}</DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                {isEdit ? <Link to={`/projets/${props.id}`} className={classes.link}>
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
                <Grid item>
                    <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
                        <DatePicker
                            variant="inline"
                            openTo="year"
                            views={["year", "month"]}
                            label="Fin du projet"
                            helperText="Mois ou le projet se concrétisera"
                            value={endAt}
                            onChange={setEndAt}
                            autoOk={true}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item>
                    <FormControlLabel className={classes.switch} control={<Switch onChange={(e) => setHidden(e.target.checked)} checked={hidden}/>} label="Projet caché"/>
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