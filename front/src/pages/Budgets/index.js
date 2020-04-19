import React from 'react';
import {
    withStyles,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Fab,
    Checkbox,
    IconButton
} from "@material-ui/core";
import {Link} from 'react-router-dom';
import {
    Add as AddIcon
} from "@material-ui/icons";
import TopRightLoading from "../../components/TopRightLoading";
import Loading from "../../components/Loading";
import EditDialog from "./EditDialog";
import Api from "../../core/Api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";

const styles = theme => ({
    root: {
        marginBottom: 84,
        "& td": {
            padding: "8px !important"
        }
    },
    inUse: {paddingRight: 0},
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    link: {
        color: theme.palette.text.primary,
        textDecoration: "none"
    },
    date: {
        color: theme.palette.text.hint,
        fontSize: 11
    },
    tools: {
        width: "92px !important",
        minWidth: "92px !important"
    },
    tool: {
        fontSize: 16,
        padding: 5
    }
});

class Budgets extends React.PureComponent {
    state = {isLoading: true, data: []};

    componentDidMount() {
        this.load(true);
    }

    async load(isFirst) {
        const name = isFirst ? "isLoading" : "innerLoading";
        this.setState({[name]: true});
        const data = await Api.search(`budget`, {$orderBy: {inUse: false, addedAt: false}});
        this.setState({data, [name]: false});
    }

    handleClose(saved) {
        this.setState({displayDialog: false, edit: null});
        if (saved) {
            this.load();
        }
    }

    async handleChangeUse(id) {
        await Api.service(`budgets/set_in_use/${id}`, {method: "POST"});
        this.load();
    }

    async handleDelete(id) {
        await Api.delete(`budget`, id);
        this.load();
    }

    async handleDuplicate(id) {
        await Api.service(`budgets/duplicate/${id}`, {method: "POST"});
        this.load();
    }

    render() {
        const {isLoading, data, displayDialog, innerLoading, edit} = this.state;
        const {classes} = this.props;
        return <div>
            <TopRightLoading visible={innerLoading}/>
            {isLoading ? <Loading/> : null}
            {!isLoading && data ? <Table className={classes.root}>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.inUse}>Courant</TableCell>
                        <TableCell/>
                        <TableCell className={classes.tools}/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(line => <TableRow key={line.id}>
                        <TableCell><Checkbox checked={!!line.inUse}
                                             onChange={() => this.handleChangeUse(line.id)}/></TableCell>
                        <TableCell>
                            <Link to={`/budgets/${line.id}`} className={classes.link}>
                                {line.label}<br/>
                                <span className={classes.date}>{(new Date(line.addedAt * 1000).toLocaleString())}</span>
                            </Link>
                        </TableCell>
                        <TableCell className={classes.tools}>
                            <IconButton aria-label="Editer" onClick={() => this.setState({edit: line})}
                                        className={classes.tool}>
                                <FontAwesomeIcon icon={faEdit}/>
                            </IconButton>
                            <IconButton aria-label="Dupliquer" onClick={() => this.handleDuplicate(line.id)}
                                        className={classes.tool}>
                                <FontAwesomeIcon icon={faCopy}/>
                            </IconButton>
                            <IconButton aria-label="Supprimer" onClick={() => this.handleDelete(line.id)}
                                        className={classes.tool}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </IconButton>

                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table> : null}
            {displayDialog || edit ? <EditDialog onClose={(saved) => this.handleClose(saved)}
                                                 inUse={data.filter(e => !!e.inUse).length === 0} id={edit && edit.id}
                                                 label={edit && edit.label}/> : null}
            <Fab aria-label="Créer un nouveau budget" className={classes.fab} color="primary"
                 onClick={() => this.setState({displayDialog: true})}>
                <AddIcon/>
            </Fab>
        </div>;
    }
}

export default withStyles(styles)(Budgets);