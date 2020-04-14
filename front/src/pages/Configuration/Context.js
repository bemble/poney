import React from 'react';

export const ConfigurationContext = React.createContext({
    loadingCount: 0,
    startLoad: () => {},
    stopLoad: () => {}
});