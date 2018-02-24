import React, { PureComponent } from 'react';

export default class MessageItem extends PureComponent {
    render() {
        return (
            <span>{this.props.value}</span>
        )
    }
}
