import React, {useState, useEffect} from "react";
import Title from "../../components/Title";
import Header from "../../components/Header";
import {faBalanceScale, faNotEqual, faTimesCircle, faUmbrellaBeach} from "@fortawesome/free-solid-svg-icons";
import {Add as AddIcon} from "@material-ui/icons";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    ListItemText,
    makeStyles,
    MenuItem, Slide, Table, TableBody, TableCell, TableRow,
    TextField,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import AddAmount from "./AddAmount";
import {useLocation, useHistory} from "react-router-dom";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import SavingTable from "./SavingTable";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {formatNumber} from "../../core/Tools";
import {blue, green, indigo, red} from "@material-ui/core/colors";
import Api from "../../core/Api";

const useStyles = makeStyles(theme => ({
    tools: {
        padding: theme.spacing(1)
    },
    fab: {
        position: 'fixed',
        bottom: `calc(64px + ${theme.spacing(2)}px + env(safe-area-inset-bottom))`,
        right: theme.spacing(2),
    },
    tables: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        marginBottom: 80
    },
    dialog: {
        top: '10vh !important',
        maxWidth: 600,
        margin: "0 auto"
    },
    dialogTitle: {
        color: "#FFF",
        background: `radial-gradient(circle farthest-corner at top left, ${indigo[700]} 0%, ${blue[700]} 57%)`,
        "& *": {
            fontWeight: 400
        },
        "& svg": {
            position: "absolute",
            right: 16,
            top: 18
        }
    },
    income: {
        color: green[800]
    },
    expense: {
        color: red[800]
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} mountOnEnter unmountOnExit/>;
});

export default React.memo(() => {
    const [amounts, setAmounts] = useState();
    const [showAddAmount, setShowAddAmount] = useState(useLocation().pathname.indexOf("/ajout-montant") >= 0);
    const [startDate, setStartDate] = useState(moment());
    const [savings, setSavings] = useState([]);
    const [savingId, setSavingId] = useState();
    const [lineDetails, setLineDetails] = useState(null);
    const [amountProjects, setAmountProjects] = useState(0);

    const updateSavingTotals = async () => {
        const amounts = await Api.service(`savings/totals`);
        setAmounts(amounts);
    };

    useEffect(() => {
        (async () => {
            const savings = await Api.list(`saving`);
            setSavings(savings);
            setSavingId(savings[0].id);
            setAmountProjects((await Api.service(`projects/remaining`)).amount);

            await updateSavingTotals();
        })();

        const start = moment.utc();
        start.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        start.subtract(8, 'months');
        setStartDate(start);
    }, []);

    const data = [];
    if (amounts) {
        data.push({
            title: "Compte courant",
            isAmount: true,
            color: (Math.abs(amounts.real - amounts.inApp) > 0.01 ? "amber" : "blue"),
            icon: faBalanceScale,
            content: amounts.real
        });

        if (Math.abs(amounts.real - amounts.inApp) > 0.01) {
            data.push({
                title: `Différence (${(amounts.real > amounts.inApp) ? "plus dans compte" : "plus de l'app"})`,
                isAmount: true,
                color: "blueGrey",
                icon: faNotEqual,
                content: Math.abs(amounts.real - amounts.inApp)
            });
        }

        data.push({
            title: "Montant nécessaire pour concrétiser les projets",
            isAmount: true,
            color: "teal",
            icon: faUmbrellaBeach,
            content: amountProjects
        });
    }

    const classes = useStyles();

    const history = useHistory();
    const handleAddExpenseOpen = async () => {
        history.push(`/comptes-epargne/ajout-montant`);
        setShowAddAmount(true);
    };
    const handleAddExpenseClose = async (newSavingCreated) => {
        history.push(`/comptes-epargne`);
        setShowAddAmount(false);

        newSavingCreated && setSavings(await Api.list(`saving`));
        await updateSavingTotals();
        setStartDate(moment(startDate));
    };

    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.only("xs"));

    return <div>
        {data.length ? <Header data={data}/> : null}
        <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
            <Grid container spacing={1} style={{padding: "0 16px"}}>
                <Grid item xs={6} sm={3}>
                    <DatePicker
                        variant="inline"
                        openTo="month"
                        views={["year", "month"]}
                        margin="normal"
                        label="Début"
                        value={startDate}
                        maxDate={moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0})}
                        onChange={setStartDate}
                        autoOk={true}
                    />
                </Grid>
                {isXsScreen ? <Grid item xs={6}>
                    <TextField fullWidth select label="Catégorie" value={savingId}
                               onChange={(e) => setSavingId(e.target.value)}>
                        {savings.map(({label, id}) => <MenuItem key={id} value={id}>
                            <ListItemText primary={label}/>
                        </MenuItem>)}
                    </TextField>
                </Grid> : null}
            </Grid>
        </MuiPickersUtilsProvider>
        <Grid container spacing={2} className={classes.tables}>
            {savings.filter(saving => !isXsScreen || saving.id === savingId).map(saving => <Grid item xs={12} sm={6}
                                                                                                 md={4} key={saving.id}>
                <SavingTable saving={saving} from={startDate} onLineSelect={(details) => setLineDetails(details)}/>
            </Grid>)}
        </Grid>
        <Dialog fullScreen open={lineDetails !== null} className={classes.dialog} onClose={() => setLineDetails(null)}
                TransitionComponent={Transition}>
            <DialogTitle className={classes.dialogTitle}>
                Détails
                <FontAwesomeIcon icon={faTimesCircle} onClick={() => setLineDetails(null)}/>
            </DialogTitle>
            {lineDetails ? <DialogContent>
                <h4>{lineDetails.label}</h4>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell}>Revenus</TableCell>
                            <TableCell align="right" className={classes.income}>
                                {formatNumber(lineDetails.amountIncomes || 0)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Dépenses</TableCell>
                            <TableCell align="right" className={classes.expense}>
                                {formatNumber(lineDetails.amountExpenses || 0)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {lineDetails.comment ? <div>
                    <h5>Commentaires</h5>
                    <ul className={classes.list}>{(lineDetails.comment || "").split("\n").map(c =>
                        <li>{c}</li>)}</ul>
                </div> : null}
            </DialogContent> : null}
        </Dialog>
        <AddAmount visible={showAddAmount} onClose={handleAddExpenseClose}/>
        <Fab aria-label="Créer un nouveau projet" className={classes.fab} color="primary"
             onClick={() => handleAddExpenseOpen()}>
            <AddIcon/>
        </Fab>
    </div>
});