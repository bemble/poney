import React from 'react';
import {Grid, Tabs, Tab} from "@material-ui/core";
import TopRightLoading from "../../components/TopRightLoading";
import Loading from "../../components/Loading";
import AccountSettings from "./AccountSettings";

import {ConfigurationContext} from "./Context";
import DeferredCreditCardCalendar from "./DeferredCreditCardCalendar";
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
        const hasCbDiff = accounts.some(a => accountSettings[a.id] === "deferredDebitCreditCard");

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
                    >
                        <Tab label="Alertes"/>
                        <Tab label="Comptes"/>
                        {hasCbDiff ? <Tab label="Débit différé"/> : null}
                    </Tabs>
                    <TopRightLoading visible={loadingCount > 0}/>
                    <div hidden={currentPanel !== 0}>
                        <Conf label="Solde bas" id="WARNING_AMOUNT"/>
                        <Conf label="Solde bas pour les comptes épargne" id="WARNING_AMOUNT_SAVINGS"/>
                    </div>
                    <div hidden={currentPanel !== 1}>
                        <AccountSettings onChange={() => this.updateAccounts()}/>
                    </div>
                    <div hidden={currentPanel !== 2}>
                        <Grid container>
                            <Grid item xs={12}>
                                <SubTitle>Jour de prélèvement</SubTitle>
                                <Conf label="Jour de prélèvement CB diff." id="DEFERREDCB_LEVY_DAY"/>
                            </Grid>
                            <Grid item xs={12}>
                                <SubTitle>Fin d'exercice (jour inclus)</SubTitle>
                                <DeferredCreditCardCalendar/>
                            </Grid>
                        </Grid>
                    </div>
                </div> : null}
            </ConfigurationContext.Provider>
        </div>;
    }
}