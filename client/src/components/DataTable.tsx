import * as React from 'react';
import { connect } from 'react-redux';

const formatRelative = require('date-fns/formatRelative');

import { loadData } from '../actions';
import { AsyncReduxThunkAC, StoreState, WeatherDataResponse } from '../types';

import './DataTable.css';

interface Props {
    year: number;
    month: number;
    pws: string;
    isLoading: boolean;
    loadData: AsyncReduxThunkAC;
    resp: WeatherDataResponse;
}

class DataTable extends React.Component<Props> {
    componentDidMount() {
        const { year, month, pws } = this.props;
        this.props.loadData(year, month, pws);
    }

    componentDidUpdate(prevProps: Props) {
        const { year, month, pws } = this.props;
        if (
            year !== prevProps.year ||
            month !== prevProps.month ||
            pws !== prevProps.pws
        ) {
            this.props.loadData(year, month, pws);
        }
    }

    render() {
        const { isLoading, resp } = this.props;
        //console.log('DataTable render', isLoading, resp);
        if (isLoading || !resp || !resp.data) {
            return <h2>Loading ...</h2>;
        }
        const data = resp.data;
        return (
            <div className="DataTable">
                <div className="DataTable-info">
                    <div>Total rainfall: {resp.total_rain} in.</div>
                    <div>
                        Last update:{' '}
                        {formatRelative(
                            new Date(resp.datetime_utc),
                            new Date(),
                        )}
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Rain</th>
                            <th>Low</th>
                            <th>High</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <DataTableRow key={i} data={row} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState) => {
    return {
        year: state.year,
        month: state.month,
        pws: state.pws,
        isLoading: state.isLoading,
        resp: state.data[`${state.year}-${state.month}-${state.pws}`] || {},
    };
};
export default connect(mapStateToProps, { loadData })(DataTable);

interface RowProps {
    data: any;
}

class DataTableRow extends React.Component<RowProps> {
    render() {
        const data = this.props.data;
        const {
            dayname,
            daynum,
            is_forecast,
            mintempi,
            maxtempi,
            precipi,
            precipi_is_zero,
        } = data;

        let precip = precipi;
        if (is_forecast) {
            if (precipi_is_zero) {
                precip = 0;
            }
            precip += '%';
        } else if (precipi_is_zero) {
            precip = '-';
        }

        return (
            <tr className={is_forecast ? 'DataTableRow-forecast' : ''}>
                <td>
                    {dayname} {daynum}
                </td>
                <td>{precip}</td>
                <td>{mintempi}°</td>
                <td>{maxtempi}°</td>
            </tr>
        );
    }
}
