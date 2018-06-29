import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { Card, Row, Col, Divider, Tag, InputNumber } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import { CUSTOMER_TYPE } from '../../../constant';

const cx = classNames.bind(styles);

const saleTypeLabelMapping = {
  1: '本地',
  2: '邮寄',
  3: '代发',
};

class SelectedGoods extends PureComponent {
  handleClick = (key) => {
    this.props.dispatch({ type: 'commodity/toggleSelectedGoods', payload: key });
  }
  discountChangeHandler = (value) => {
    this.props.dispatch({ type: 'commodity/changeWholeDiscountInput', payload: value });
  }
  generateSelectedListNode = (selectedList, activeSelectedKey, customerType, wholeDiscount) => (
    selectedList.map((item) => {
      const className = cx({
        card: true,
        selected: item.Key === activeSelectedKey,
      });
      const unitPrice = (item.NewUnitPrice || item.NewUnitPrice === 0) ? item.NewUnitPrice : item.RealPrice;
      const count = item.Count;
      const discount = item.Discount;
      // const price = unitPrice * count * (discount || 100) * (wholeDiscount || 100) / 100 / 100;
      const price = item.RealPrice;
      const saleType = item.SaleType;
      return (
        <Card
          key={item.Key}
          bodyStyle={{ padding: '3px 15px 10px 15px' }}
          bordered={false}
          className={className}
          selected={item.Key === activeSelectedKey}
          onClick={() => this.handleClick(item.Key)}
        >
          <Row>
            <Col span={20} className={styles.itemInCard}>{item.EN}</Col>
            <Col
              span={4}
              style={{ textAlign: 'right' }}
              className={styles.itemInCard}
            >
              {price}
            </Col>
          </Row>
          <Row style={{ paddingLeft: 12 }}>
            <Col span={24}>
              <span>
                数量：{count}
              </span>
              <Divider type="vertical" className={styles.divider} />
              <span>单价：</span>
              <span className={(item.NewUnitPrice || item.NewUnitPrice === 0) ? styles.deletedText : null}>
                {item.RealPrice}
              </span>
              {
                (item.NewUnitPrice || item.NewUnitPrice === 0) ? (
                  <span style={{ marginLeft: 6 }}>
                    {
                      item.NewUnitPrice
                    }
                  </span>
                )
                  : null
              }
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              {
                (customerType) ? (
                  <Tag color="#f0dc00">{CUSTOMER_TYPE.filter(item => item.value === customerType)[0].label}会员</Tag>
                )
                  : null
              }
              {
                (item.SaleType || item.SaleType === 0) ? (
                  <Tag color="#87d068">{saleTypeLabelMapping[saleType]}</Tag>
                )
                  : null
              }
              {
                (item.NewUnitPrice || item.NewUnitPrice === 0) ? (
                  <Tag color="#f50">修改过单价</Tag>
                )
                  : null
              }
              {
                discount ? (
                  <Tag color="#2db7f5">{discount}% 单品折扣</Tag>
                ) : null
              }
              {
                typeof wholeDiscount === 'number' && wholeDiscount !== 100 && <Tag color="#8ca0a0">{wholeDiscount}% 整单折扣</Tag>
              }
            </Col>
          </Row>
        </Card>
      );
    }
    )
  )
  render() {
    const { activeTabKey, orders } = this.props;
    const currentOrder = orders.filter(item => item.key === activeTabKey)[0];
    console.log('currentOrder', currentOrder);
    const { activeSelectedKey, selectedList, customer, wholeDiscount } = currentOrder;
    const { memberType: customerType } = customer;
    if (!selectedList || (Array.isArray(selectedList) && selectedList.length === 0)) {
      return <div>购物车是空的</div>;
    }
    if (Array.isArray(selectedList) && selectedList.length > 0) {
      return (
        <div className={styles.selectedGoodsWrapper}>
          {this.generateSelectedListNode(selectedList, activeSelectedKey, customerType, wholeDiscount)}
          <Card
            bordered={false}
            bodyStyle={{ padding: '3px 15px 10px 15px' }}
            className={styles.totalPriceCard}
          >
            <Row>
              <Col span={14}>
                <span className={styles.discountLabel}>整单折扣</span>
                <InputNumber
                  value={wholeDiscount}
                  min={0}
                  max={100}
                  step={5}
                  precision={0}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  onChange={this.discountChangeHandler}
                />
              </Col>
              <Col span={10} className={styles.totalPrice}>
                <span>
                  总价： {currentOrder.goodsPrice}
                </span>
              </Col>
            </Row>
          </Card>
        </div>
      );
    }
  }
}
export default connect(state => ({
  activeTabKey: state.commodity.activeTabKey,
  orders: state.commodity.orders,
}))(SelectedGoods);
