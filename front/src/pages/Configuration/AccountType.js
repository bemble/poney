import {makeStyles, MenuItem, Select} from "@material-ui/core";
import React, {useState, useEffect, useContext} from "react";
import {ConfigurationContext} from "./Context";
import {grey} from "@material-ui/core/colors";
import Api from "../../core/Api";

const useStyles = makeStyles({
    ignored: {
        fontStyle: "italic",
        color: grey[400]
    },
});

export default function AccountType(props) {
    const [type, setType] = useState("");
    const {startLoad, stopLoad} = useContext(ConfigurationContext);

    const classes = useStyles();

    useEffect(() => {
        setType(props.type || "-1");
    }, [props.type]);

    const handleChange = async ({target}) => {
        await startLoad();
        const {value} = target;

        let path = `/accountSetting/${props.id}`;
        const options = {
            method: "PATCH",
            body: {
                accountName: props.accountName, connectionName: props.connectionName, usedFor: value
            }
        };
        if (target.value === "-1") {
            options.method = "DELETE";
            delete options.body;
        } else if (!props.id || props.id < 0) {
            path = `/accountSetting`;
            options.method = "POST";
        }

        await Api.database(path, options);

        setType(value);
        stopLoad();
        props.onChange && props.onChange();
    };

    return <Select value={type} onChange={handleChange}>
        <MenuItem value={"-1"}><span className={classes.ignored}>Ignoré</span></MenuItem>
        <MenuItem value="checks">Courant</MenuItem>
        <MenuItem value="savings">Épargne</MenuItem>
        <MenuItem value="deferredDebitCreditCard">CB différé</MenuItem>
    </Select>;
}