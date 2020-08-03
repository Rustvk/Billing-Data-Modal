import React, {Component} from 'react';
import {Form} from 'semantic-ui-react';

class Select extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.value !== nextProps.value;
    }

    render() {
        return (
            <Form.Field
                {...this.props}
                onChange={this.props.onChange}
            />
        );
    }
}

export default Select;