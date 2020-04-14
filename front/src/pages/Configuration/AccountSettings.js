import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import React, {useContext} from "react";
import AccountType from "./AccountType";
import {ConfigurationContext} from "./Context";

export default function AccountSettings() {
    const {accounts, accountSettings} = useContext(ConfigurationContext);

    if(!accounts) {
        return null;
    }

    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>Compte</TableCell>
                <TableCell>Connexion</TableCell>
                <TableCell>Type</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {accounts.map(line => <TableRow key={line.id}>
                <TableCell>{line.accountName}</TableCell>
                <TableCell>{line.connectionName}</TableCell>
                <TableCell><AccountType {...line} type={accountSettings[line.id]}/></TableCell>
            </TableRow>)}
        </TableBody>
    </Table>;
}