import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import React, {useContext} from "react";
import AccountType from "./AccountType";
import {ConfigurationContext} from "./Context";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
    connection: {
        color: theme.palette.text.hint,
        fontSize: 11
    }
}));

export default React.memo((props) => {
    const {accounts, accountSettings} = useContext(ConfigurationContext);

    if (!accounts) {
        return null;
    }

    const classes = useStyles();
    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>Compte</TableCell>
                <TableCell>Type</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {accounts.map(line => <TableRow key={line.id}>
                <TableCell>
                    {line.accountName}<br/>
                    <span className={classes.connection}>{line.connectionName}</span>
                </TableCell>
                <TableCell><AccountType {...line} type={accountSettings[line.id]}
                                        onChange={() => props.onChange && props.onChange()}/></TableCell>
            </TableRow>)}
        </TableBody>
    </Table>;
});