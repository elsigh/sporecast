import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type WeatherDataResponse = {
    data: Array<Object>;
    datetime_utc: string;
    total_rain: number;
};

export type WeatherData = { [key: string]: WeatherDataResponse | null };

export interface StoreState {
    month: number;
    year: number;
    pws: string;
    isLoading: boolean;
    data: WeatherData;
}

export type AsyncReduxThunkAC = ActionCreator<
    ThunkAction<Promise<Action>, StoreState, void>
>;
