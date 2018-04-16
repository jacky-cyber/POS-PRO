import React, { PureComponent } from 'react';
import { Button } from 'antd';
import styles from './index.less';

export default class TabOne extends PureComponent {
  static defaultProps = {
    tabButton: [1, 2, 3],
  }
  constructor(props) {
    super(props)
    this.state = {
      activeKey: this.props.activeKey
    }
  }
  clickHandler = (child) => {
    const { key } = child
    console.log(key, this.props.activeKey)
    if (key !== this.props.activeKey) {
      this.props.onChange && this.props.onChange(key)
    }
  }
  render() {
    const { children = [], content, activeKey } = this.props || {}
    return (
      <div className={styles.tabWrapper}>
        <div className={styles.tabBar}>
        { React.Children.map(children, child => (<div onClick={this.clickHandler.bind(this, child)}>{React.cloneElement(child)}</div>)) }
        </div>
        <div className={styles.tabContent}>
        {content}
        </div>
      </div>
    );
  }
}
