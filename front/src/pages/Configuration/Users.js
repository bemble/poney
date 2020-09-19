import React, {useEffect, useState} from "react";
import {List, ListItem, ListItemSecondaryAction, IconButton, ListItemText} from "@material-ui/core";
import Api from "../../core/Api";
import {Edit as EditIcon} from "@material-ui/icons";
import EditUserDialog from "./EditUserDialog";

export default React.memo(() => {
    const [users, setUsers] = useState([]);
    const [edit, setEdit] = useState();

    useEffect(() => {
        (async () => {
            setUsers(await Api.list("users"));
        })();
    }, []);

    const handleClose = (saved) => {
        setEdit(null);
        if (saved) {
            (async () => {
                setUsers(await Api.list("users"));
            })();
        }
    };

    return <div>
        <List>
            {users.map(user => <ListItem key={user.publicId}>
                <ListItemText primary={user.email}/>
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="Editer" onClick={() => setEdit(user)}>
                        <EditIcon/>
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>)}
        </List>
        {edit ? <EditUserDialog onClose={handleClose} {...edit}/> : null}
    </div>;
});