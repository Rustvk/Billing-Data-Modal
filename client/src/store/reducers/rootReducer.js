import {combineReducers} from 'redux';
import billingReducer from './billing';

export default combineReducers({
	billing: billingReducer,
});