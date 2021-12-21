import React, {Component} from 'react';
import {Toast} from 'react-bootstrap';

export default class errorsMessageToast extends Component {
    render() {
        const toastCss = {
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex:'1',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
        };

        return (
            <div style={this.props.errorsMessageShow ? toastCss : null}>
                <Toast show={this.props.errorsMessageShow}>
                    <Toast.Body>
                        {this.props.message}
                    </Toast.Body>
                </Toast>
            </div>
        );
    };
}