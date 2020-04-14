import {Grid, makeStyles, useMediaQuery, useTheme} from "@material-ui/core";
import React from "react";
import RecapCard from "./RecapCard";

const useStyles = makeStyles(theme => ({
    root: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
        marginBottom: 4,
        [theme.breakpoints.down("xs")]: {
            marginTop: 8
        }
    }
}));

export default React.memo((props) => {
    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();

    return <Grid container spacing={1} className={classes.root} alignItems="center">
        {props.data.map((d, i) => <Grid key={i} item xs={isXsScreen ? 12/props.data.length : false}>
            <RecapCard {...d}/>
        </Grid>)}
    </Grid>;
});