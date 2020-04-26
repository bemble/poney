import React, {useState, useEffect} from "react";
import {Button, Snackbar} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import store from "../UpdateStore";
import Api from "../core/Api";

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
    const [isInitialized, setIsInitialized] = useState();
    const [isUpdated, setIsUpdated] = useState();
    const [registration, setRegistration] = useState();

    useEffect(() => {
        const unregister = store.subscribe(() => {
            const {serviceWorkerInitialized, serviceWorkerUpdated, serviceWorkerRegistration} = store.getState();
            setIsInitialized(serviceWorkerInitialized);
            setIsUpdated(serviceWorkerUpdated);
            setRegistration(serviceWorkerRegistration);
        });

        return () => unregister();
    }, []);

    const updateServiceWorker = () => {
        const registrationWaiting = registration && registration.waiting;

        if (registrationWaiting) {
            store.dispatch({type: 'SKIP_WAITING'});

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