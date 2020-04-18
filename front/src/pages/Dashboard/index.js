import React, {useState} from 'react';
import Summary from "./Summary";
import AccountWeather from "./AccountWeather";
import Title from "../../components/Title";

export default React.memo(() => {
    const [lastSynchUpdate, setLastSynchUpdate] = useState(0);
    const onDataImported = ({lastRunnedAt}) => {
        setLastSynchUpdate(lastRunnedAt);
    };

    return <div>
        <Title>Dashboard</Title>
        <div>
            <Summary onDataImported={onDataImported}/>
            <AccountWeather lastSynchUpdate={lastSynchUpdate}/>
        </div>
    </div>
});