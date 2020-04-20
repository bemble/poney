import React, {useState} from "react";

import {AppBar, ListItem, ListItemIcon, ListItemText, Toolbar, Menu} from "@material-ui/core";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {makeStyles} from "@material-ui/core/styles";
import {faEllipsisH} from "@fortawesome/free-solid-svg-icons";

const useStyles = makeStyles(theme => ({
    appBar: {
        top: 'auto',
        bottom: 0,
        background: theme.palette.background.paper
    },
    bar: {
        justifyContent: "space-between"
    },
    menuItem: {
        color: theme.palette.text.hint,
        textDecoration: "none",
        "& svg": {
            color: theme.palette.text.hint,
            fontSize: 24
        }
    },
    activeMenuItem: {
        color: theme.palette.primary.contrastText,
        "& svg": {
            color: theme.palette.primary.contrastText,
        },
        "& > *, &:hover": {
            background: theme.palette.primary.dark
        }
    },
    item: {
        display: "flex",
        flexDirection: "column",
        width: 75
    },
    secondaryItem: {
        display: "flex",
        flexDirection: "row"
    },
    itemIcon: {
        minWidth: 0
    },
    itemText: {
        "& *": {
            fontSize: 12
        }
    },
    secondaryItemIcon: {
        minWidth: 42
    },
    secondaryItemText: {
        "& *": {
            fontSize: 12
        }
    }
}));

export default React.memo((props) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const classes = useStyles();
    return <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar className={classes.bar}>
            {props.links.map((link, i) => <NavLink key={i} to={link.to} className={classes.menuItem}
                                                   activeClassName={classes.activeMenuItem}
                                                   exact={!!link.exact}>
                <ListItem button className={classes.item}>
                    <ListItemIcon className={classes.itemIcon}>
                        <FontAwesomeIcon icon={link.icon}/>
                    </ListItemIcon>
                    <ListItemText className={classes.itemText} primary={link.label}/>
                </ListItem>
            </NavLink>)}
            {props.secondaryLinks ? <div className={classes.menuItem}>
                <ListItem button className={classes.item}>
                    <ListItemIcon className={classes.itemIcon} aria-haspopup="true"
                                  onClick={handleMenu}>
                        <FontAwesomeIcon icon={faEllipsisH}/>
                    </ListItemIcon>
                    <ListItemText className={classes.itemText} primary={"Plus"}/>
                </ListItem>
                <Menu id="menu-appbar" anchorEl={anchorEl}
                      anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                      }}
                      open={open}
                      onClose={handleClose}
                >
                    {props.secondaryLinks.map((link, i) => <NavLink key={i} to={link.to} className={classes.menuItem}
                                                                    activeClassName={classes.activeMenuItem}
                                                                    exact={!!link.exact} onClick={() => handleClose()}>
                        <ListItem button className={classes.secondaryItem}>
                            <ListItemIcon className={classes.secondaryItemIcon}>
                                <FontAwesomeIcon icon={link.icon} style={link.iconStyle || {}}/>
                            </ListItemIcon>
                            <ListItemText className={classes.secondaryItemText} primary={link.label}/>
                        </ListItem>
                    </NavLink>)}
                </Menu>
            </div> : null}
        </Toolbar>
    </AppBar>
});