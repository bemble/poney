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
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Assignment as AssignmentIcon,
    FileCopy as FileCopyIcon
} from "@material-ui/icons";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import EditDialog from "./EditDialog";
import Api from "../../core/Api";

const styles = theme => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
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

    async handleDuplicate(id){
        await Api.service(`budgets/duplicate/${id}`, {method: "POST"});
        this.load();
    }

    render() {
        const {isLoading, data, displayDialog, innerLoading, edit} = this.state;
        const {classes} = this.props;
        return <div>
            <Title displayLoading={innerLoading}>Budgets</Title>
            {isLoading ? <Loading/> : null}
            {!isLoading && data ? <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width={44 * 1}/>
                        <TableCell>Courant</TableCell>
                        <TableCell>Libelle</TableCell>
                        <TableCell>Ajout</TableCell>
                        <TableCell>Mise à jour</TableCell>
                        <TableCell width={44 * 3}/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(line => <TableRow key={line.id}>
                        <TableCell>
                            <Link to={`/budgets/${line.id}`}>
                                <IconButton aria-label="Gérer">
                                    <AssignmentIcon fontSize="small"/>
                                </IconButton>
                            </Link>
                        </TableCell>
                        <TableCell><Checkbox checked={!!line.inUse}
                                             onChange={() => this.handleChangeUse(line.id)}/></TableCell>
                        <TableCell>{line.label}</TableCell>
                        <TableCell>{(new Date(line.addedAt * 1000).toLocaleString())}</TableCell>
                        <TableCell>{(new Date(line.updatedAt * 1000).toLocaleString())}</TableCell>
                        <TableCell>
                            <IconButton aria-label="Editer" onClick={() => this.setState({edit: line})}>
                                <EditIcon fontSize="small"/>
                            </IconButton>
                            <IconButton aria-label="Dupliquer" onClick={() => this.handleDuplicate(line.id)}>
                                <FileCopyIcon fontSize="small"/>
                            </IconButton>
                            <IconButton aria-label="Supprimer" onClick={() => this.handleDelete(line.id)}
                                        disabled={!!line.inUse}>
                                <DeleteIcon fontSize="small"/>
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