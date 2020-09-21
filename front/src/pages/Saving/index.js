import React, {useState, useEffect} from "react";
import Header from "../../components/Header";
import {faBalanceScale, faUmbrellaBeach, faExpandArrowsAlt, faCogs} from "@fortawesome/free-solid-svg-icons";
import {Add as AddIcon} from "@material-ui/icons";
import {
    Fab,
    Grid,
    Paper,
    makeStyles, Checkbox, FormControlLabel, Button,
    Accordion, AccordionSummary, AccordionDetails, Typography
} from "@material-ui/core";
import {ExpandMore as ExpandMoreIcon} from "@material-ui/icons";
import AddAmount from "./AddAmount";
import {useLocation, useHistory} from "react-router-dom";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import SavingTable from "./SavingTable";
import {formatNumber} from "../../core/Tools";
import {blue, amber} from "@material-ui/core/colors";
import Api from "../../core/Api";

import EditSavingDialog from "./EditSavingDialog";
import DetailsDialog from "./DetailsDialog";
import EditDetailsDialog from "./EditDetailsDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const useStyles = makeStyles(theme => ({
    settingsContainer: {
        margin: theme.spacing(2)
    },
    heading: {
        color: theme.palette.type === "light" ? "rgba(0,0,0,0.57)" : "rgba(255,255,255,0.57)"
    },
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
        margin: theme.spacing(2),
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
    const [budgetLines, setBudgetLines] = useState({});
    const [lineDetails, setLineDetails] = useState(null);
    const [editLine, setEditLine] = useState(null);
    const [amountProjects, setAmountProjects] = useState(0);
    const [editSaving, setEditSaving] = useState(null);
    const [displayArchived, setDisplayArchived] = useState(false);

    const updateSavingTotals = async () => {
        const amounts = await Api.service(`savings/totals`);
        setAmounts(amounts);
    };

    const updateAll = async () => {
        const query = displayArchived ? undefined : {
            $where: {isArchived: false}
        };
        const savings = await Api.search(`saving`, query);
        setSavings(savings);

        const budgetLines = {};
        (await Api.search(`budget_line`, {
            $where: {id: {$in: savings.map(e => e.idBudgetLine)}}
        })).forEach(e => {
            budgetLines[e.id] = e;
        });
        setBudgetLines(budgetLines);

        setAmountProjects((await Api.service(`projects/remaining`)).amount);

        await updateSavingTotals();
    };

    useEffect(() => {
        (async () => {
            await updateAll();
        })();

        const start = moment.utc();
        start.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        start.subtract(1, 'months');
        setStartDate(start);
    }, [displayArchived]);

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

    const handleDispatchSaving = async () => {
        (async () => {
            await Api.service(`savings/dispatch`, {method: "post"});
            await updateAll();
            setStartDate(moment(startDate));
        })();
    };

    const handleEditSavingClose = async (saved) => {
        setEditSaving(null);
        if (saved) {
            (async () => {
                await updateAll();
            })();
        }
    };

    const handleAddExpenseClose = async (newSavingCreated) => {
        setEditLine(null);
        history.push(`/comptes-epargne`);
        setShowAddAmount(false);

        if(newSavingCreated) {
            await updateAll();
            setStartDate(moment(startDate));
        }
    };

    const dispatchDisabled = Math.floor(difference) < ((budgetLines ? Object.values(budgetLines) : []).map(({amount}) => amount).reduce((a, v) => a + v, 0) || 0);

    return <div>
        {data.length ? <Header data={data}/> : null}
        {Math.floor(difference) !== 0 ? <Paper className={classes.difference}>
            Difference : <span className={classes.differenceAmount}>{formatNumber(Math.abs(difference))}</span>
            &nbsp;de plus {difference > 0 ? " sur le compte" : " dans l'application"}.
        </Paper> : null}
        <div className={classes.settingsContainer}>
            <Accordion>
                <AccordionSummary className={classes.heading} expandIcon={<ExpandMoreIcon/>}>
                    <Typography>
                        <FontAwesomeIcon icon={faCogs}/> Paramètres
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                className={classes.button}
                                startIcon={<FontAwesomeIcon icon={faExpandArrowsAlt}/>}
                                disabled={dispatchDisabled}
                                onClick={() => handleDispatchSaving()}
                            >
                                Répartir la différence
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale={"fr"}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <DatePicker
                                            fullWidth
                                            variant="inline"
                                            openTo="month"
                                            views={["year", "month"]}
                                            margin="normal"
                                            label="Afficher depuis"
                                            value={startDate}
                                            maxDate={moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0})}
                                            onChange={setStartDate}
                                            autoOk={true}
                                        />
                                    </Grid>
                                </Grid>
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox checked={displayArchived}
                                                   onChange={() => setDisplayArchived((prev) => !prev)}/>}
                                label="Afficher les archivées"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
        <Grid container spacing={2} className={classes.tables}>
            {savings.map(saving => <Grid item xs={12} sm={6}
                                         md={4} key={saving.id}>
                <SavingTable saving={saving} budgetLines={budgetLines} from={startDate}
                             onSavingSelect={(total) => setEditSaving({...saving, total})}
                             onLineSelect={(details) => setLineDetails(details)}
                             onEditLineSelect={(line) => setEditLine(line)}/>
            </Grid>)}
        </Grid>
        <EditSavingDialog saving={editSaving} onClose={handleEditSavingClose}/>
        <DetailsDialog lineDetails={lineDetails} onClose={() => setLineDetails(null)}/>
        <EditDetailsDialog line={editLine} onClose={handleAddExpenseClose}/>
        <AddAmount visible={showAddAmount} onClose={handleAddExpenseClose}/>
        <Fab aria-label="Créer un nouveau projet" className={classes.fab} color="primary"
             onClick={() => handleAddExpenseOpen()}>
            <AddIcon/>
        </Fab>
    </div>
});