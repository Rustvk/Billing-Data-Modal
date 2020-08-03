import React from 'react';
import './App.css';
import BillingModal from './containers/Modal';

function App() {
    return (
        <div className="ui container app">
            <div className="row">
                <div className="column">
                    <h1>Billing data entry application</h1>
                    <p>To use the input form click the button below</p>
                    <div>
                        <BillingModal/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
