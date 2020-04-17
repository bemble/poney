import React from 'react';
import Summary from "./Summary";
import AccountWeather from "./AccountWeather";
import Title from "../../components/Title";

export default React.memo(() => {
    return <div>
        <Title>Dashboard</Title>
        <div>
            <Summary/>
            <AccountWeather/>
        </div>
    </div>
});