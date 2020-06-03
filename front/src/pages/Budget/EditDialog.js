import React, {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button, CircularProgress,
    useTheme,
    useMediaQuery, Grid, TextField, InputLabel, Select, MenuItem, FormControl, Checkbox, ListItemText
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
import {makeStyles} from "@material-ui/core/styles";


import {operationKinds, linxoCategories} from "./BudgetLine/core";
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
    const [operationKind, setOperationKind] = useState(props.operationKind || "");
    const [categories, setCategories] = useState(props.categories || []);
    const [dayOfMonth, setDayOfMonth] = useState(props.dayOfMonth || 1);
    const [color, setColor] = useState(props.color || "transparent");
    const [isSaving, setIsSaving] = useState(false);

    const handleColorChange = ({hex}) => {
        setColor(hex);
    };

    const handleClose = async (save) => {
        if (save) {
            setIsSaving(true);
            const newAmount = parseFloat(("" + amount).replace(',', '.'));
            save = await Api.addOrUpdate(`budgetLine`, props.id, {
                idBudget: props.idBudget,
                isIncome: props.isIncome ? "1" : "0",
                label,
                amount: newAmount,
                operationKind,
                categories: categories.join('|'),
                order: 0,
                dayOfMonth: parseInt("" + dayOfMonth), color
            });

            const funcName = `add${props.isIncome ? "Income" : "Expense"}`;
            store[funcName]((props.amount || 0) - newAmount);

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
                    <TextField value={amount}
                               inputProps={{min: 0, step: 0.01}}
                               onChange={({target}) => setAmount(target.value)}
                               fullWidth label="Montant"/>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <FormControl fullWidth>
                        <InputLabel>Type d'opération</InputLabel>
                        <Select value={operationKind} onChange={({target}) => setOperationKind(target.value)}>
                            {operationKinds.map((v, i) => <MenuItem value={v.value} key={i}>{v.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <FormControl fullWidth>
                        <InputLabel>Catégories Linxo</InputLabel>
                        <Select multiple value={categories}
                                onChange={({target}) => setCategories(target.value)}
                                renderValue={selected => selected.join('; ')}
                        >
                            {linxoCategories.map(({label, isParent}, i) => <MenuItem key={label + i}
                                                                                     value={label}
                                                                                     className={isParent ? classes.parentCategory : ""}>
                                <Checkbox checked={(categories || []).indexOf(label) > -1}/>
                                <ListItemText primary={label}/>
                            </MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <TextField value={dayOfMonth}
                               type="number"
                               InputProps={{min: 1, max: 31}}
                               InputLabelProps={{shrink: true}}
                               onChange={({target}) => setDayOfMonth(target.value)}
                               fullWidth label="Jour du mois"/>
                </Grid>
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
            <Button onClick={() => handleClose()} variant="contained" color="default" disabled={isSaving}>
                Annuler
            </Button>
            <Button onClick={() => handleClose(true)} variant="contained" color="primary"
                    disabled={(!label || dayOfMonth <= 0 || dayOfMonth > 31 || amount <= 0 || !operationKind) || isSaving}>
                {isEdit ? "Editer" : "Créer"}
                {isSaving ? <CircularProgress className={classes.loader}/> : null}
            </Button>
        </DialogActions>
    </Dialog>
});