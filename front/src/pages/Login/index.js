import React, {useEffect, useState} from "react";
import {TextField, Button, makeStyles} from "@material-ui/core";
import {pink, red} from "@material-ui/core/colors";
import logo from './illustration.png';
import jwtDecode from "jwt-decode";

import Api from "../../core/Api";
import store from "../../store";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        background: `radial-gradient(circle farthest-corner at top left, ${pink[700]} 45%, ${red[700]} 95%)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)',
        paddingTop: '30%'
    },
    content: {
        width: 300,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
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
    },
    form: {
        marginTop: theme.spacing(8),
        "& *": {
            color: "#fff",
        },
        "& .MuiFormControl-root": {
            marginBottom: theme.spacing(2)
        },
        "& .MuiInput-underline:before": {
            borderBottomColor: `rgba(255,255,255,0.42)`
        },
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
            borderBottomColor: `rgba(255,255,255,0.87)`
        },
        "& .MuiFormLabel-root.Mui-focused": {
            color: `rgba(255,255,255,0.65)`
        },
        "& .MuiButton-root": {
            borderColor: `rgba(255,255,255,0.42)`,
            marginTop: theme.spacing(2),
            float: "right"
        }
    },
    error: {
        background: `rgba(255,255,255,0.22)`,
        color: "#FFF",
        borderRadius: theme.spacing(0.5),
        padding: `${theme.spacing()}px ${theme.spacing(2)}px`
    }
}));

const tokenCallback = (data) => {
    if (!!(data && data.access_token)) {
        localStorage.setItem(Login.LS_REFRESH, data.refresh_token);
        store.dispatch({type: "SET", app: {token: data.access_token}});
        return true;
    }
    store.dispatch({type: "SET", app: {token: null}});
    return false;
};

const refreshToken = async () => {
    const refresh = localStorage.getItem(Login.LS_REFRESH);
    if (refresh) {
        const data = await Api.public(`auth/token`, {
            headers: {
                Authorization: `Bearer ${refresh}`
            }
        });
        tokenCallback(data);
    }
};

window.document.addEventListener("visibilitychange", () => {
    if(window.document.visibilityState === "visible") {
        (async() => {
            await refreshToken();
        })();
    }
});

const Login = (props) => {
    const classes = useStyles();
    const [hasRequest, setHasRequest] = useState(false);
    const [email, setEmail] = useState(localStorage.getItem(Login.LS_EMAIL) || "");
    const [password, setPassword] = useState("");
    const [displayError, setDisplayError] = useState(false);

    useEffect(() => {
        store.subscribe(() => {
            const {token} = store.getState().app;
            if (token) {
                const {exp} = jwtDecode(token);
                const renewAfter = (exp - Math.round((new Date()) / 1000) - 5 * 60) * 1000;
                setTimeout(async () => {
                    await refreshToken();
                }, renewAfter);
            }
        });

        (async () => {
            await refreshToken();
            props.onReady && props.onReady();
        })();
    }, []);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        localStorage.setItem(Login.LS_EMAIL, e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setDisplayError(false);
        setHasRequest(true);
        const data = await Api.public(`auth`, {
            method: "post",
            body: {email, password}
        });
        setHasRequest(false);
        if (!tokenCallback(data)) {
            setPassword("");
            setDisplayError(true);
        }
    };

    return <div className={classes.root}>
        <div className={classes.content}>
            <hr className={classes.hr}/>
            <hr className={classes.hr}/>
            <div className={classes.logoContainer}>
                <img className={classes.logo} src={logo} alt="logo"/>
            </div>
            <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
                {displayError ? <p className={classes.error}>Erreur lors de votre identification.</p> : null}
                <TextField
                    fullWidth
                    disabled={hasRequest}
                    id="user-email"
                    label="Adresse e-mail"
                    value={email}
                    onChange={handleEmailChange}
                />
                <TextField
                    fullWidth
                    disabled={hasRequest}
                    id="user-password"
                    label="Mot de passe"
                    type="password"
                    inputProps={{pattern: "[0-9]*", inputMode: "numeric"}}
                    autoComplete="current-password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <Button type="submit" variant="outlined" disabled={hasRequest}>Connexion</Button>
            </form>
        </div>
    </div>
};
Login.LS_EMAIL = "poney-email";
Login.LS_REFRESH = "poney-refresh";

export default React.memo(Login);