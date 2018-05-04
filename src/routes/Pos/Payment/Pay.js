import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Icon } from 'antd';
import Mbutton from './Mbutton';
import styles from './Pay.less';
import PaymentCalculator from '../../../components/Calculator/Payment/';


const paymentMethods = [
  { label: '现金', value: 'Cash' },
  { label: 'EFTPOS', value: 'EFTPOS' },
  { label: '银联', value: 'UnionPay' },
  { label: '转账', value: 'Transfer' },
  { label: '信用卡', value: 'CreditCard' },
  { label: 'LatiPay', value: 'LatiPay' },
  { label: '支付宝', value: 'AliPay' },
  { label: '微信', value: 'WechatPay' },
];

class Pay extends PureComponent {
  componentDidMount() {
    const { order = {} } = this.props;
    const { paymentData } = order;
    if (Array.isArray(paymentData) && paymentData.length > 0) {
      this.props.dispatch({ type: 'commodity/checkPaymentData' });
    }
  }
  handleRemoveClick = (index) => {
    this.props.dispatch({ type: 'commodity/clickRemovePaymentDataItemButton', payload: index });
  }
  handleCashClick = () => {
    this.props.dispatch({ type: 'commodity/clickCashButton' });
  }
  clickHandler = (paymentMethod) => {
    this.props.dispatch({ type: 'commodity/clickPaymentMethodButton', payload: paymentMethod });
  }
  handleRowClick = (record, index) => {
    return {
      onClick: () => {
        if (record.method) {
          if (index === this.props.order.activePaymentDataIndex) { return; }
          this.props.dispatch({ type: 'commodity/changeActivePaymentDataIndex', payload: index });
        }
      },
    };
  }
  render() {
    const { paymentData, activePaymentDataIndex } = this.props.order;
    const columns = [{
      title: '还需',
      dataIndex: 'demand',
      key: 'demand',
    }, {
      title: '收款',
      dataIndex: 'cash',
      key: 'cash',
      className: styles.price,
    }, {
      title: '找零',
      dataIndex: 'giveChange',
      key: 'giveChange',
      className: styles.hasGiveChange,
    }, {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
    }, {
      key: 'delete',
      render: (text, record, index) => {
        return (
          <Icon
            type="close-circle"
            style={{ cursor: 'pointer' }}
            onClick={this.handleRemoveClick.bind(this, index)}
          />
        );
      },
    }];
    return (
      <Row>
        <Col
          span={6}
          className={styles.leftContent}
        >
          {
            paymentMethods.map(item => (
              <Mbutton
                ghost
                type="primary"
                name={item.label}
                value={item.value}
                clickHandler={this.clickHandler}
                key={item.value}
              />
            ))
          }

        </Col>
        <Col span={18}>
          <Row className={styles.rightContent}>
            <Col span={24} className={styles.top}>
              <Table
                columns={columns}
                dataSource={paymentData}
                pagination={false}
                onRow={this.handleRowClick}
                locale={{ emptyText: '请选择支付方式' }}
                rowClassName={(record, index) => {
                  if (index === activePaymentDataIndex) {
                    if (record.giveChange > 0) {
                      return styles.hasGiveChangeRow;
                    }
                    return styles.clickedRow;
                  }
                  if (!record.method) {
                    return styles.extra;
                  }
                  return '';
                }}
              />
            </Col>
            <Col span={24} className={styles.bottom}>
              <Row>
                <Col span={6}>
                  <PaymentCalculator />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}
export default connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))(Pay);
