import React, {useEffect, useState} from 'react';
import {formatNumber, formatDate} from "../core/Tools";
import {Table, TableHead, TableBody, TableRow, TableCell, Tooltip} from "@material-ui/core";
import Loading from "../components/Loading";
import Api from "../core/Api";

const getData = async () => {
    const conditions = [];
    const settings = await Api.list(`account_setting`);
    settings.forEach(l => {
        conditions.push({
            $and: [{accountName: l.accountName}, {connectionName: l.connectionName}]
        });
    });
    return Api.search(`rawData`, {
        $where: {
            $or: conditions
        },
        $orderBy: {date: "DESC"}
    });
};

export default React.memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await getData();
            setData(data);
            setIsLoading(false);
        })();
    }, []);

    return <div>
        {isLoading ? <Loading/> : null}
        {!isLoading && data ? <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Libelle</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Categorie</TableCell>
                    <TableCell>Compte</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map(line => <TableRow hover key={line.id}>
                    <TableCell>{formatDate(line.date)}</TableCell>
                    <TableCell>
                        <Tooltip title={line.notes} aria-label="add"
                                 placement="right"><span>{line.label}</span></Tooltip>
                    </TableCell>
                    <TableCell align="right">{formatNumber(line.amount)}</TableCell>
                    <TableCell>{line.category}</TableCell>
                    <TableCell>{line.accountName}</TableCell>
                </TableRow>)}
            </TableBody>
        </Table> : null}
    </div>;
});