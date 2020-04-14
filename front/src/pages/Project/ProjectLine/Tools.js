import {IconButton} from "@material-ui/core";
import {Delete as DeleteIcon} from "@material-ui/icons";
import React, {useEffect, useState} from "react";
import {deleteLine} from "./core";

export default React.memo((props) => {
    const [id, setId] = useState(props.id);
    const [initialId] = useState(props.initialId);

    useEffect(() => {
        if (props.id !== id) {
            setId(props.id);
        }
    }, [props.id, props.color]);

    const deleteCurrentLine = async () => {
        await deleteLine(id);
        props.onDeleted && props.onDeleted(initialId)
    };

    return <div>
        <IconButton aria-label="Supprimer" onClick={deleteCurrentLine}>
            <DeleteIcon fontSize="small"/>
        </IconButton>
    </div>;
});