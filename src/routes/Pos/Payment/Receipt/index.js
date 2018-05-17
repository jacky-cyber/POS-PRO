import React, { PureComponent } from 'react';
import { Row, Col, Divider } from 'antd';
import { connect } from 'dva';
import DescriptionList from 'components/DescriptionList';
import styles from './index.less';
import { TAX_RATE } from 'constant';

const { Description } = DescriptionList;

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))

export default class Receipt extends PureComponent {
  calcTotalCount = () => {
    const { order } = this.props;
    const { selectedList = [] } = order;
    return selectedList.reduce((prev, current, index) => {
      if (index === 1) {
        return prev.Count || 0 + current.Count || 0;
      } else {
        return prev + current.Count || 0;
      }
    }, 0);
  }
  render() {
    console.log('order', this.props.order);
    const { order } = this.props;
    const { ID, createTime, shop, selectedList, totalPrice, paymentData } = order;
    const { departmentID } = shop || {};
    return (
      <div className={styles.receiptWrapper}>
        <h2 className={styles.head}>Health Element</h2>
        <div className={styles.item}>
          <span>NO</span>
          <span>{ID}</span>
        </div>
        <div className={styles.item}>
          <span>Sales</span>
          <span>{departmentID}</span>
        </div>
        <div className={styles.item}>
          <span>Time</span>
          <span>{createTime}</span>
        </div>
        <Divider />
        <div className={styles.bolder}>Product</div>
        <Row>
          <Col span={6}>Sku</Col>
          <Col span={5}>Retail</Col>
          <Col span={3}>Qty</Col>
          <Col span={5}>Transition</Col>
          <Col span={5}>Total</Col>
        </Row>
        {
          selectedList.map(item => (
            <div className={styles.list} key={item.Sku}>
              <div className={styles.bolder}>{item.EN}</div>
              <Row>
                <Col span={6}>{item.Sku}</Col>
                <Col span={5}>${item.RetailPrice}</Col>
                <Col span={3}>{item.Count}</Col>
                <Col span={5}>${item.RealPrice}</Col>
                <Col span={5}>${item.RealPrice * item.Count}</Col>
              </Row>
            </div>
          ))
        }
        <Row className={styles.bolder}>
          <Col span={6}>Total</Col>
          <Col span={5} />
          <Col span={3}>{this.calcTotalCount()}</Col>
          <Col span={5} />
          <Col span={5}>${totalPrice}</Col>
        </Row>
        <div className={styles.tax}>
          <Divider />
          <h2 className={styles.head}>TAX INVOICE</h2>
          <div className={styles.item}>
            <span>Invoice No</span>
            <span>{ID}</span>
          </div>
          <div className={styles.item}>
            <span>Sales</span>
            <span>{departmentID}</span>
          </div>
          <div className={styles.item}>
            <span>Time</span>
            <span>{createTime}</span>
          </div>
          {
            paymentData.map(item => (
              <div className={styles.list} key={item.key}>
                <Row>
                  <Col span={12}>{item.methodEN}</Col>
                  <Col span={12}>${item.cash}</Col>
                </Row>
              </div>
            ))
          }
          <div className={`${styles.item} ${styles.bolder}`}>
            <span>Includes SGT of</span>
            <span>${totalPrice * TAX_RATE}</span>
          </div>
        </div>
      </div>
    );
  }
}
