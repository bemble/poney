import {IconButton, makeStyles} from "@material-ui/core";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import Api from "../../../core/Api";
import store from "../../../store";

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

    const handleDelete = async () => {
        await Api.delete(`project_line`, props.id);
        const index = store.getState().project.lines.findIndex(l => l.id === props.id);
        if (index >= 0) {
            store.dispatch({type: "DELETE", project: {lines: index}});
        }
        props.onDeleted && props.onDeleted(props.id);
    };

    const handleEdit = () => {
        store.dispatch({type: "SET", project: {editLineId: props.id}});
    };

    return <div className={classes.tools}>
        <IconButton aria-label="Editer" className={classes.tool} onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit}/>
        </IconButton>
        <IconButton aria-label="Supprimer" onClick={handleDelete} className={classes.tool}>
            <FontAwesomeIcon icon={faTrash}/>
        </IconButton>
    </div>;
});