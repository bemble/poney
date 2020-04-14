import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core";
import {pink, red} from "@material-ui/core/colors";
import logo from './illustration.png';

import GoogleLogin from 'react-google-login';
import Api from "../../core/Api";
import store from "../../AppStore";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle farthest-corner at top left, ${pink[700]} 45%, ${red[700]} 95%)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)'
    },
    content: {
        width: 300,
        height: 300,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    hr: {
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.6)",
        position: 'absolute',
        top: 75,
        width: 65,
        "&:first-child": {
            left: 0
        },
        "&:nth-child(2)": {
            right: 0
        }
    },
    logoContainer: {
        height: 150,
        width: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 80,
        overflow: 'hidden'
    },
    logo: {
        height: 125
    },
    text: {
        width: "80%",
        color: "#FFFFFF",
        textAlign: "center"
    }
}));

export default React.memo((props) => {
    const classes = useStyles();
    const [hasRequest, setHasRequest] = useState(false);
    const googleClientId = store.getState().config.GOOGLE_SIGNIN_CLIENT_ID;

    const onSuccess = async (response) => {
        const {isAllowed, tokenId} = await Api.service(`auth/check`, {headers: {Authorization: `Bearer ${response.tokenId}`}});
        if(!hasRequest) {
            props.onReady && props.onReady();
        }
        if(isAllowed) {
            props.onSuccess && props.onSuccess(tokenId);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            props.onReady && props.onReady();
        }, 2000);
    }, []);

    return <div className={classes.root}>
        <div className={classes.content}>
            <hr className={classes.hr}/>
            <hr className={classes.hr}/>
            <div className={classes.logoContainer}>
                <img className={classes.logo} src={logo} alt="logo"/>
            </div>
            <p className={classes.text}>Oups ! Pour aller plus loin je dois savoir qui tu es !</p>
            <GoogleLogin
                clientId={googleClientId}
                theme="dark"
                buttonText="Connexion"
                isSignedIn={true}
                onSuccess={onSuccess}
                onFailure={(response) => console.error(response)}
                onRequest={() => setHasRequest(true)}
                cookiePolicy={'single_host_origin'}
            />
        </div>
    </div>
});