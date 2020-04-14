import {IconButton} from "@material-ui/core";
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

export default React.memo((props) => {
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

    return <div>
        <IconButton aria-label="Supprimer" onClick={deleteCurrentLine}>
            <DeleteIcon fontSize="small"/>
        </IconButton>
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
    </div>;
});