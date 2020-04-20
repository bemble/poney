import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useTheme,
    useMediaQuery, Grid
} from "@material-ui/core";
import {
    amber,
    blue, blueGrey, brown,
    cyan, deepOrange,
    deepPurple,
    green, grey,
    indigo,
    lightBlue,
    lightGreen, lime, orange,
    pink,
    purple,
    red,
    teal, yellow
} from "@material-ui/core/colors";

import {BlockPicker} from "react-color";
import Api from "../../../core/Api";
import {makeStyles} from "@material-ui/core/styles";


import {operationKinds, linxoCategories} from "./core";
import LineInput from "./LineInput";
import updateField from "./core/updateField";

const useStyles = makeStyles(theme => ({
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
    }
}));

export default React.memo((props) => {
    const [color, setColor] = useState(props.color || "transparent");

    const handleColorChange = ({hex}) => {
        setColor(hex);
        updateField(props.id, "color", hex);
    };

    const handleClose = async (save) => {
        props.onClose && props.onClose(save);
    };

    const isEdit = props.id;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();

    const fields = {
        "label": {label: "Libellé"},
        "amount": {label: "Montant", number: true, isIncome: !!props.isIncome},
        "operationKind": {label: "Type d'opération", possibleValues: operationKinds},
        "categories": {label: "Catégories Linxo", possibleValues: linxoCategories, grouped: true},
        "dayOfMonth": {label: "Jour du mois"}
    };

    return <Dialog open={true} fullScreen={fullScreen} onClose={() => handleClose()}
                   aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.dialogTitle}
                     id="form-dialog-title">{isEdit ? "Editer la ligne" : "Créer une ligne"}
        </DialogTitle>
        <DialogContent>
            <Grid container direction="column" spacing={1}>
                {Object.keys(fields).map((fieldName, i) => <Grid item xs={12} key={i} className={classes.item}>
                    <LineInput id={props.id} name={fieldName} value={props[fieldName]} {...fields[fieldName]}/>
                </Grid>)}
                <Grid item xs={12} className={classes.item}>
                    <BlockPicker color={color} triangle={"hide"} onChange={handleColorChange} width={"100%"}
                                 className={classes.picker}
                                 colors={[red[400], pink[400], purple[400], deepPurple[400], indigo[400], blue[400],
                                     lightBlue[400], cyan[400], teal[400], green[400], lightGreen[400], lime[400], yellow[400],
                                     amber[400], orange[400], deepOrange[400], brown[400], grey[400], blueGrey[400], "#FFFFFF"]}/>
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