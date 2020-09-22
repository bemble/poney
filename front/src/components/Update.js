import React, {useState, useEffect} from "react";
import {Button, Snackbar} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import store from "../store";

const useStyles = makeStyles(theme => ({
    root: {
        bottom: `calc(8px + env(safe-area-inset-bottom))`,
        "& > *": {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary
        }
    }
}));

export default React.memo(() => {
    const [isUpdated, setIsUpdated] = useState();

    useEffect(() => {
        const unregister = store.subscribe(() => {
            const {serviceWorkerUpdated} = store.getState().update;
            setIsUpdated(serviceWorkerUpdated);
        });

        return () => unregister();
    }, []);

    const updateServiceWorker = () => {
        const {update} = store.getState();
        const registrationWaiting = update.serviceWorkerRegistration && update.serviceWorkerRegistration.waiting;
        if (registrationWaiting) {
            registrationWaiting.postMessage({type: 'SKIP_WAITING'});

            registrationWaiting.addEventListener('statechange', e => {
                if (e.target.state === 'activated') {
                    window.location.reload(true);
                }
            });
        }
    };

    const classes = useStyles();

    return <Snackbar className={classes.root} open={isUpdated}
                     anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                     message="Une nouvelle version de l'application est disponible."
                     action={<Button color="primary" variant="contained" size="small"
                                     onClick={() => updateServiceWorker()}>
                         Mettre à jour
                     </Button>}/>;
});