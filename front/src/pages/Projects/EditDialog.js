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
import {useHistory} from "react-router-dom";
import {blue, indigo} from "@material-ui/core/colors";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    dialogTitle: {
        [theme.breakpoints.down("sm")]: {
            color: "#FFF",
            background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
            "& *": {
                fontWeight: 400
            }
        }
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

    const history = useHistory();
    const handleEditContent = () => {
        history.push(`/projets/${props.id}`);
    };

    const isEdit = props.id;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    return <Dialog open={true} fullScreen={fullScreen} onClose={() => handleClose()} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.dialogTitle} id="form-dialog-title">{isEdit ? "Editer le projet" : "Créer un projet"}</DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                {isEdit ? <Button onClick={() => handleEditContent()} variant="text" color="secondary">
                        Editer le contenu
                    </Button> : null}
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
                    <FormControlLabel control={<Switch onChange={(e) => setHidden(e.target.checked)} checked={hidden}/>} label="Projet caché"/>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose()} variant="contained" color="secondary">
                Annuler
            </Button>
            <Button onClick={() => handleClose(true)} variant="contained" color="primary">
                {isEdit ? "Editer" : "Créer"}
            </Button>
        </DialogActions>
    </Dialog>
});