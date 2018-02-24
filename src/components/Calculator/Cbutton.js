import React from 'react';
import PropTypes from 'prop-types'
import { Button } from 'antd'
import styles from './Cbutton.less'

export default class Cbutton extends React.Component {
    static propTypes =  {
        name: PropTypes.string,
        clickHandler: PropTypes.func
    }

  handleClick = () => {
    this.props.clickHandler(this.props.name);
  }

  render() {
      const { name, datatype, className } = this.props

    return (
      <div>
        <Button
          onClick={this.handleClick}
          name={name}
          datatype={datatype}
          className={className}
        >
            {this.props.children}
        </Button>
      </div>
    );
  }
}
