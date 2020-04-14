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
import moment from "moment";
import {blue, indigo} from "@material-ui/core/colors";
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
    const [amount, setAmount] = useState(0);
    const [comment, setComment] = useState("");
    const [category, setCategory] = useState("");
    const [lines, setLines] = useState([]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const classes = useStyles();

    useEffect(() => {
        if (props.projectId === 0) {
            setLines([]);
        } else {
            (async () => {
                setLines(await Api.search(`project_line`, {
                    $where: {idProject: props.projectId}
                }));
            })();
        }
    }, [props.projectId]);

    const handleClose = () => {
        (async () => {
            const newAmount = parseFloat(amount);
            let newComment = false;
            if (comment.length) {
                newComment = `${comment} (${moment().format("DD/MM HH:mm")}): ${newAmount}`;
            }

            if (lineId > 0) {
                const newValues = {
                    amount: {$: {$coalesce: [`~~amount`, 0], $add: newAmount}}
                };

                if (newComment) {
                    newValues.comment = {$concat: [{$coalesce: [{$concat: [`~~comment`, '\n']}, ""]}, newComment]};
                }
                await Api.update(`project_line`, lineId, newValues);
            } else {
                await Api.add(`project_line`, {
                    label: category,
                    amount: newAmount,
                    expectedAmount: 0,
                    idProject: props.projectId,
                    comment: newComment || null
                });
            }

            props.onClose && props.onClose();
        })();
    };

    const handleCancel = () => {
        props.onClose && props.onClose();
    };

    return <Dialog open={props.projectId > 0} onClose={handleCancel} fullScreen={fullScreen}>
        <DialogTitle className={classes.title}>Ajouter une dépense</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <TextField fullWidth select label="Catégorie" value={lineId}
                           onChange={(e) => setLineId(e.target.value)}>
                    {lines.map(({label, id}, i) => <MenuItem key={label + i} value={id}>
                        <ListItemText primary={label}/>
                    </MenuItem>)}
                    <MenuItem value={-1}><ListItemText primary="Nouvelle..."/> </MenuItem>
                </TextField>
                {lineId === -1 ? <TextField label="Nouvelle catégorie" fullWidth value={category}
                                            onChange={(e) => setCategory(e.target.value)}/> : null}
                <TextField label="Montant" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)}
                           type="number"/>
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