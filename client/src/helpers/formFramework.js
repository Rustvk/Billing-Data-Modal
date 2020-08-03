import {checkVAT, countries} from 'jsvat';

export function createControl(config, validation) {
	return {
		touched: false,
		disabled: false,
		errorMessage: null,
		validation,
		...config,
	}
}

export function validate(string, validation = null) {
	const value = string?.trim();
	if (!validation){
		return null;
	}
	let errorMessage;
	let isValid = true;

	if (validation.required) {
		errorMessage = value === '' && (validation.emptyValueError || 'Please enter value');
	}

	if (!errorMessage && value) {
		if (validation.vatType) {
			const checkResult = checkVAT(string, countries);
			isValid = isValid && checkResult.isValid;
		}
		if (validation.minWordsCount) {
			const words = value.split(' ');
			const isValidCount = !validation.minWordsCount || words.length >= validation.minWordsCount;
			isValid = isValid && isValidCount && !words.some((word) => !checkSingleWord(word, validation));
		} else {
			isValid = isValid && checkSingleWord(value, validation);
		}
	}
	if (!isValid) {
		errorMessage = validation.invalidError || 'Please enter valid value'
	}
	return errorMessage;
}

function checkSingleWord(value, validation) {
	let valid = true;
	if (validation.onlyLetters) {
		valid = isOnlyLetters(value)
	}
	if (valid && validation.minWordLength) {
		valid = checkStringLength(value, validation.minWordLength)
	}
	return valid;
}

export function validateForm(formControls) {
	let isFormValid = true;
	for (let control in formControls) {
		if (formControls.hasOwnProperty(control)) {
			isFormValid = isFormValid && !formControls[control].errorMessage;
		}
	}
	return isFormValid;
}

function isOnlyLetters(str) {
	return /^[a-zа-яё\s]+$/iu.test(str);
}

function checkStringLength(str, minCount, maxCount) {
	return str && (!minCount || str.length >= minCount) && (!maxCount || str.length <= maxCount);
}
