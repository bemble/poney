import React from "react";
import {Button, Snackbar} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        bottom: `calc(8px + env(safe-area-inset-bottom))`,
        "& > *": {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary
        }
    }
}));

export default React.memo((props) => {
    const classes = useStyles();
    return <Snackbar className={classes.root} open={props.open} anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                     message="Une nouvelle version de l'application est disponible."
                     action={<Button color="primary" variant="contained" size="small" onClick={() => window.location.reload(true)}>
                         Mettre à jour
                     </Button>}/>;
});