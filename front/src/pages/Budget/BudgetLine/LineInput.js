import {Checkbox, FormControl, Input, ListItemText, makeStyles, MenuItem, Select} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {updateField} from "./core";
import {grey} from "@material-ui/core/colors";
import store from "../Store";

const useStyle = makeStyles({
    parentCategory: {
        padding: 8,
        border: `1px solid ${grey[300]}`,
        background: grey[200]
    }
});

let savedTimeout = null;

export default function LineInput(props) {
    const [value, setValue] = useState(props.grouped ? "" : []);
    const [id, setId] = useState(props.id);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if(props.id !== id) {
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
            if (props.name === "operationKind") {
                store.refreshFromDatabase();
            }
        }
    };

    const handleChange = ({target}) => {
        let newValue = target.value;
        if (props.number) {
            newValue = parseFloat(newValue.replace(',', '.')) || 0;
        }

        if (props.name === "amount") {
            const funcName = `add${props.isIncome ? "Income" : "Expense"}`;
            store[funcName](newValue - value);
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

    const classes = useStyle();

    if (props.possibleValues) {
        if (props.grouped && typeof value !== "string") {
            return <FormControl>
                <Select multiple value={value}
                        onChange={handleChange}
                        renderValue={selected => selected.join('; ')}
                >
                    {props.possibleValues.map(({label, isParent}, i) => <MenuItem key={label + i}
                                                                                  value={label}
                                                                                  disabled={!!isParent}
                                                                                  className={isParent ? classes.parentCategory : ""}>
                        {!isParent ? <Checkbox checked={(value || []).indexOf(label) > -1}/> : null}
                        <ListItemText primary={label}/>
                    </MenuItem>)}
                </Select>
            </FormControl>;
        }
        return <Select value={value} onChange={handleChange}>
            {props.possibleValues.map((v, i) => <MenuItem value={v.value} key={i}>{v.label}</MenuItem>)}
        </Select>;
    }

    const inputProps = props.alignRight ? {style: {textAlign: "right"}} : {};

    return <Input value={value} inputProps={inputProps} onChange={handleChange} onBlur={handleBlur}/>;
}