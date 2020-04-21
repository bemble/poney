import {
    Checkbox,
    FormControl,
    TextField,
    ListItemText,
    makeStyles,
    MenuItem,
    Select,
    InputLabel
} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {updateField} from "./core";
import store from "../Store";

const useStyle = makeStyles(theme => ({
    parentCategory: {
        padding: 8,
        border: `1px solid ${theme.palette.background.default}`,
        background: theme.palette.background.default,
        color: theme.palette.text.primary
    }
}));

let savedTimeout = null;

export default function LineInput(props) {
    const [value, setValue] = useState(props.joinWith ? "" : []);
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
            let newValue = changeValue === undefined ? value : changeValue;
            if (props.joinWith) {
                newValue = newValue.join(props.joinWith);
            }

            const newId = await updateField(id, props.name, newValue);
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
        if (props.joinWith && typeof value !== "string") {
            return <FormControl fullWidth>
                {props.label ? <InputLabel>{props.label}</InputLabel> : null}
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
        return <FormControl fullWidth>
            {props.label ? <InputLabel>{props.label}</InputLabel> : null}
            <Select value={value} onChange={handleChange} label={props.label || ""}>
                {props.possibleValues.map((v, i) => <MenuItem value={v.value} key={i}>{v.label}</MenuItem>)}
            </Select>
        </FormControl>;
    }

    const inputProps = props.alignRight ? {style: {textAlign: "right"}} : {};

    return <TextField value={value} inputProps={inputProps} onChange={handleChange} onBlur={handleBlur} fullWidth
                      label={props.label || ""}/>;
}