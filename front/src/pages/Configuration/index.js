import React from 'react';
import {Grid, Card, Tabs, Tab} from "@material-ui/core";
import TopRightLoading from "../../components/TopRightLoading";
import Loading from "../../components/Loading";
import AccountSettings from "./AccountSettings";

import {ConfigurationContext} from "./Context";
import DeferredCreditCardCalendar from "./DeferredCreditCardCalendar";
import Users from "./Users";
import SubTitle from "../../components/SubTitle";
import Conf from "./Conf";
import Api from "../../core/Api";

export default class Configuration extends React.Component {
    constructor(props) {
        super(props);

        this.startLoad = () => {
            this.setState(state => ({
                loadingCount: state.loadingCount + 1
            }));
        };
        this.stopLoad = () => {
            this.setState(state => ({
                loadingCount: Math.max(state.loadingCount - 1, 0)
            }));
        };

        this.state = {
            isLoading: true,
            accounts: [],
            accountSettings: {},
            loadingCount: 0,
            startLoad: this.startLoad,
            stopLoad: this.stopLoad,
            currentPanel: 0
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.updateAccounts().then(() => this.setState({isLoading: false}));
    }

    async updateAccounts() {
        const promises = [];
        promises.push(Api.service(`accounts`));
        promises.push(Api.list(`accountSetting`).then(rawAccountSettings => {
            const accountSettings = {};
            rawAccountSettings.forEach(r => {
                accountSettings[r.id] = r.usedFor;
            });
            return accountSettings;
        }));

        const [accounts, accountSettings] = await Promise.all(promises);
        this.setState({accounts, accountSettings});
    }

    render() {
        const {isLoading, accounts, accountSettings, loadingCount, currentPanel} = this.state;
        const hasDeferredCard = accounts.some(a => accountSettings[a.id] === "deferredCard");

        // handle loading !!!!!

        return <div>
            <ConfigurationContext.Provider value={this.state}>
                {isLoading ? <Loading/> : null}
                {!isLoading ? <div>
                    <Tabs
                        value={currentPanel}
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="Configuration"
                        onChange={(e, currentPanel) => this.setState({currentPanel})}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Alertes"/>
                        <Tab label="Comptes"/>
                        <Tab label="Utilisateurs"/>
                        {hasDeferredCard ? <Tab label="Débit différé"/> : null}
                    </Tabs>
                    <TopRightLoading visible={loadingCount > 0}/>
                    <Card hidden={currentPanel !== 0}>
                        <Conf label="Solde bas" id="WARNING_AMOUNT"/>
                        <Conf label="Solde bas pour les comptes épargne" id="WARNING_AMOUNT_SAVINGS"/>
                    </Card>
                    <Card hidden={currentPanel !== 1}>
                        <Grid item xs={12}>
                            <SubTitle>Écart initial</SubTitle>
                            <Conf label="Écart initial entre les comptes et l'application" id="ACCOUNTS_INITIAL_GAP"/>
                        </Grid>
                        <AccountSettings onChange={() => this.updateAccounts()}/>
                    </Card>
                    <Card hidden={currentPanel !== 2}>
                        <Users />
                    </Card>
                    <Card hidden={currentPanel !== 3}>
                        <Grid container>
                            <Grid item xs={12}>
                                <SubTitle>Jour de prélèvement</SubTitle>
                                <Conf label="Jour de prélèvement CB diff." id="DEFERREDCB_LEVY_DAY"/>
                            </Grid>
                            <Grid item xs={12}>
                                <SubTitle>Écart initial</SubTitle>
                                <Conf label="Écart initial dans le montant de carte bancaire" id="DEFERREDCB_INITIAL_GAP"/>
                            </Grid>
                            <Grid item xs={12}>
                                <SubTitle>Fin d'exercice (jour inclus)</SubTitle>
                                <DeferredCreditCardCalendar/>
                            </Grid>
                        </Grid>
                    </Card>
                </div> : null}
            </ConfigurationContext.Provider>
        </div>;
    }
}