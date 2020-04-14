import React, {useEffect, useState} from 'react';
import {
    Dashboard,
    Monitoring,
    Configuration,
    Database,
    Budgets,
    Budget,
    Projects,
    Project,
    ProjectRecap,
    Saving,
    Login
} from './pages';
import {BrowserRouter as Router, Route, NavLink, useLocation} from "react-router-dom";
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery} from "@material-ui/core";
import {pink, red, grey} from "@material-ui/core/colors";

import store from "./AppStore";
import Api from './core/Api';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCogs,
    faDatabase, faFileInvoiceDollar, faPiggyBank, faSearchDollar,
    faTachometerAlt, faUmbrellaBeach
} from '@fortawesome/free-solid-svg-icons';
import Logo from "./logo.png";
import MainLoading from "./components/MainLoading";

const drawerWidth = 240;
const closedDrawerWidth = 56;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        "&.close": {
            width: closedDrawerWidth
        },
        transition: "all 250ms ease-in-out",
        willChange: "width, left"
    },
    drawerPaper: {
        width: drawerWidth,
        background: `radial-gradient(circle farthest-corner at top left, ${pink[700]} 0%, ${red[700]} 95%)`,
        "&.close": {
            width: closedDrawerWidth,
            overflow: "hidden"
        },
        [theme.breakpoints.down('xs')]: {
            position: "fixed",
            "&.close": {
                left: -(closedDrawerWidth + 2)
            }
        },
        transition: "all 250ms ease-in-out",
        willChange: "width, left"
    },
    content: {
        flexGrow: 1,
        marginLeft: drawerWidth,
        "&.close": {
            marginLeft: closedDrawerWidth,
        },
        [theme.breakpoints.down('xs')]: {
            marginLeft: "0 !important"
        },
        transition: "margin-left 250ms ease-in-out",
        willChange: "margin-left"
    },
    menuItem: {
        color: grey[100],
        textDecoration: "none",
        "& svg": {
            color: grey[100],
            fontSize: 24
        }
    },
    activeMenuItem: {
        "& > *": {
            background: "rgba(0, 0, 0, 0.54)"
        }
    },
    logo: {
        width: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
            cursor: "pointer"
        },
        "& img": {
            width: 48
        },
        "& span": {
            color: "#FFF",
            fontSize: 36,
            fontWeight: 200,
            marginLeft: 30,
            transform: "translateX(-14px)"
        }
    }
}));

function LocationWatcher() {
    let location = useLocation();
    useEffect(() => {
        store.closeMenu();
    }, [location.pathname]);
    return <div/>;
}

export default React.memo(() => {
    const classes = useStyles();
    const theme = useTheme();
    const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [drawerOpen, setDrawerOpen] = useState(!isMdScreen);
    const [isSignedId, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const config = await Api.fetch('/public/config');
            store.dispatch({type: "SET", config});
            setIsInitialLoading(false);
        })();

        store.subscribe(() => {
            setDrawerOpen(store.getState().isMenuOpen);
        });
    }, []);

    useEffect(() => {
        setDrawerOpen(!isMdScreen);
        store.dispatch({type: "SET", isMenuOpen: !isMdScreen});
    }, [isMdScreen]);

    const onLoadingSuccess = (token) => {
        store.setToken(token);
        setIsSignedIn(true);
    };

    const links = [
        {to: "/", label: "Dashboard", icon: faTachometerAlt, exact: true},
        {to: "/comptes-epargne", label: "Comptes épargne", icon: faPiggyBank},
        {to: "/projets", label: "Projets", icon: faUmbrellaBeach},
        {to: "/budgets", label: "Budgets", icon: faFileInvoiceDollar, iconStyle: {marginLeft: 4, marginRight: -4}},
        {to: "/suivi", label: "Suivi", icon: faSearchDollar, iconStyle: {marginLeft: 2, marginRight: -2}},
        {to: "/database", label: "Base de données", icon: faDatabase, iconStyle: {marginLeft: 2, marginRight: -2}},
        {to: "/configuration", label: "Configuration", icon: faCogs}
    ];

    return <Router basename={process.env.PUBLIC_URL}>
        {isLoading || isInitialLoading ? <MainLoading/> : null}
        {isInitialLoading ? null : <div>
            {!isSignedId ? <Login onSuccess={onLoadingSuccess} onReady={() => setIsLoading(false)}/> : <div>
                <LocationWatcher/>
                <Drawer
                    className={classes.drawer + (drawerOpen ? "" : " close")}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper + (drawerOpen ? "" : " close"),
                    }}
                    anchor="left"
                >
                    <div className={classes.logo} onClick={() => setDrawerOpen(!drawerOpen)}>
                        <img src={Logo} alt="Poney"/>
                        <span>Poney</span>
                    </div>
                    <Divider style={{backgroundColor: "rgba(0,0,0,0.5)"}}/>
                    <List>
                        {links.map((link, i) => <NavLink key={i} to={link.to} className={classes.menuItem}
                                                         activeClassName={classes.activeMenuItem} exact={!!link.exact}>
                            <ListItem button>
                                <ListItemIcon><FontAwesomeIcon icon={link.icon}
                                                               style={{...link.iconStyle}}/></ListItemIcon>
                                <ListItemText primary={link.label}/>
                            </ListItem>
                        </NavLink>)}
                    </List>
                </Drawer>
                <main className={classes.content + (drawerOpen ? "" : " close")}>
                    <Route path="/" exact component={Dashboard}/>
                    <Route path="/comptes-epargne" component={Saving}/>
                    <Route path="/projets" exact component={Projects}/>
                    <Route path="/projets/:id" exact component={Project}/>
                    <Route path="/projets/:id/recapitulatif" exact component={ProjectRecap}/>
                    <Route path="/projets/:id/ajout-depense" exact component={Projects}/>
                    <Route path="/budgets" exact component={Budgets}/>
                    <Route path="/budgets/:id" exact component={Budget}/>
                    <Route path="/suivi" component={Monitoring}/>
                    <Route path="/database" component={Database}/>
                    <Route path="/configuration" component={Configuration}/>
                </main>
            </div>}
        </div>}
    </Router>;
});
