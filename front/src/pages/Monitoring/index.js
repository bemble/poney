import React from 'react';
import {formatDate, formatNumber} from '../../core/Tools';
import {
    withStyles,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Slide,
    Dialog,
    AppBar,
    Toolbar,
    Typography
} from "@material-ui/core";
import Loading from "../../components/Loading";
import {green, indigo, blue, amber} from "@material-ui/core/colors";
import moment from 'moment';
import {Search as SearchIcon, Close as CloseIcon} from "@material-ui/icons";
import Api from "../../core/Api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCreditCard, faLongArrowAltDown, faLongArrowAltUp, faTag} from "@fortawesome/free-solid-svg-icons";

const styles = theme => ({
    tools: {
        width: 44,
        padding: "6px 10px 6px 10px"
    },
    date: {
        width: 77
    },
    row: {
        "& > *": {
            background: theme.palette.background.default,
            color: theme.palette.text.hint
        }
    },
    today: {
        "& > *": {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary
        },
        "& > .amount": {
            background: theme.palette.success.dark,
            color: theme.palette.primary.contrastText
        },
        "& > .amount.warning": {
            background: theme.palette.warning.dark
        }
    },
    dialog: {
        top: '10vh !important',
        [theme.breakpoints.up("sm")]: {
            top: '40vh !important',
            left: '15vw !important',
            right: '15vw !important'
        }
    },
    appBar: {
        position: "sticky",
        background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
    },
    table: {
        marginBottom: `env(safe-area-inset-bottom)`
    },
    credit: {
        color: green[500],
        fontWeight: 'bold'
    },
    debit: {
        color: amber[700]
    },
    deferredCard: {
        color: blue[500]
    },
    details: {
        fontSize: 10,
        "& span": {
            color: "#FFF",
            display: "inline-block",
            padding: "2px 6px",
            margin: "0 2px",
            borderRadius: 12
        }
    },
    dataCategory: {
        fontSize: 12,
        color: theme.palette.text.hint,
        "& svg": {
            marginRight: theme.spacing()
        }
    },
    detailsIn: {
        background: green[500]
    },
    detailsOut: {
        background: amber[500]
    },
    detailsDeferredDebitCreditCard: {
        background: blue[500]
    }
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

class Suivi extends React.PureComponent {
    state = {isLoading: true, data: [], hasDefferedCreditCard: false, details: null};

    UNSAFE_componentWillMount() {
        const start = moment.utc();
        start.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        start.subtract(45, 'days');

        const end = moment.utc();
        end.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        end.add(45, 'days');

        this.setState({start, end});
    }

    componentDidMount() {
        (async () => {
            this.setState({isLoading: true});
            const {start, end} = this.state;
            const data = await Api.service(`monitoring`, null, {start: start.unix(), end: end.unix()});
            const {lines, hasDeferredCard} = data;
            this.setState({data: lines, hasDeferredCard, isLoading: false});
            setTimeout(() => {
                document.getElementById("yesterday").scrollIntoView({behavior: 'smooth'})
            }, 250);
        })();
    }

    render() {
        const {isLoading, data, hasDeferredCard, details} = this.state;
        const {classes} = this.props;

        const curMoment = new moment();
        const today = moment();
        curMoment.subtract(1, "day");
        const yesterday = formatDate(curMoment);

        const displayDetails = async (date) => {
            const details = await Api.service(`monitoring/details`, null, {date});
            this.setState({details});
        };

        const closeDetails = () => {
            this.setState({details: null});
        };

        return <div>
            {isLoading ? <Loading/> : null}
            {!isLoading && data ? <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.date}>Date</TableCell>
                        <TableCell align="right">Compte courant</TableCell>
                        <TableCell className={classes.tools}/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((line, i) => <TableRow hover key={line.date}
                                                     id={formatDate(line.date) === yesterday ? "yesterday" : ""}
                                                     className={moment.utc(line.date, 'X').isSame(today, "day") ? classes.today : classes.row}>
                        <TableCell className={classes.date}>{formatDate(line.date)}</TableCell>
                        <TableCell className={"amount " + (line.amount <= 150 ? "warning" : "")} align="right">
                            {formatNumber(line.amount)}<br/>
                            <span className={classes.details}>
                                {line.credits ? <span className={classes.detailsIn}>
                                    <FontAwesomeIcon icon={faLongArrowAltDown}/> {formatNumber(line.credits)}
                                </span> : null}
                                {line.debits ? <span className={classes.detailsOut}>
                                    <FontAwesomeIcon icon={faLongArrowAltUp}/> {formatNumber(line.debits)}
                                </span> : null}
                                {hasDeferredCard ?
                                    <span className={classes.detailsDeferredDebitCreditCard}>
                                    <FontAwesomeIcon icon={faCreditCard}/> {formatNumber(line.deferredCard)}
                                </span> : null}
                            </span>
                        </TableCell>
                        <TableCell className={classes.tools}>
                            {(line.credits || line.debits || (i > 0 && line.deferredCard !== data[i - 1].deferredDebitCreditCard)) ?
                                <IconButton fontSize="small" aria-label="Détails"
                                            onClick={() => displayDetails(line.date)} style={{padding: 1}}>
                                    <SearchIcon fontSize="inherit"/>
                                </IconButton> : null}
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table> : null}

            <Dialog fullScreen className={classes.dialog} open={!!details} TransitionComponent={Transition}
                    onClose={closeDetails}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="close" onClick={closeDetails}>
                            <CloseIcon/>
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>Détails,
                            le {details ? moment.unix(details.date).format("DD/MM/YYYY") : null}</Typography>
                    </Toolbar>
                </AppBar>
                <Table size="small" className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Libelle</TableCell>
                            <TableCell align="right">Montant</TableCell>
                        </TableRow>
                    </TableHead>
                    {details ? <TableBody>
                        {details.credits.map((line, i) => <TableRow hover key={`credit-${i}`}>
                            <TableCell className={classes.credit}>
                                {line.label}<br/>
                                <span className={classes.dataCategory}>
                                <FontAwesomeIcon icon={faTag}/>
                                    {line.category}
                            </span>
                            </TableCell>
                            <TableCell className={classes.credit} align="right">{formatNumber(line.amount)}</TableCell>
                        </TableRow>)}
                        {details.debits.map((line, i) => <TableRow hover key={`debit-${i}`}>
                            <TableCell className={classes.debit}>
                                {line.label}<br/>
                                <span className={classes.dataCategory}>
                                    <FontAwesomeIcon icon={faTag}/>
                                    {line.category}
                                </span>
                            </TableCell>
                            <TableCell className={classes.debit} align="right">{formatNumber(line.amount)}</TableCell>
                        </TableRow>)}
                        {details.deferredCard.map((line, i) => <TableRow hover
                                                                         key={`deferredCard-${i}`}>
                            <TableCell className={classes.deferredCard}>
                                {line.label}<br/>
                                <span className={classes.dataCategory}>
                                    <FontAwesomeIcon icon={faTag}/>
                                    {line.category}
                                </span>
                            </TableCell>
                            <TableCell className={classes.deferredCard}
                                       align="right">{formatNumber(line.amount)}</TableCell>
                        </TableRow>)}
                    </TableBody> : null}
                </Table>
            </Dialog>
        </div>;
    }
}

export default withStyles(styles)(Suivi);