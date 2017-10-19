import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import { reducer } from './reducers';
import { StoreState } from './types';

import './index.css';

const initialState: StoreState = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    pws: 'KCASANFR34',
    isLoading: false,
    data: {},
};

// https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm
const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunk)),
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
