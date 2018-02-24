import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table, Radio } from 'antd';
import styles from './index.less';
import TableForm from './TableForm';

@connect(state => ({
  commodity: state.commodity,
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeKey)[0],
  activeTabKey: state.commodity.activeKey,
}))

export default class Express extends PureComponent {
  render() {
    const { dispatch, order } = this.props;
    const { goodsPrice } = this.props.order;
    return (
      <div className={styles.expressWrapper}>
        <TableForm
        dispatch={dispatch}
        dataSource={order.expressData || []}
         />
      </div>
    );
  }
}
