import React from "react";
import {
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {Link, useHistory} from "react-router-dom";
import {blueGrey, grey, indigo} from "@material-ui/core/colors";
import {formatNumber} from "../../core/Tools";
import Bullet from "../../components/Bullet";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCalendarAlt, faEdit, faPlusSquare, faTrash} from "@fortawesome/free-solid-svg-icons";

const useStyles = makeStyles(theme => ({
    root: {
        marginBottom: 84,
        "& td": {
            padding: "8px !important"
        }
    },
    hidden: {
        "& *": {
            color: theme.palette.text.hint
        }
    },
    tools: {
        width: "92px !important",
        minWidth: "92px !important"
    },
    tool: {
        fontSize: 16,
        padding: 5
    },
    amounts: {
        margin: "2px 0",
        fontSize: 13,
        color: blueGrey[400],
        "& span:first-child": {
            color: theme.palette.info.main
        }
    },
    endAt: {
        fontSize: 12,
        color: blueGrey[400],
        "& svg": {
            fontSize: 10,
            paddingBottom: 1,
            paddingRight: theme.spacing(0.5),
            color: blueGrey[200]
        }
    }
}));

export default React.memo((props) => {
    const classes = useStyles();
    const history = useHistory();

    const handleDisplayRecap = async (projectId) => {
        history.push(`/projets/${projectId}/recapitulatif`);
    };

    return <Table className={classes.root}>
        <TableBody>
            {props.lines.map(line => <TableRow hover key={line.id} className={line.hidden ? classes.hidden : ""}>
                <TableCell onClick={() => handleDisplayRecap(line.id)} style={{width: "100%"}}>
                    <Bullet variant={(line.amount + line.alreadyPaid > line.expected ? "alert" : "cool")}/>
                    {line.label}<br/>
                    <p className={classes.amounts}>
                        <span>{formatNumber(line.amount + line.alreadyPaid)}</span> | <span>{formatNumber(line.expected)}</span>
                    </p>
                    <span className={classes.endAt}>
                        <FontAwesomeIcon icon={faCalendarAlt}/>
                        {line.endAt.format("MM/YYYY")}
                    </span>
                </TableCell>
                <TableCell className={classes.tools}>
                    <Link to={`/projets/${line.id}/ajout-depense`}>
                        <IconButton aria-label="Ajouter une dépense" className={classes.tool}>
                            <FontAwesomeIcon icon={faPlusSquare}/>
                        </IconButton>
                    </Link>
                    <IconButton aria-label="Editer" onClick={() => props.onEdit(line)} className={classes.tool}>
                        <FontAwesomeIcon icon={faEdit}/>
                    </IconButton>
                    <IconButton aria-label="Supprimer" onClick={() => props.onDelete(line.id)} className={classes.tool}>
                        <FontAwesomeIcon icon={faTrash}/>
                    </IconButton>
                </TableCell>
            </TableRow>)}
        </TableBody>
    </Table>;
})