export const CHANGE_YEAR = 'CHANGE_YEAR';
export type CHANGE_YEAR = typeof CHANGE_YEAR;

export const CHANGE_PWS = 'CHANGE_PWS';
export type CHANGE_PWS = typeof CHANGE_PWS;

export const CHANGE_MONTH = 'CHANGE_MONTH';
export type CHANGE_MONTH = typeof CHANGE_MONTH;

export const LOAD_DATA = 'LOAD_DATA';
export type LOAD_DATA = typeof LOAD_DATA;

export const SET_DATA = 'SET_DATA';
export type SET_DATA = typeof SET_DATA;

export const WeatherPrefsCities = [
    {
        pws: 'KCAEUREK5',
        name: 'Eureka',
    },
    {
        pws: 'KCAMENDO1',
        name: 'Mendo',
    },
    {
        pws: 'KCAINVER2',
        name: 'Inverness',
    },
    {
        pws: 'KCASANFR34', // Twin Peaks
        name: 'SanFran',
    },
    {
        pws: 'KCASANTA134', // Walnut/King
        name: 'SantaCrz',
    },
    {
        pws: 'KORASTOR4',
        name: 'Astoria',
    },
    {
        pws: 'KWACARSO3',
        name: 'Carson',
    },
    {
        pws: 'KCAKINGS6',
        name: 'KingsCan',
    },
];

export const WeatherPrefsMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const thisYear = new Date().getFullYear();
const firstYear = 2013;
let years = [thisYear];
let yearToAdd = thisYear;
while (yearToAdd-- > firstYear) {
    years.push(yearToAdd);
}
export const WeatherPrefsYears = years;
