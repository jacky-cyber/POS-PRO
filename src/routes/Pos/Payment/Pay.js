import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Mbutton from './Mbutton';
import { Row, Col, Table, Button, Icon } from 'antd';
import styles from './Pay.less';
import PaymentCalculator from '../../../components/Calculator/Payment/';
import DescriptionList from '../../../components/DescriptionList';

const { Description } = DescriptionList

const paymentMethods = [
  { name: '现金', value: 'Cash' },
  { name: 'EFTPOS', value: 'EFTPOS' },
  { name: '银联', value: 'UnionPay' },
  { name: '转账', value: 'Transfer' },
  { name: '信用卡', value: 'CreditCard' },
  { name: 'LatiPay', value: 'LatiPay' },
  { name: '支付宝', value: 'AliPay' },
  { name: '微信', value: 'WechatPay' },
];

class Pay extends PureComponent {
  componentDidMount() {
    const paymentData = this.props.order.paymentData;
    Array.isArray(paymentData) && paymentData.length > 0 && this.props.dispatch({ type: 'commodity/checkPaymentData' });
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
    const { totalPrice, paymentData } = this.props.order;
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
        return (<Icon
          type="close-circle"
          style={{ cursor: 'pointer' }}
          onClick={this.handleRemoveClick.bind(this, index)}
        />);
      },
    }];
    return (
      <Row>
        <Col
          span={6}
          className={styles.leftContent}
        >
          {
            paymentMethods.map(item => (<Mbutton
              ghost
              type="primary"
              name={item.name}
              value={item.value}
              clickHandler={this.clickHandler}
              key={item.value}
            />))
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
                locale={{emptyText: '请选择支付方式'}}
                rowClassName={(record, index) => {
                  if (index === this.props.order.activePaymentDataIndex) {
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
