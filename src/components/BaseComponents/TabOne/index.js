import React, { PureComponent } from 'react';
import { Button } from 'antd';
import styles from './index.less';

export default class TabOne extends PureComponent {
  static defaultProps = {
    tabButton: [1, 2, 3],
  }
  render() {
    return (
      <div className={styles.tabWrapper}>
        <div className={styles.tabBar}>
        <Button>111</Button>
        <Button>111</Button>
        <Button>111</Button>
        <Button>111</Button>
        <Button>111</Button>
        </div>
        <div className={styles.tabContent}>content</div>
      </div>
    );
  }
}
