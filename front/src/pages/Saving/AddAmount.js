import React, {useState, useEffect} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    MenuItem,
    TextField,
    ListItemText, useMediaQuery, useTheme, makeStyles,
    FormControlLabel, Checkbox, IconButton
} from "@material-ui/core";
import moment from "moment";
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
import MomentUtils from '@date-io/moment';
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {ColorLens as ColorIcon} from "@material-ui/icons";
import {BlockPicker} from "react-color";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    title: {
        [theme.breakpoints.down("xs")]: {
            color: "#FFF",
            background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
            "& *": {
                fontWeight: 400
            }
        }
    }
}));

export default React.memo((props) => {
    const [lineId, setLineId] = useState();
    const [budgetLineId, setBudgetLineId] = useState();
    const [amount, setAmount] = useState(0);
    const [color, setColor] = useState("transparent");
    const [isExpense, setIsExpense] = useState(true);
    const [comment, setComment] = useState("");
    const [category, setCategory] = useState("");
    const [month, setMonth] = useState(moment.utc());
    const [lines, setLines] = useState([]);
    const [budgetLines, setBudgetLines] = useState([]);

    const [displayPicker, setDisplayPicker] = useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const classes = useStyles();

    useEffect(() => {
        (async () => {
            setLines(await Api.list(`saving`));
            setBudgetLines(await Api.service(`savings/budget_lines`));

            setLineId(null);
            setBudgetLineId(null);
            setMonth(moment.utc());
            setAmount(0);
            setCategory("");
            setComment("");
            setColor("transparent");
            setDisplayPicker(false);
            setIsExpense(true);
        })();
    }, [props.visible]);

    const handleColorChange = ({hex}) => {
        setColor(hex);
        setDisplayPicker(false);
    };

    const handleClose = () => {
        (async () => {
            let realId = lineId;
            let newSavingCreated = false;
            if (lineId < 0) {
                const newSaving = await Api.add(`saving`, {idBudgetLine: budgetLineId, label: category, color});
                setLines(await Api.list(`saving`));
                setLineId(newSaving.id);
                realId = newSaving.id;
                newSavingCreated = true;
            }
            const cleanMonth = month.format('YYYY-MM');
            const [line] = await Api.search(`savingLine`, {$where: {idSaving: realId, month: cleanMonth}});

            const newAmount = parseFloat("" + amount);
            let newComment = false;
            if (comment.length) {
                const sign = isExpense ? "-" : "";
                newComment = `${comment} (${moment().format("DD/MM HH:mm")}): ${sign}${newAmount}`;
            }

            if (line) {
                const field = isExpense ? "amountExpenses" : "amountIncomes";

                const newValues = {
                    [field]: {$: {$coalesce: [`~~${field}`, 0], $add: newAmount}}
                };

                if (newComment) {
                    newValues.comment = {$concat: [{$coalesce: [{$concat: [`~~comment`, '\n']}, ""]}, newComment]};
                }
                await Api.update(`saving_line`, line.id, newValues);
            } else {
                await Api.add(`saving_line`, {
                    month: cleanMonth,
                    idSaving: realId,
                    amountIncomes: isExpense ? 0 : newAmount,
                    amountExpenses: isExpense ? newAmount : 0,
                    comment: newComment || null
                });
            }
            props.onClose && props.onClose(newSavingCreated);
        })();
    };

    const handleCancel = () => {
        props.onClose && props.onClose();
    };

    return <Dialog open={props.visible} onClose={handleCancel} fullScreen={fullScreen}>
        <DialogTitle className={classes.title}>Ajouter un revenu ou une dépense</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <TextField fullWidth select label="Catégorie" value={lineId}
                           onChange={(e) => setLineId(e.target.value)}>
                    {lines.map(({label, id}, i) => <MenuItem key={label + i} value={id}>
                        <ListItemText primary={label}/>
                    </MenuItem>)}
                    <MenuItem value={-1}><ListItemText primary="Nouvelle..."/> </MenuItem>
                </TextField>
                {lineId === -1 ? <div>
                    <IconButton aria-label="Couleur" onClick={() => setDisplayPicker(!displayPicker)}>
                        <ColorIcon fontSize="small"/>
                    </IconButton>
                    {displayPicker ? <div style={{
                        position: "absolute",
                        zIndex: 10000,
                        marginLeft: 85,
                        marginTop: -128
                    }}>
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                        }} onClick={() => setDisplayPicker(!displayPicker)}/>
                        <BlockPicker color={color} triangle={"hide"} onChange={handleColorChange}
                                     colors={[red[100], pink[100], purple[100], deepPurple[100], indigo[100], blue[100],
                                         lightBlue[100], cyan[100], teal[100], green[100], lightGreen[100], lime[100], yellow[100],
                                         amber[100], orange[100], deepOrange[100], brown[100], grey[100], blueGrey[100], "#FFFFFF"]}/>
                    </div> : null}
                    <TextField fullWidth select label="Catégorie du budget" value={budgetLineId}
                               onChange={(e) => setBudgetLineId(e.target.value) || setCategory(budgetLines.find((el) => el.id === e.target.value).label)}>
                        {budgetLines.map(({budgetLabel, label, id}, i) => <MenuItem key={label + i} value={id}>
                            <ListItemText primary={budgetLabel + "/" + label}/>
                        </MenuItem>)}
                    </TextField>
                    <TextField label="Nouvelle catégorie" fullWidth value={category}
                               onChange={(e) => setCategory(e.target.value)}/>
                </div> : null}
                <TextField label="Montant" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)}
                           type="number"/>
                <FormControlLabel
                    control={
                        <Checkbox checked={isExpense} onChange={(e) => setIsExpense(e.target.checked)}
                                  value="isExpense"/>
                    }
                    label="Dépense"
                />
                <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
                    <DatePicker
                        variant="inline"
                        openTo="month"
                        views={["year", "month"]}
                        label="Mois"
                        value={month}
                        onChange={setMonth}
                        autoOk={true}
                    />
                </MuiPickersUtilsProvider>
                <TextField label="Commentaire" fullWidth value={comment} onChange={(e) => setComment(e.target.value)}/>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancel} color="secondary">
                Annuler
            </Button>
            <Button onClick={handleClose} color="primary" variant="contained">
                Ajouter
            </Button>
        </DialogActions>
    </Dialog>;
})