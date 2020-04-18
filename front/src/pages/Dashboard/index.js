import React, {useEffect, useState} from 'react';
import {Grid, makeStyles, useMediaQuery, useTheme} from "@material-ui/core";
import Api from "../../core/Api";
import LastSync from "./Summary/LastSync";
import Balance from "./Summary/Balance";
import {faMoneyCheckAlt, faPiggyBank} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";

import AccountWeather from "./AccountWeather";

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
    const [balance, setBalance] = useState(-1);
    const [savingsTotal, setSavingsTotal] = useState(-1);
    const history = useHistory();

    const updateSynch = async () => {
        const data = await Api.get(`batch_history`, `linxo-importer`, {field: 'script'});
        if (synchStatus === 2 && data.status !== synchStatus) {
            await Api.service(`/monitoring/totals`).then(({amount}) => setBalance(amount));
            await Api.service(`/savings/totals`).then(({amount}) => setSavingsTotal(amount));
        }
        synchStatus = data.status;
        setLastSynch(data);
    };

    useEffect(() => {
        (async () => {
            updateSynch();
            Api.service(`/monitoring/totals`).then(({amount}) => setBalance(amount));
            Api.service(`/savings/totals`).then(({real}) => setSavingsTotal(real));

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
            <Grid item xs={isXsScreen ? 6 : false}>
                <Balance data={balance} title={"Compte courant"} icon={faMoneyCheckAlt} warning={150}
                         colors={["teal", "deepOrange"]}
                         onClick={() => history.push("/suivi")}/>
            </Grid>
            <Grid item xs={isXsScreen ? 6 : false}>
                <Balance data={savingsTotal} title={"Épargne"} icon={faPiggyBank} warning={1500}
                         colors={["indigo", "orange"]}
                         onClick={() => history.push("/comptes-epargne")}/>
            </Grid>
            <Grid item xs={12}>
                <AccountWeather lastSynchUpdate={lastSynch && lastSynch.runnedAt || 0}/>
            </Grid>
        </Grid>
    </div>;
});