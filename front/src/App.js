import React, {useEffect, useState} from 'react';
import {
    Dashboard,
    Monitoring,
    Configuration,
    Budgets,
    Budget,
    Projects,
    Project,
    ProjectRecap,
    Saving,
    Login
} from './pages';
import {BrowserRouter as Router, Route} from "react-router-dom";
import {createMuiTheme, makeStyles} from '@material-ui/core/styles';
import {
    CssBaseline,
    ThemeProvider,
    useMediaQuery
} from "@material-ui/core";
import {pink, indigo} from "@material-ui/core/colors";

import store from "./AppStore";
import Api from './core/Api';
import Update from "./components/Update";

import {
    faCogs, faFileInvoiceDollar, faPiggyBank, faSearchDollar,
    faTachometerAlt, faUmbrellaBeach
} from '@fortawesome/free-solid-svg-icons';

import AppBar from "./components/AppBar";
import MainLoading from "./components/MainLoading";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        paddingTop: theme.spacing(),
        paddingLeft: `max(4px, env(safe-area-inset-left))`,
        paddingRight: `max(4px, env(safe-area-inset-right))`,
        paddingBottom: `calc(66px + 4px + env(safe-area-inset-bottom))`,
        overflow: "scroll"
    }
}));

export default React.memo(() => {
    const [isSignedId, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createMuiTheme({
                spacing: 4,
                palette: {
                    primary: pink,
                    secondary: indigo,
                    type: prefersDarkMode ? 'dark' : 'light',
                },
                shape: {
                    borderRadius: 2
                }
            }),
        [prefersDarkMode],
    );

    useEffect(() => {
        store.subscribe(() => {
            const {token} = store.getState();
            if (token && !isSignedId) {
                setIsSignedIn(true);
            } else if (!token && isSignedId) {
                setIsSignedIn(false);
            }
        });

        (async () => {
            const config = await Api.fetch('/public/config');
            store.dispatch({type: "SET", config});
            setIsInitialLoading(false);
        })();
    }, []);

    const onLoadingSuccess = (token) => {
        store.setToken(token);
        setIsSignedIn(true);
    };

    const links = [
        {to: "/", label: "Dashboard", icon: faTachometerAlt, exact: true},
        {to: "/projets", label: "Projets", icon: faUmbrellaBeach},
        {to: "/budgets", label: "Budgets", icon: faFileInvoiceDollar}
    ];

    const secondaryLinks = [
        {to: "/suivi", label: "Suivi", icon: faSearchDollar, iconStyle: {marginLeft: 2, marginRight: -2}},
        {to: "/comptes-epargne", label: "Comptes épargne", icon: faPiggyBank},
        {to: "/configuration", label: "Configuration", icon: faCogs}
    ];
    secondaryLinks.reverse();

    const classes = useStyles();

    return <Router basename={process.env.PUBLIC_URL}>
        <CssBaseline/>
        <ThemeProvider theme={theme}>
            {isLoading || isInitialLoading ? <MainLoading/> : null}
            {isInitialLoading ? null : <div style={{background: theme.palette.background.default}}>
                {!isSignedId ? <Login onSuccess={onLoadingSuccess} onReady={() => setIsLoading(false)}/> :
                    <div style={{minHeight: 'calc(var(--vh, 1vh) * 100)'}}>
                        <main className={classes.content}>
                            <Route path="/" exact component={Dashboard}/>
                            <Route path="/comptes-epargne" component={Saving}/>
                            <Route path="/projets" exact component={Projects}/>
                            <Route path="/projets/:id" exact component={Project}/>
                            <Route path="/projets/:id/recapitulatif" exact component={ProjectRecap}/>
                            <Route path="/projets/:id/ajout-depense" exact component={Projects}/>
                            <Route path="/budgets" exact component={Budgets}/>
                            <Route path="/budgets/:id" exact component={Budget}/>
                            <Route path="/suivi" component={Monitoring}/>
                            <Route path="/configuration" component={Configuration}/>
                        </main>
                        <AppBar links={links} secondaryLinks={secondaryLinks}/>
                    </div>}
            </div>}
            <Update />
        </ThemeProvider>
    </Router>;
});
