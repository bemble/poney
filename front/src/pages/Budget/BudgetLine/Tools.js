import {IconButton, makeStyles, TableCell} from "@material-ui/core";
import {Delete as DeleteIcon, ColorLens as ColorIcon} from "@material-ui/icons";
import {BlockPicker} from "react-color";
import React, {useEffect, useState} from "react";
import {deleteLine, updateField} from "./core";
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


const useStyle = makeStyles({
        tool: {
            fontSize: 16,
            padding: 5
        },
        color: {
            width: 8,
            height: 8,
            display: "inline-block",
            borderRadius: 4
        }
    })
;

export default React.memo((props) => {
    const classes = useStyle();

    const [displayPicker, setDisplayPicker] = useState(false);
    const [id, setId] = useState(props.id);
    const [color, setColor] = useState("transparent");
    const [initialId, setInitialId] = useState(props.initialId);

    useEffect(() => {
        if (props.id !== id) {
            setId(props.id);
        }
        setColor(props.color || "transparent");
    }, [props.id, props.color]);

    const deleteCurrentLine = async () => {
        await deleteLine(id);
        props.onDeleted && props.onDeleted(initialId)
    };

    const handleColorChange = ({hex}) => {
        setColor(hex);
        setDisplayPicker(false);
        props.onColorChanged && props.onColorChanged(hex);
        updateField(id, "color", hex);
    };

    return <div className={classes.tools}>
        <IconButton aria-label="Supprimer" onClick={deleteCurrentLine} className={classes.tool}>
            <DeleteIcon fontSize="small"/>
        </IconButton>
        <IconButton aria-label="Couleur" onClick={() => setDisplayPicker(!displayPicker)} className={classes.tool}>
            <ColorIcon fontSize="small"/>
        </IconButton>
        <div className={classes.color} style={{backgroundColor: color}}/>
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
                         colors={[red[400], pink[400], purple[400], deepPurple[400], indigo[400], blue[400],
                             lightBlue[400], cyan[400], teal[400], green[400], lightGreen[400], lime[400], yellow[400],
                             amber[400], orange[400], deepOrange[400], brown[400], grey[400], blueGrey[400], "#FFFFFF"]}/>
        </div> : null}
    </div>;
});