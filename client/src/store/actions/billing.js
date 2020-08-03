import {
	BILLING_FETCHED,
	FORM_SAVED,
	FORM_CHANGED,
	FETCH_ERROR,
	FETCH_START,
	SAVE_ERROR
} from './actionTypes';

export function fetchBillingInfo() {
	return async (dispatch, getState) => {
		const formData = getState().billing.form;
		if (!formData) {
			const controller = new AbortController();
			dispatch(fetchStarted(controller));
			const {signal} = controller;
			return fetch('/billing_info', {signal})
				.then(async (response) => {
					if (!response.ok) {
						const error = new Error(`A request to the server failed while receiving data.
							 Error type: ${response.status}`);

						dispatch(fetchError(error));
						throw error;
					} else {
						let answer = await response.json();
						dispatch(billingFetched(answer));
						dispatch(changeForm(answer.data));
					}
				}, (error) => {
					console.error(error.message);
					throw error;
				});
		}
	}
}

function fetchStarted(controller) {
	return {
		type: FETCH_START,
		controller
	}
}

export function saveForm(formData) {
	return async dispatch => {
		dispatch(savingError(null));
		const response = await fetch('/save', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(formData)
		});
		if (!response.ok) {
			const error = new Error(`Data save error. Error type: ${response.status}`);
			dispatch(savingError(error));
		} else {
			let data = await response.json();
			if (data && data.ok === 1) {
				dispatch(changeForm(formData))
				dispatch(changeSaved(true));
			}
		}
	}
}

function changeForm(form) {
	return {
		type: FORM_CHANGED,
		form
	}
}

function savingError(savingError) {
	return {
		type: SAVE_ERROR,
		savingError
	}
}

export function unmountModal() {
	return async (dispatch, getState) => {
		const controller = getState().billing.controller;
		if (controller) {
			controller.abort();
		}
		dispatch(changeSaved(false));
		dispatch(fetchError(null));
	}

}

export function fetchError(fetchError) {
	return {
		type: FETCH_ERROR,
		fetchError
	}
}

export function billingFetched(info) {
	const states = {};
	const countries = info.countries.map((item) => {
		states[item.country] = item.states.map((state) => {
			return {
				text: state,
				value: state
			}
		});
		return {
			text: item.country,
			value: item.country
		};
	});
	return {
		type: BILLING_FETCHED,
		states,
		countries
	}
}

export function changeSaved(formSaved) {
	return {
		type: FORM_SAVED,
		formSaved
	}
}