import React, {useEffect, useState} from 'react';
import {Grid, makeStyles, useMediaQuery, useTheme} from "@material-ui/core";
import Api from "../../../core/Api";
import LastSync from "./LastSync";
import Balance from "./Balance";

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(),
        paddingRight: theme.spacing(),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        [theme.breakpoints.down("xs")]: {
            paddingTop: theme.spacing()
        }
    }
}));

let synchStatus = 0;
export default React.memo((props) => {
    const [lastSynch, setLastSynch] = useState();
    const [amount, setAmount] = useState(0);

    const updateSynch = async () => {
        const data = await Api.get(`batch_history`, `linxo-importer`, {field: 'script'});
        if (synchStatus === 2 && data.status !== synchStatus) {
            await Api.service(`/monitoring/totals`).then(({amount}) => setAmount(amount));
            props.onDataImported && props.onDataImported(data);
        }
        synchStatus = data.status;
        setLastSynch(data);
    };

    useEffect(() => {
        (async () => {
            updateSynch();
            Api.service(`/monitoring/totals`).then(({amount}) => setAmount(amount));

            const importerInterval = setInterval(() => {
                updateSynch();
            }, 5 * 1000);
            return () => clearInterval(importerInterval);
        })();
    }, []);

    const onImportClick = async () => {
        setLastSynch({...lastSynch, status: 2});
        await Api.service('batchs/linxo-importer');
        synchStatus = 2;
    };

    const classes = useStyles();

    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
    return <div>
        <Grid container spacing={1} className={classes.root} alignItems="center">
            <Grid item xs={12}>
                <LastSync data={lastSynch} onClick={() => onImportClick()}/>
            </Grid>
            <Grid item xs={isXsScreen ? 12 : false}>
                <Balance data={amount} warning={150}/>
            </Grid>
        </Grid>
    </div>;
});