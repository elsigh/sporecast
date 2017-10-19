// import { Action } from '../actions';
import { StoreState } from './types';
import {
    CHANGE_MONTH,
    CHANGE_PWS,
    CHANGE_YEAR,
    LOAD_DATA,
    SET_DATA,
} from './constants';

export function reducer(state: StoreState, action: any): StoreState {
    switch (action.type) {
        case CHANGE_MONTH:
            return { ...state, month: action.payload };
        case CHANGE_YEAR:
            return { ...state, year: action.payload };
        case CHANGE_PWS:
            return { ...state, pws: action.payload };
        case LOAD_DATA:
            return { ...state, isLoading: true };
        case SET_DATA:
            return {
                ...state,
                isLoading: false,
                data: {
                    ...state.data,
                    [`${action.year}-${action.month}-${action.pws}`]: action.payload,
                },
            };
        default:
            return state;
    }
}
