import * as React from 'react';

import DataTable from './DataTable';
import Nav from './Nav';

import './App.css';

const logo = require('../media/icon.png');
const wunderLogo = require('./wundergroundLogo_white_horz.png');

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <div className="App-Header">
                    <div>
                        <AppHeader />
                    </div>
                    <div>
                        <Nav />
                    </div>
                </div>
                <div className="App-Table">
                    <DataTable />
                </div>
                <div className="App-wunderLogo-c">
                    <img className="App-wunderLogo" src={wunderLogo} />
                </div>
            </div>
        );
    }
}

export default App;

class AppHeader extends React.Component {
    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 10px',
                }}
            >
                <div
                    style={{
                        height: 30,
                        width: 30,
                    }}
                >
                    <img src={logo} alt="" style={{ width: '100%' }} />
                </div>
                <div
                    style={{
                        fontSize: 18,
                        paddingLeft: 10,
                    }}
                >
                    Sporecast
                </div>
            </div>
        );
    }
}
