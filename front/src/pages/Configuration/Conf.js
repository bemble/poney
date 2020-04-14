import React, {useContext, useEffect, useState} from 'react';
import {TextField} from "@material-ui/core";
import {ConfigurationContext} from "./Context";
import Api from "../../core/Api";

let savedTimeout = null;

export default function Conf(props) {
    const {startLoad, stopLoad} = useContext(ConfigurationContext);

    const [value, setValue] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            startLoad();
            const {value} = await Api.get(`configuration`, props.id);
            setValue(value || "");
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
        setValue(target.value);
        setSaved(false);
        clearTimeout(savedTimeout);
        savedTimeout = setTimeout(async () => {
            await save(target.value);
        }, 1000);
    };

    const handleBlur = async () => {
        clearTimeout(savedTimeout);
        await save();
    };

    return <TextField
        label={props.label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        margin="normal"
    />;
}