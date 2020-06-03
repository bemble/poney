import {IconButton, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {deleteLine} from "./core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowAltCircleDown, faArrowAltCircleUp, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";

const useStyle = makeStyles(theme => ({
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
    }, [props.id, props.color]);

    const deleteCurrentLine = async () => {
        await deleteLine(id);
        props.onDeleted && props.onDeleted(initialId)
    };

    if (!props.isReordering) {
        return <div className={classes.tools}>
            <IconButton aria-label="Editer" className={classes.tool} onClick={() => props.onEdit && props.onEdit()}>
                <FontAwesomeIcon icon={faEdit}/>
            </IconButton>
            <IconButton aria-label="Supprimer" onClick={deleteCurrentLine} className={classes.tool}>
                <FontAwesomeIcon icon={faTrash}/>
            </IconButton>
        </div>;
    }

    return <div className={classes.tools}>
        {props.isFirst ? <span className={classes.empty}/> :
            <IconButton aria-label="Monter" onClick={() => props.onUpClicked(props.id)} className={classes.tool}>
                <FontAwesomeIcon icon={faArrowAltCircleUp}/>
            </IconButton>}
        {props.isLast ? <span className={classes.empty}/> :
            <IconButton aria-label="Descendre" className={classes.tool} onClick={() => props.onDownClicked(props.id)}>
                <FontAwesomeIcon icon={faArrowAltCircleDown}/>
            </IconButton>}
    </div>;
});