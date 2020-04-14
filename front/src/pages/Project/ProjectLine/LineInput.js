import {Input} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {updateField} from "./core";
import store from "../Store";

let savedTimeout = null;

export default function LineInput(props) {
    const [value, setValue] = useState(props.grouped ? "" : []);
    const [id, setId] = useState(props.id);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if (props.id !== id) {
            setId(props.id);
        }
    }, [props.id]);

    const save = async (changeValue) => {
        if (!saved) {
            const newId = await updateField(id, props.name, changeValue === undefined ? value : changeValue);
            if (id < 0) {
                setId(newId);
                props.onCreated && props.onCreated(newId);
            }
        }
    };

    const handleChange = ({target}) => {
        let newValue = target.value;
        if (props.number) {
            newValue = parseFloat(newValue.replace(',', '.')) || 0;
        }

        const propsToStoreFunc = {
            amount: "addAmount",
            expectedAmount: "addExpected",
            alreadyPaidAmount: "addAlreadyPaid"
        };

        if (propsToStoreFunc[props.name]) {
            store[propsToStoreFunc[props.name]](newValue - value);
        }

        setValue(newValue);

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

    const inputProps = props.alignRight ? {style: {textAlign: "right", width: 70}} : {};

    return <Input value={value} inputProps={inputProps} multiline={props.multiline} onChange={handleChange}
                  onBlur={handleBlur}/>;
}