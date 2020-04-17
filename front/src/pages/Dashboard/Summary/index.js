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

export default React.memo(() => {
    const [lastSynch, setLastSynch] = useState();
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        (async () => {
            Api.get(`batch_history`, `linxo-importer`, {field: 'script'}).then(data => setLastSynch(data));
            Api.service(`/monitoring/totals`).then(({amount}) => setAmount(amount));
        })();
    }, []);

    const onImportClick = async () => {
        setLastSynch({...lastSynch, status: 2});
        await Api.service('batchs/linxo-importer');
        setInterval(() => {
            Api.get(`batch_history`, `linxo-importer`, {field: 'script'}).then(data => {
                if (data.status !== 2) {
                    window.location.reload();
                }
            });
        }, 15 * 1000);
    };

    const classes = useStyles();

    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
    return <div>
        <Grid container spacing={1} className={classes.root} alignItems="center">
            <Grid item xs={12}>
                <LastSync data={lastSynch} onClick={() => onImportClick()} />
            </Grid>
            <Grid item xs={isXsScreen ? 12 : false}>
                <Balance data={amount} warning={150} />
            </Grid>
        </Grid>
    </div>;
});