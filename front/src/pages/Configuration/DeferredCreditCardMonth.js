import React, {useContext, useEffect, useState} from 'react';
import {TextField} from "@material-ui/core";
import {ConfigurationContext} from "./Context";
import Api from "../../core/Api";

let savedTimeout = null;

export default function DeferredCreditCardMonth(props) {
    const {startLoad, stopLoad} = useContext(ConfigurationContext);

    const [day, setDay] = useState("");
    const [id, setId] = useState("");
    const [year, setYear] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setYear(props.year);
        (async () => {
            startLoad();
            const [date] = await Api.search(`credit_card_calendar`, {
                $where: {
                    year: props.year,
                    month: parseInt(props.month)
                },
                $limit: 1
            });
            setId(date ? date.id : null);
            setDay(date ? date.day : "");
            stopLoad();
        })();
    }, [props.year]);

    const save = async (value) => {
        if (!saved) {
            startLoad();
            const obj = await Api.addOrUpdate(`credit_card_calendar`, id, {
                year,
                month: parseInt(props.month),
                day: parseInt(value || day)
            });
            if (!id && obj.id) {
                setId(obj.id);
            }
            setSaved(true);
            stopLoad();
        }
    };

    const handleChange = ({target}) => {
        setDay(target.value);
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
        value={day}
        onChange={handleChange}
        onBlur={handleBlur}
        margin="normal"
    />;
}