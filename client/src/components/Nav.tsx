import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import {
    WeatherPrefsCities,
    WeatherPrefsYears,
    WeatherPrefsMonths,
} from '../constants';
import { ActionI, changeYear, changeMonth, changePWS } from '../actions';
import Select from './Select';

import { StoreState } from '../types';

interface Props extends RouteComponentProps<any> {
    year: number;
    month: number;
    pws: string;
    changeYear: (year: number) => ActionI<number>;
    changeMonth: (month: number) => ActionI<number>;
    changePWS: (pws: string) => ActionI<string>;
}

class Nav extends React.Component<Props> {
    constructor(props: Props) {
        super();
        if (props.match.path !== '/') {
            const params = props.match.params;
            const {
                changeYear,
                changeMonth,
                changePWS,
                month,
                pws,
                year,
            } = props;
            if (params.pws !== pws) {
                changePWS(params.pws);
            }
            if (Number(params.month) - 1 !== month) {
                changeMonth(Number(params.month) - 1);
            }
            if (Number(params.year) !== year) {
                changeYear(params.year);
            }
        }
    }
    componentDidMount() {
        const { history, match, month, pws, year } = this.props;
        if (match.path === '/') {
            const nextURL = `/${pws}/${year}/${month + 1}`;
            history.push(nextURL);
        }
    }
    componentDidUpdate() {
        const { history, match, month, pws, year } = this.props;
        const nextURL = `/${pws}/${year}/${month + 1}`;
        if (match.url !== nextURL) {
            history.push(nextURL);
        }
    }
    render() {
        const {
            changeYear,
            changeMonth,
            changePWS,
            month,
            pws,
            year,
        } = this.props;
        return (
            <div
                style={{
                    display: 'flex',
                    padding: '10px',
                }}
            >
                <div>
                    <Select
                        label="City"
                        name="city"
                        onChange={e => changePWS(e.currentTarget.value)}
                        options={WeatherPrefsCities.map(({ pws, name }) => {
                            return {
                                label: name,
                                value: pws,
                            };
                        })}
                        selected={pws}
                    />
                </div>
                <div>
                    <Select
                        label="Month"
                        name="month"
                        onChange={e =>
                            changeMonth(Number(e.currentTarget.value))}
                        options={WeatherPrefsMonths.map((month, i) => {
                            return {
                                label: month,
                                value: i,
                            };
                        })}
                        selected={month}
                    />
                </div>
                <div>
                    <Select
                        label="Year"
                        name="year"
                        onChange={e =>
                            changeYear(Number(e.currentTarget.value))}
                        options={WeatherPrefsYears.map(year => {
                            return {
                                label: year.toString(),
                                value: year,
                            };
                        })}
                        selected={year}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState) => {
    const { year, month, pws } = state;
    return {
        year,
        month,
        pws,
    };
};
export default connect(mapStateToProps, {
    changeYear,
    changeMonth,
    changePWS,
})(Nav);
