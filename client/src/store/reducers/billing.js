import {BILLING_FETCHED, FORM_SAVED, FETCH_ERROR, FETCH_START, SAVE_ERROR, FORM_CHANGED} from '../actions/actionTypes';

const initialState = {
	form: null,
	countries: null,
	states: null,
	fetchError: null,
	savingError: null,
	formSaved: false
};

export default function billingReducer(state = initialState, action) {
	switch (action.type) {
		case BILLING_FETCHED:
			return {
				...state,
				form: action.form,
				countries: action.countries,
				states: action.states
			};
		case FORM_SAVED:
			return {
				...state, formSaved: action.formSaved
			};
		case FORM_CHANGED:
			return {
				...state, form: action.form
			};
		case FETCH_START:
			return {
				...state, controller: action.controller
			};
		case FETCH_ERROR:
			return {
				...state, fetchError: action.fetchError
			};
		case SAVE_ERROR:
			return {
				...state, savingError: action.savingError
			};
		default:
			return state
	}
}
