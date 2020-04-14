import React from 'react';
import {Grid} from "@material-ui/core";
import Title from "../../components/Title";
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
            stopLoad: this.stopLoad
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});
        (async() => {
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
            this.setState({accounts, accountSettings, isLoading: false})

        })();
    }

    render() {
        const {isLoading, accounts, accountSettings, loadingCount} = this.state;
        const hasCbDiff = accounts.some(a => accountSettings[a.id] === "deferredDebitCreditCard");

        return <div>
            <ConfigurationContext.Provider value={this.state}>
                <Title displayLoader={loadingCount > 0}>Configuration</Title>
                {isLoading ? <Loading/> : null}
                {!isLoading && hasCbDiff ? <Grid container>
                    <Grid item xs={6}>
                        <SubTitle>Fin d'exercice CB (jour inclus)</SubTitle>
                        <DeferredCreditCardCalendar/>
                    </Grid>
                    <Grid item xs={6}>
                        <Conf label="Jour de prélèvement CB diff." id="DEFERREDCB_LEVY_DAY" />
                    </Grid>
                </Grid> : null}
                {!isLoading ? <div>
                    <SubTitle>Comptes</SubTitle>
                    <AccountSettings />
                </div> : null}
            </ConfigurationContext.Provider>
        </div>;
    }
}