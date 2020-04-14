import React from "react";

import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {makeStyles} from "@material-ui/core";
import {pink, red} from "@material-ui/core/colors";

import Logo from "../logo.png";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle farthest-corner at top left, ${pink[700]} 45%, ${red[700]} 95%)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)',
        zIndex: 1000,
        color: "#FFF"
    },
    logo: {
        height: 75,
        top: 82,
        left: 40,
        position: "absolute"
    },
    title: {
        fontSize: 36,
        fontWeight: 200
    }
}));

export default React.memo(() => {
    const classes = useStyles();

    return <div className={classes.root}>
        <div style={{position: "relative"}}>
            <Loader
                type="Triangle"
                color="#ffffff"
                height={180}
                width={180}
            />
            <img src={Logo} alt="Logo" className={classes.logo}/>
        </div>
        <h1 className={classes.title}>Poney</h1>
        <p>Chargement de l'application...</p>
    </div>;
});