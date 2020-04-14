import React from 'react';
import {Table, TableBody, TableRow, TableCell, TableHead} from "@material-ui/core";
import DeferredCreditCardMonth from './DeferredCreditCardMonth';
import DeferredCreditCardCalendarYear from "./DeferredCreditCardCalendarYear";
import {DeferredCreditCardCalendarContext} from "./DeferredCreditCardCalendarContext";

export default class DeferredCreditCardCalendar extends React.Component {
    constructor(props) {
        super(props);

        this.previousYear = () => {
            this.setState(state => ({
                year: state.year - 1
            }));
        };
        this.nextYear = () => {
            this.setState(state => ({
                year: state.year + 1
            }));
        };

        this.state = {
            year: (new Date()).getFullYear(),
            previousYear: this.previousYear,
            nextYear: this.nextYear
        };
    }

    render () {
        const months = [{}, {}, {}];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setDate(1);
            date.setMonth(i);
            months[Math.floor(i / 4)][i + 1] = date.toLocaleDateString("fr-FR", {month: 'long'});
        }

        const {year} = this.state;

        return <DeferredCreditCardCalendarContext.Provider value={this.state}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={4} align="center">
                            <DeferredCreditCardCalendarYear/>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {months.map((subMonths, i) => <TableRow key={i}>
                        {Object.entries(subMonths).map(([month, name]) => <TableCell key={month}>
                            <DeferredCreditCardMonth label={name} {...{year, month}}/>
                        </TableCell>)}
                    </TableRow>)}
                </TableBody>
            </Table>
        </DeferredCreditCardCalendarContext.Provider>;
    }
}