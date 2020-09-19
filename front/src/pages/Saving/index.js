import React, {useState, useEffect} from "react";
import Header from "../../components/Header";
import {faBalanceScale, faUmbrellaBeach} from "@fortawesome/free-solid-svg-icons";
import {Add as AddIcon} from "@material-ui/icons";
import {
    Fab,
    Grid,
    Paper,
    makeStyles
} from "@material-ui/core";
import AddAmount from "./AddAmount";
import {useLocation, useHistory} from "react-router-dom";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import SavingTable from "./SavingTable";
import {formatNumber} from "../../core/Tools";
import {blue, amber} from "@material-ui/core/colors";
import Api from "../../core/Api";

import DetailsDialog from "./DetailsDialog";
import EditDetailsDialog from "./EditDetailsDialog";

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
    difference: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(),
        border: `1px solid ${amber[500]}`,
    },
    differenceAmount: {
        fontFamily: "monospace",
        fontSize: 14,
        fontWeight: "bold"
    }
}));

export default React.memo(() => {
    const [amounts, setAmounts] = useState();
    const [showAddAmount, setShowAddAmount] = useState(useLocation().pathname.indexOf("/ajout-montant") >= 0);
    const [startDate, setStartDate] = useState(moment.utc());
    const [savings, setSavings] = useState([]);
    const [lineDetails, setLineDetails] = useState(null);
    const [editLine, setEditLine] = useState(null);
    const [amountProjects, setAmountProjects] = useState(0);

    const updateSavingTotals = async () => {
        const amounts = await Api.service(`savings/totals`);
        setAmounts(amounts);
    };

    useEffect(() => {
        (async () => {
            const savings = await Api.list(`saving`);
            setSavings(savings);
            setAmountProjects((await Api.service(`projects/remaining`)).amount);

            await updateSavingTotals();
        })();

        const start = moment.utc();
        start.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        start.subtract(1, 'months');
        setStartDate(start);
    }, []);

    const data = [];
    let difference = 0;
    if (amounts) {
        data.push({
            title: "Compte courant",
            isAmount: true,
            color: (Math.abs(amounts.real - amounts.inApp) > 0.01 ? "amber" : "blue"),
            icon: faBalanceScale,
            content: amounts.real
        });

        data.push({
            title: "Montant nécessaire pour concrétiser les projets",
            isAmount: true,
            color: "teal",
            icon: faUmbrellaBeach,
            content: amountProjects
        });
        difference = amounts.real - amounts.inApp;
    }

    const classes = useStyles();

    const history = useHistory();
    const handleAddExpenseOpen = async () => {
        history.push(`/comptes-epargne/ajout-montant`);
        setShowAddAmount(true);
    };
    const handleAddExpenseClose = async (newSavingCreated) => {
        setEditLine(null);
        history.push(`/comptes-epargne`);
        setShowAddAmount(false);

        newSavingCreated && setSavings(await Api.list(`saving`));
        await updateSavingTotals();
        setStartDate(moment(startDate));
    };

    return <div>
        {data.length ? <Header data={data}/> : null}
        {Math.floor(difference) !== 0 ? <Paper className={classes.difference}>
            Difference : <span className={classes.differenceAmount}>{formatNumber(Math.abs(difference))}</span>
            &nbsp;de plus {difference > 0 ? " sur le compte" : " dans l'application"}.
        </Paper> : null}
        <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
            <Grid container spacing={1} style={{padding: "0 16px"}}>
                <Grid item xs={12}>
                    <DatePicker
                        fullWidth
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
            </Grid>
        </MuiPickersUtilsProvider>
        <Grid container spacing={2} className={classes.tables}>
            {savings.map(saving => <Grid item xs={12} sm={6}
                                         md={4} key={saving.id}>
                <SavingTable saving={saving} from={startDate}
                             onLineSelect={(details) => setLineDetails(details)}
                             onEditLineSelect={(line) => setEditLine(line)}/>
            </Grid>)}
        </Grid>
        <DetailsDialog lineDetails={lineDetails} onClose={() => setLineDetails(null)}/>
        <EditDetailsDialog line={editLine} onClose={handleAddExpenseClose}/>
        <AddAmount visible={showAddAmount} onClose={handleAddExpenseClose}/>
        <Fab aria-label="Créer un nouveau projet" className={classes.fab} color="primary"
             onClick={() => handleAddExpenseOpen()}>
            <AddIcon/>
        </Fab>
    </div>
});