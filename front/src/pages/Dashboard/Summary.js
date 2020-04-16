import React, {useEffect, useState} from 'react';
import {
    faBalanceScale,
    faFileUpload,
    faCircleNotch,
    faRocket
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";
import moment from "moment";
import {makeStyles} from "@material-ui/core";
import {red} from "@material-ui/core/colors";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    synchAlert: {
        width: "100%",
        border: `1px solid ${red[600]}`,
        borderLeftWidth: 3,
        backgroundColor: red[200],
        fontSize: 8,
        fontFamily: "monospace",
        overflow: "hidden",
        padding: theme.spacing(0.5)
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

    const isImporting = lastSynch && lastSynch.status === 2;

    const data = [{
        title: "Compte courant",
        isAmount: true,
        color: (amount < 50 ? "red" : "green"),
        icon: faBalanceScale,
        content: amount
    }, {
        title: "Dernière synchro",
        color: lastSynch && lastSynch.status === 1 ? "red" : "blue",
        icon: faFileUpload,
        content: lastSynch ? moment(lastSynch.lastRunnedAt, 'X').format("DD/MM HH:mm") : "...",
        action: {
            icon: isImporting ? faCircleNotch : faRocket,
            message: isImporting ? "Importation en cours" : "Lancer l'importation des données",
            onClick: isImporting ? null : onImportClick,
            props: {spin: isImporting}
        }
    }];

    const classes = useStyles();
    return <div>
        <Header data={data}/>
        {lastSynch && lastSynch.status === 1 ? <div className={classes.synchAlert}>{lastSynch.message}</div> : null}
    </div>;
});