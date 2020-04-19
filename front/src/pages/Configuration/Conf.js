import React, {useContext, useEffect, useState} from 'react';
import {FormControlLabel, Switch, TextField} from "@material-ui/core";
import {ConfigurationContext} from "./Context";
import Api from "../../core/Api";
import {makeStyles} from "@material-ui/core/styles";

let savedTimeout = null;

const useStyles = makeStyles((theme) => ({
    text: {
        color: theme.palette.text.primary
    }
}));

export default function Conf(props) {
    const {startLoad, stopLoad} = useContext(ConfigurationContext);

    const [value, setValue] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            startLoad();
            const config = await Api.get(`configuration`, props.id);
            let value = config ? config.value : "";
            if (props.toggle) {
                value = value === "1";
            }
            setValue(value);
            stopLoad();
        })();
    }, [props.id]);

    const save = async (changeValue) => {
        if (!saved) {
            startLoad();
            await Api.addOrUpdate(`configuration`, props.id, {value: changeValue || value});
            setSaved(true);
            stopLoad();
        }
    };

    const handleChange = ({target}) => {
        const newValue = props.toggle ? target.value === "1" : target.value;
        setValue(newValue);
        setSaved(false);
        clearTimeout(savedTimeout);
        savedTimeout = setTimeout(async () => {
            await save(target.value);
        }, 1000);
        props.onChange && props.onChange(newValue);
    };

    const handleBlur = async () => {
        clearTimeout(savedTimeout);
        await save();
    };

    const classes = useStyles();
    if (props.toggle) {
        return <FormControlLabel className={classes.text} control={<Switch
            onChange={(e) => handleChange(e.target.checked ? {target: {value: "1"}} : {target: {value: "0"}})}
            checked={Boolean(value)}/>} label={props.label}/>;
    }

    return <TextField
        label={props.label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        margin="normal"
        fullWidth
    />;
}