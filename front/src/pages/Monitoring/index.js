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
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import {grey, green, indigo, blue, amber} from "@material-ui/core/colors";
import moment from 'moment';
import {Search as SearchIcon, Close as CloseIcon} from "@material-ui/icons";
import Api from "../../core/Api";

const styles = theme => ({
    tools: {
        width: 44,
        "& button": {
            color: grey[300]
        }
    },
    date: {
        width: 77
    },
    today: {
        "& > *": {
            background: grey[700],
            color: grey[100]
        },
        "& > .amount": {
            background: green[700],
            color: "#FFF"
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
    credit: {
        color: green[500],
        fontWeight: 'bold'
    },
    debit: {
        color: amber[700]
    },
    deferredDebitCreditCard: {
        color: blue[500]
    }
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

class Suivi extends React.PureComponent {
    state = {isLoading: true, data: [], hasDefferedCreditCard: false, details: null};
    socketHandlerRef = null;
    socketDetailsHandlerRef = null;

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
            const data = await Api.service(`monitoring`,null, {start: start.unix(), end: end.unix()});
            const {lines, hasDeferredCreditCard} = data;
            this.setState({data: lines, hasDeferredCreditCard, isLoading: false});
            setTimeout(() => {
                document.getElementById("yesterday").scrollIntoView({behavior: 'smooth'})
            }, 250);
        })();
    }

    render() {
        const {isLoading, data, hasDeferredCreditCard, details} = this.state;
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
            <Title>Suivi</Title>
            {isLoading ? <Loading/> : null}
            {!isLoading && data ? <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.tools}/>
                        <TableCell className={classes.date}>Date</TableCell>
                        <TableCell align="right">Compte courant</TableCell>
                        <TableCell align="right">Crédits</TableCell>
                        <TableCell align="right">Débits</TableCell>
                        {hasDeferredCreditCard ? <TableCell align="right">Débit diff.</TableCell> : null}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((line, i) => <TableRow hover key={line.date}
                                                id={formatDate(line.date) === yesterday ? "yesterday" : ""}
                                                className={moment.utc(line.date, 'X').isSame(today, "day") ? classes.today : ""}>
                        <TableCell className={classes.tools}>
                            {(line.credits || line.debits || (i > 0 && line.deferredCreditCard !== data[i-1].deferredCreditCard)) ? <IconButton fontSize="small" aria-label="Détails"
                                                                         onClick={() => displayDetails(line.date)} style={{padding: 1}}>
                                <SearchIcon fontSize="inherit"/>
                            </IconButton> : null}
                        </TableCell>
                        <TableCell className={classes.date}>{formatDate(line.date)}</TableCell>
                        <TableCell className="amount" align="right">{formatNumber(line.amount)}</TableCell>
                        <TableCell align="right">{formatNumber(line.credits)}</TableCell>
                        <TableCell align="right">{formatNumber(line.debits)}</TableCell>
                        {hasDeferredCreditCard ?
                            <TableCell align="right">{formatNumber(line.deferredCreditCard)}</TableCell> : false}
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
                        <Typography variant="h6" className={classes.title}>Détails</Typography>
                    </Toolbar>
                </AppBar>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Libelle</TableCell>
                            <TableCell align="right">Crédit</TableCell>
                            <TableCell align="right">Débit</TableCell>
                            <TableCell align="right">Carte de crédit</TableCell>
                        </TableRow>
                    </TableHead>
                    {details ? <TableBody>
                        {details.credits.map((line, i) => <TableRow hover key={`credit-${i}`}>
                            <TableCell className={classes.credit}>{line.label}</TableCell>
                            <TableCell className={classes.credit} align="right">{formatNumber(line.amount)}</TableCell>
                            <TableCell/>
                            <TableCell/>
                        </TableRow>)}
                        {details.debits.map((line, i) => <TableRow hover key={`debit-${i}`}>
                            <TableCell className={classes.debit}>{line.label}</TableCell>
                            <TableCell/>
                            <TableCell className={classes.debit} align="right">{formatNumber(line.amount)}</TableCell>
                            <TableCell/>
                        </TableRow>)}
                        {details.deferredDebitCreditCard.map((line, i) => <TableRow hover key={`deferredDebitCreditCard-${i}`}>
                            <TableCell className={classes.deferredDebitCreditCard}>{line.label}</TableCell>
                            <TableCell/>
                            <TableCell/>
                            <TableCell className={classes.deferredDebitCreditCard} align="right">{formatNumber(line.amount)}</TableCell>
                        </TableRow>)}
                    </TableBody> : null}
                </Table>
            </Dialog>
        </div>;
    }
}

export default withStyles(styles)(Suivi);