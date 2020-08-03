import React from 'react';
import ModalWindow from '../../components/UI/Modal';
import BillingForm from '../Form';
import {connect} from 'react-redux';
import {saveForm, unmountModal} from '../../store/actions/billing';

function BillingModal(props) {
    const [open, setOpen] = React.useState(false);
    if (props.isSaved && open) {
        setTimeout(() => {
            setOpen(false);
        }, 2000)
    }
    return (
        <ModalWindow
            buttonTitle="Enter data"
            headerTitle="Billing Details"
            confirmButtonTitle="Go to Checkout"
            open={open}
            setOpen={setOpen}
            onUnmount={props.unmountModal}>
            <BillingForm onSave={props.saveForm}/>
        </ModalWindow>
    )
}

function mapStateToProps(state) {
    return {
        isSaved: state.billing.formSaved
    }
}

function mapDispatchToProps(dispatch) {
    return {
        saveForm: formData => dispatch(saveForm(formData)),
        unmountModal: () => dispatch(unmountModal())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BillingModal);