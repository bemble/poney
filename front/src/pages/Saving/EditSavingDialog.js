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
    ListItemText, useMediaQuery, useTheme, makeStyles
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
    },
    picker: {
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        boxShadow: "none !important",
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
    const [budgetLines, setBudgetLines] = useState();
    const [idBudgetLine, setIdBudgetLine] = useState(0);
    const [color, setColor] = useState("transparent");
    const [label, setLabel] = useState("");

    const [displayPicker, setDisplayPicker] = useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const classes = useStyles();

    useEffect(() => {
        (async () => {
            setBudgetLines(await Api.service(`savings/budget_lines`));
            setDisplayPicker(false);
            if (props.saving) {
                setIdBudgetLine(props.saving.idBudgetLine);
                setColor(props.saving.color);
                setLabel(props.saving.label);
            }
        })();
    }, [props.saving]);

    const handleColorChange = ({hex}) => {
        setColor(hex);
        setDisplayPicker(false);
    };

    const handleClose = () => {
        (async () => {
            await Api.update(`saving`, props.saving.id, {
                label, color, idBudgetLine
            });
            props.onClose && props.onClose(true);
        })();
    };

    const handleArchive = () => {
        (async () => {
            await Api.update(`saving`, props.saving.id, {
                isArchived: !props.saving.isArchived
            });
            props.onClose && props.onClose(true);
        })();
    };

    const handleCancel = () => {
        props.onClose && props.onClose();
    };

    return <Dialog open={!!props.saving} onClose={handleCancel} fullScreen={fullScreen}>
        <DialogTitle className={classes.title}>Editer la catégorie d'épargne</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <TextField fullWidth label="Catégorie" value={label}
                           onChange={(e) => setLabel(e.target.value)}/>
                <BlockPicker color={color} triangle={"hide"} onChange={handleColorChange} width={"100%"}
                             className={classes.picker}
                             colors={[red[100], pink[100], purple[100], deepPurple[100], indigo[100], blue[100],
                                 lightBlue[100], cyan[100], teal[100], green[100], lightGreen[100], lime[100], yellow[100],
                                 amber[100], orange[100], deepOrange[100], brown[100], grey[100], blueGrey[100], "#FFFFFF"]}/>
                <TextField fullWidth select label="Catégorie du budget" value={idBudgetLine}
                           onChange={(e) => setIdBudgetLine(e.target.value)}>
                    {budgetLines && budgetLines.map(({budgetLabel, label, id}, i) => <MenuItem key={label + i}
                                                                                               value={id}>
                        <ListItemText primary={budgetLabel + "/" + label}/>
                    </MenuItem>)}
                </TextField>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancel} color="secondary">
                Annuler
            </Button>
            <Button onClick={handleArchive} color="secondary" variant="contained"
                    disabled={!props.saving || Math.floor(props.saving.total) !== 0}>
                {props.saving && !props.saving.isArchived ? "Archiver" : "Désarchiver"}
            </Button>
            <Button onClick={handleClose} color="primary" variant="contained">
                Éditer
            </Button>
        </DialogActions>
    </Dialog>
        ;
})