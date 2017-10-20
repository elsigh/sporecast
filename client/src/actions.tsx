import { Action, Dispatch } from 'redux';
import { AsyncReduxThunkAC, StoreState } from './types';

import * as constants from './constants';

export interface ActionI<T> {
    type: string;
    payload: T;
}

export function changeYear(payload: number): ActionI<number> {
    return {
        type: constants.CHANGE_YEAR,
        payload,
    };
}

export function changeMonth(payload: number): ActionI<number> {
    return {
        type: constants.CHANGE_MONTH,
        payload,
    };
}

export function changePWS(payload: string): ActionI<string> {
    return {
        type: constants.CHANGE_PWS,
        payload,
    };
}

// Async Redux-Thunk action
// https://gist.github.com/milankorsos/ffb9d32755db0304545f92b11f0e4beb
export const loadData: AsyncReduxThunkAC = (
    year: number,
    month: number,
    pws: string,
) => {
    return async (dispatch: Dispatch<StoreState>): Promise<Action> => {
        dispatch({
            type: constants.LOAD_DATA,
        });
        try {
            const payload = await fetchData(year, month, pws);
            return dispatch({
                type: constants.SET_DATA,
                year,
                month,
                pws,
                payload,
            });
        } catch (e) {
            return dispatch({
                type: constants.SET_DATA,
                year,
                month,
                pws,
                payload: {},
            });
        }
    };
};

const SERVER =
    window.location.hostname === 'localhost'
        ? 'http://localhost:9999'
        : window.location.origin;

// https://gist.github.com/msmfsd/fca50ab095b795eb39739e8c4357a808
const fetchData = async (year: number, month: number, pws: string) =>
    await (await fetch(
        `${SERVER}/wunderground/data/${pws}/${year}/${('0' + (month + 1)).slice(
            -2,
        )}/data.json`,
    )).json();
