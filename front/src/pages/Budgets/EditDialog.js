import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField} from "@material-ui/core";
import Api from "../../core/Api";

export default React.memo((props) => {
    const [label, setLabel] = useState(props.label || "");

    const handleClose = async (save) => {
        if (save) {
            await Api.addOrUpdate(`budget`, props.id, {label, inUse: props.inUse});
        }
        props.onClose && props.onClose(save);
    };

    const isEdit = props.id;
    return <Dialog open={true} onClose={() => handleClose()} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{isEdit ? "Editer le budget" : "Créer un budget"}</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                value={label}
                margin="dense"
                id="label"
                label="Libelle"
                fullWidth
                onChange={(e) => setLabel(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose()} color="primary">
                Annuler
            </Button>
            <Button onClick={() => handleClose(true)} color="primary">
                {isEdit ? "Editer" : "Créer"}
            </Button>
        </DialogActions>
    </Dialog>
});