import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import { TAX_RATE } from 'constant';
import { formatToDecimals } from 'utils/utils';
import JsBarcode from 'jsbarcode';
import styles from './index.less';

const gstNo = '103685648';


@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  ID: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0].ID,
}))

export default class Receipt extends PureComponent {
  componentDidMount() {
    const { isShowTax, ID } = this.props;
    if (ID) {
      JsBarcode('#no', ID, {
        width: 1,
        height: 30,
        displayValue: false,
      });
    }
    if (isShowTax) {
      JsBarcode('#gst', gstNo, {
        height: 30,
        displayValue: false,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { ID: nextID } = nextProps;
    const { ID: prevID } = this.props;
    if (nextID && nextID !== prevID) {
      JsBarcode('#no', nextID, {
        width: 1,
        height: 30,
        displayValue: false,
      });
    }
  }
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
    const { order, isShowTax } = this.props;
    const { ID, createTime, shop, selectedList, totalPrice, paymentData } = order;
    const { shopName } = shop || {};
    return (
      <div className={styles.receiptWrapper}>
        <h2 className={styles.head}>Health Element</h2>
        <div className={styles.item}>
          <span>NO</span>
          <span>{ID}</span>
        </div>
        <img id="no" />
        <div className={styles.item}>
          <span>Sales</span>
          <span>{shopName}</span>
        </div>
        <div className={styles.item}>
          <span>Date Time</span>
          <span>{createTime}</span>
        </div>
        <div>
          Unit R, 63 Hugo Johnston Dr, Penrose
        </div>
        <div className={styles.bolder}>Product</div>
        <Row className={styles.bill}>
          <Col span={6}>Sku</Col>
          <Col span={4}>RRP</Col>
          <Col span={3}>Qty</Col>
          <Col span={6}>LowPrice</Col>
          <Col span={5} style={{ textAlign: 'right' }}>Total</Col>
        </Row>
        {
          selectedList.map(item => (
            <div className={`${styles.list} ${styles.bb} ${styles.mb}`} key={item.Sku}>
              <div className={styles.bolder}>{item.EN}</div>
              <Row>
                <Col span={8}>{item.Sku}</Col>
                <Col span={4}>${item.RetailPrice}</Col>
                <Col span={3}>{item.Count}</Col>
                <Col span={4}>${item.RealPrice}</Col>
                <Col span={5} style={{ textAlign: 'right' }}>${item.RealPrice * item.Count}</Col>
              </Row>
            </div>
          ))
        }
        <Row className={`${styles.bolder} ${styles.mb}`}>
          <Col span={8}>Total</Col>
          <Col span={4} />
          <Col span={3}>{this.calcTotalCount()}</Col>
          <Col span={4} />
          <Col span={5} style={{ textAlign: 'right' }}>${totalPrice}</Col>
        </Row>
        <div className={`${styles.bb} ${styles.mb}`}>
          <div>
            Thanks For Your Shopping!
          </div>
          <div>
            Please keep your receipt for exchange
          </div>
          <div>
            We do not provide refund service if you change your mind We only accept exchange within 7 days
          </div>
        </div>
        {
          isShowTax && (
            <div className={styles.tax}>
              <h2 className={styles.head}>TAX INVOICE</h2>
              <div className={styles.item}>
                <span>Invoice No</span>
                <span>{ID}</span>
              </div>
              <div className={styles.item}>
                <span>Sales</span>
                <span>{shopName}</span>
              </div>
              <div className={styles.item}>
                <span>Date Time</span>
                <span>{createTime}</span>
              </div>
              {
                paymentData.map(item => (
                  <div className={`${styles.list}`} key={item.key}>
                    <Row>
                      <Col span={12}>{item.methodEN}</Col>
                      <Col span={12}>${item.cash}</Col>
                    </Row>
                  </div>
                ))
              }
              <div className={`${styles.item} ${styles.bolder}`}>
                <span>Includes GST of</span>
                <span>${formatToDecimals(totalPrice * TAX_RATE, 2)}</span>
              </div>
              <div className={styles.item}>
                <span>GST NO</span>
                <span>{gstNo}</span>
              </div>
              <img id="gst" />
            </div>
          )
        }
      </div>
    );
  }
}
