import React from 'react';

export const DeferredCreditCardCalendarContext = React.createContext({
    year: 0,
    previousYear: () => {},
    nextYear: () => {}
});