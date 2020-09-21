import {IconButton, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {deleteLine} from "./core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";

const useStyle = makeStyles(theme => ({
    tools: {
        width: "60px !important",
        minWidth: "60px !important",
        textAlign: "right"
    },
    tool: {
        fontSize: 16,
        padding: 5
    },
    empty: {
        display: "inline-block",
        width: 26,
        height: 16
    }
}));

export default React.memo((props) => {
    const classes = useStyle();

    const [id, setId] = useState(props.id);
    const [initialId] = useState(props.initialId);

    useEffect(() => {
        if (props.id !== id) {
            setId(props.id);
        }
    }, [props.id]);

    const deleteCurrentLine = async () => {
        await deleteLine(id);
        props.onDeleted && props.onDeleted(initialId)
    };

    return <div className={classes.tools}>
        <IconButton aria-label="Editer" className={classes.tool} onClick={() => props.onEdit && props.onEdit()}>
            <FontAwesomeIcon icon={faEdit}/>
        </IconButton>
        <IconButton aria-label="Supprimer" onClick={deleteCurrentLine} className={classes.tool}>
            <FontAwesomeIcon icon={faTrash}/>
        </IconButton>
    </div>;
});