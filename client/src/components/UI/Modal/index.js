import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

function ModalWindow(props) {
    if (!props.buttonTitle) {
        throw new Error('"buttonTitle" property is required');
    }
    return (
        <Modal
            size="tiny"
            closeIcon
            onClose={() => props.setOpen(false)}
            onOpen={() => props.setOpen(true)}
            onUnmount={props.onUnmount}
            open={props.open}
            trigger={<Button className="ui primary button">{props.buttonTitle}</Button>}
        >
            {
                props.headerTitle ? <Modal.Header>{props.headerTitle}</Modal.Header> : ''
            }
            <Modal.Content>
                { props.children }
            </Modal.Content>
        </Modal>
    )
}

export default ModalWindow;