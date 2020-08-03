import React, {Component} from 'react';
import { Button, Form, Select, Input, TextArea } from 'semantic-ui-react';
import {connect} from 'react-redux';
import {fetchBillingInfo} from '../../store/actions/billing';
import {createControl, validate, validateForm} from '../../helpers/formFramework';
import PureSelect from '../../components/PureSelector';
import Loader from '../../components/UI/Loading';
import EU from '../../helpers/euCountries';
import Section from '../../components/UI/Section';

const inputNames = {
    name: 'name',
    company: 'company',
    country: 'country',
    vat: 'vat',
    city: 'city',
    state: 'state',
    zip: 'zip_code',
    address: 'address'
}

const rowsOrder = [
    inputNames.name,
    inputNames.company,
    [
        inputNames.country,
        inputNames.vat
    ],
    [
        inputNames.city,
        inputNames.state
    ],
    inputNames.zip,
    inputNames.address
]

function createFormControls(form, countries = [], states) {
    return {
        [inputNames.name]: createControl({
            control: Input,
            focus: true,
            value: form && form[inputNames.name],
            label: 'Customer Full Name',
            placeholder: 'e.g. John Smith'
        }, {
            minWordsCount: 2,
            minWordLength: 2,
            onlyLetters: true,
            required: true,
            invalidError: 'Please enter valid name. Only letters allowed',
            emptyValueError: 'Please enter your full name'
        }),
        [inputNames.company]: createControl({
            control: Input,
            value: form && form[inputNames.company],
            placeholder: "e.g. AppFollow",
            label: <div>Company Name <small>(Leave this field empty if you're individual)</small></div>
        }, {
            minWordLength: 3,
            invalidError: 'Please enter a valid company name. At least 3 characters'
        }),
        [inputNames.country]: createControl({
            value: form && form[inputNames.country],
            width: 3,
            control: Select,
            options: countries,
            placeholder: 'Select country',
            label: 'Country'
        }, {
            emptyValueError: 'Please select country',
            required: true
        }),
        [inputNames.vat]: createControl({
            width: 2,
            value: form && form[inputNames.vat],
            disabled: form ? EU.indexOf(form.country) === -1 : false,
            control: Input,
            label: 'VAT ID',
            placeholder: 'Please enter VAT ID',
        }, {
            vatType: true,
            invalidError: 'Please enter valid VAT ID',
            required: true,
        }),
        [inputNames.city]: createControl({
            width: 3,
            value: form && form[inputNames.city],
            control: Input,
            label: 'City',
            placeholder: 'City'
        }, {
            emptyValueError: 'Please enter city',
            invalidError: 'Please enter valid city name',
            minWordLength: 3,
            required: true,
        }),
        [inputNames.state]: createControl({
            value: form && form[inputNames.state],
            width: 2,
            control: Select,
            options: (states && states[form.country]) || [],
            label: 'State',
            placeholder: 'Choose State'
        }),
        [inputNames.zip]: createControl({
            control: Input,
            value: form && form[inputNames.zip],
            label: 'Zip Code',
            placeholder: 'e.g. 55111'
        }, {
            invalidError: 'Please enter valid ZIP Code',
            emptyValueError: 'Please enter ZIP Code',
            required: true,
            minWordLength: 3
        }),
        [inputNames.address]: createControl({
            control: TextArea,
            value: form && form[inputNames.address],
            label: 'Address',
            placeholder: 'e.g. 2450 Iroquois Ave'
        }, {
            minWordLength: 7,
            required: true,
            invalidError: 'Please enter valid address',
            emptyValueError: 'Please enter address',
        }),
    }
}

class BillingForm extends Component {
    state = {
        isSavePending: false,
        isFormValid: true,
        formControls: null
    };

    componentDidMount() {
        this.props.fetchBillingInfo()
            .then(() => {
                this.setState({
                    formControls: createFormControls(
                        {...this.props.form},
                        [...this.props.countries],
                        {...this.props.states}
                        )
                })
            }, () => null)
    }

    onChangeHandler = (value, controlName) => {
        const formControls = { ...this.state.formControls };
        const control = { ...formControls[controlName] };
        control.touched = true;
        control.value = value;
        control.errorMessage = null;

        // If country was changed, state and vat fields have to change own values and states
        if (controlName === inputNames.country) {
            const state = {...formControls[inputNames.state]};
            state.options = this.props.states[value] || [];
            if (state.options?.length) {
                state.value = state.options[0].value;
                state.disabled = false;
            } else {
                state.disabled = true;
            }
            formControls[inputNames.state] = state;
            const vat = { ...formControls[inputNames.vat]};
            vat.errorMessage = null;
            vat.value = '';
            vat.disabled = EU.indexOf(value) === -1;
            formControls[inputNames.vat] = vat;
        }
        formControls[controlName] = control;

        this.setState({
            formControls,
            isFormValid: validateForm(formControls),
        });
    };

    onBlurHandler = (value, controlName) => {
        const formControls = { ...this.state.formControls };
        const control = { ...formControls[controlName] };

        // Mark invalid control with error message
        control.errorMessage = control.disabled ? null : validate(control.value, control.validation);
        formControls[controlName] = control;

        this.setState({
            formControls,
            isFormValid: validateForm(formControls)
        });
    }

    onSave = () => {
        const formControls = {...this.state.formControls};
        const formData = {};
        let isValid = true;

        // Check all fields for value validity
        Object.keys(formControls).forEach((controlName, index) => {
            const control = {...formControls[controlName]};

            control.touched = true;
            control.errorMessage = control.disabled ? null : validate(control.value, control.validation);
            isValid = isValid && !control.errorMessage;

            // Collect all values in formData object for further saving
            formData[controlName] = this.state.formControls[controlName].value;
            formControls[controlName] = control;
        });

        // If inputs are invalid, change controls state
        if (!isValid) {
            this.setState({
                formControls,
                isFormValid: false
            })
        } else {
            this.setState({isSavePending: true});
            this.props.onSave(formData);
        }
    }

    getInputControls(rowsOrder) {
        return rowsOrder.map((property, index) => {
            let result;

            // If property is array type its mean group container for controls
            if (Array.isArray(property)) {
                return (
                    <Form.Group
                        key={'row' + index}
                        widths='equal'>
                        {this.getInputControls(property)}
                    </Form.Group>
                );
            } else {
                const controlName = property;
                const control = this.state.formControls[property];
                const label = control.label ?
                    typeof control.label === 'string' ?
                        control.label :
                        {children: control.label} :
                    null;
                const newProps = {
                    key: controlName + index,
                    control: control.control,
                    label: label,
                    width: control.width,
                    placeholder: control.placeholder,
                    value: control.value,
                    options: control.options,
                    disabled: control.disabled,
                    error: control.errorMessage && control.touched ? {
                        content: control.errorMessage,
                        pointing: 'above'
                    } : null,
                    onBlur: event => this.onBlurHandler(event.target.value, controlName),
                    onChange: (event, props) => this.onChangeHandler(event.target.value || props.value, controlName)
                }

                // If component is country selector - use functional component selector.
                // Countries dict is large. With each render is analysis entire dictionary
                result = controlName === inputNames.country ?
                    <PureSelect {...newProps} /> :
                    <Form.Field {...newProps}/>
            }
            return result;
        });
    };

    getStatusBlock() {
        let result;
        if (this.props.fetchError) {
            result = <Section type="error" message={this.props.fetchError.message}/>
        } else if (this.props.formSaved) {
            result = <Section type="success" message="Saving successfully! The window will be closed automatically"/>
        } else if (this.props.savingError) {
            result = <Section type="error" message={this.props.savingError.message}/>
        }
        return result;
    }

    render() {
        return this.getStatusBlock() || (
            this.props.form && this.state.formControls ?
               <Form onSubmit={this.onSave}>
                   { this.getInputControls(rowsOrder)}
                   <Button
                       primary
                       disabled={!this.state.isFormValid}
                       loading={this.state.isSavePending && !this.props.savingError}
                       type='submit'>Go to Checkout</Button>
               </Form>:
               <Loader/>
           );

    }
}

function mapStateToProps(state) {
    return { ...state.billing };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchBillingInfo: () => dispatch(fetchBillingInfo()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BillingForm);