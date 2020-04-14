import React, {useContext} from "react";
import {Grid} from "@material-ui/core";
import {ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon} from "@material-ui/icons";
import {DeferredCreditCardCalendarContext} from "./DeferredCreditCardCalendarContext";

export default function DeferredCreditCardCalendarYear() {
    const {year, previousYear, nextYear} = useContext(DeferredCreditCardCalendarContext);

    return <Grid container alignItems="center" justify="center">
        <Grid item><ChevronLeftIcon onClick={previousYear} /></Grid>
        <Grid item><span style={{fontSize: 24}}>{year}</span></Grid>
        <Grid item><ChevronRightIcon onClick={nextYear}  /></Grid>
    </Grid>;
}