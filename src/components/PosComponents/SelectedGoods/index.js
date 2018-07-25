import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { Card, Row, Col, Divider, Tag, InputNumber } from 'antd';
import { connect } from 'dva';
import { CUSTOMER_TYPE } from 'constant';
import { keepTwoDecimals } from 'utils/utils';
import styles from './index.less';

const cx = classNames.bind(styles);

const saleTypeLabelMapping = {
  1: '本地',
  2: '邮寄',
  3: '代发',
};

@connect(({ commodity }) => ({
  activeTabKey: commodity.activeTabKey,
  orders: commodity.orders,
}))
export default class SelectedGoods extends PureComponent {
  componentWillReceiveProps() {
  }
  handleClick = (key) => {
    this.props.dispatch({ type: 'commodity/toggleSelectedGoods', payload: key });
  }
  discountChangeHandler = (value) => {
    this.props.dispatch({ type: 'commodity/changeWholeDiscountInput', payload: value });
  }
  generateSelectedListNode = (selectedList, activeSelectedKey, customerType, wholeDiscount) => (
    selectedList.map((item) => {
      const { isRefund } = item;
      const cardCls = cx({
        card: true,
        selected: item.Key === activeSelectedKey,
      });
      const cardTitle = cx({
        cardTitle: true,
        refundCardTitle: !!isRefund,
      });
      const count = item.Count;
      const discount = item.Discount;
      // const price = unitPrice * count * (discount || 100) * (wholeDiscount || 100) / 100 / 100;
      const price = item.RealPrice * count;
      const saleType = item.SaleType;
      const cartItemPrice = (
        <span>
          <Divider type="vertical" className={styles.divider} />
          <span>零售价：{keepTwoDecimals(item.RetailPrice)}</span>
          <Divider type="vertical" className={styles.divider} />
          <span>折后单价：{keepTwoDecimals(item.RealPrice)}</span>
        </span>
      );
      const cartItemRefundPrice = (
        <span>
          <Divider type="vertical" className={styles.divider} />
          <span>退款价：{keepTwoDecimals(item.RetailPrice)}</span>
        </span>
      );
      const tagList = [
        {
          id: 'customerType',
          value: customerType,
          color: '#f0dc00',
          formatFunc: value => (`${CUSTOMER_TYPE.filter(item => item.value === value)[0].label}会员`),
          isShow: !!customerType,
        },
        {
          id: 'saleType',
          value: saleType,
          color: '#87d068',
          formatFunc: value => (saleTypeLabelMapping[value]),
          isShow: !!item.SaleType,
        },
        {
          id: 'newPrice',
          value: item.NewUnitPrice,
          color: '#f50',
          formatFunc: () => ('修改过单价'),
          isShow: item.NewUnitPrice != null,
        },
        {
          id: 'discount',
          value: discount,
          color: '#2db7f5',
          formatFunc: () => (`${discount}% 单品折扣`),
          isShow: !!discount,
        },
        {
          id: 'wholeDiscount',
          value: wholeDiscount,
          color: '#8ca0a0',
          formatFunc: () => (`${wholeDiscount}% 整单折扣`),
          isShow: wholeDiscount !== null && wholeDiscount !== 100,
        },
        {
          id: 'refund',
          value: isRefund,
          color: '#ff4d4f',
          formatFunc: () => ('退款商品'),
          isShow: isRefund,
        },
      ];
      const commonTagListNode = (
        tagList.map((tagItem) => {
          if (!tagItem.isShow) { return null; }
          return (
            <Tag
              color={tagItem.color}
              key={tagItem.id}
            >
              {tagItem.formatFunc(tagItem.value)}
            </Tag>
          );
        })
      );
      const refundTagListNode = (
        tagList.filter(item => item.id !== 'wholeDiscount').map((tagItem) => {
          if (!tagItem.isShow) { return null; }
          return (
            <Tag
              color={tagItem.color}
              key={tagItem.id}
            >
              {tagItem.formatFunc(tagItem.value)}
            </Tag>
          );
        })
      );
      const goodsTagList = (
        <div>
          {
                isRefund ?
                refundTagListNode
                :
                commonTagListNode
          }
        </div>
      );
      return (
        <Card
          key={item.Key}
          bodyStyle={{ padding: '3px 15px 10px 15px' }}
          bordered={false}
          className={`${cardCls} he-bb`}
          selected={item.Key === activeSelectedKey}
          onClick={() => this.handleClick(item.Key)}
        >
          <Row>
            <Col span={18} className={cardTitle}>
              {
                isRefund ?
                `【退货】[${item.Sku}] ${item.EN}`
                :
                `[${item.Sku}] ${item.EN}`
              }
            </Col>
            <Col
              span={6}
              style={{ textAlign: 'right' }}
              className={cardTitle}
            >
              { keepTwoDecimals(price) }
            </Col>
          </Row>
          <Row style={{ paddingLeft: 12 }}>
            <Col span={24}>
              <span>
                数量：{count}
              </span>
              {
                isRefund ? cartItemRefundPrice : cartItemPrice
              }
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              { goodsTagList }
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
    const { activeSelectedKey, selectedList, customer, wholeDiscount } = currentOrder;
    const { memberType: customerType } = customer;
    if (!selectedList || (Array.isArray(selectedList) && selectedList.length === 0)) {
      return <div>购物车是空的</div>;
    }
    if (Array.isArray(selectedList) && selectedList.length > 0) {
      return (
        <div className={styles.selectedGoodsWrapper}>
          {
            this.generateSelectedListNode(selectedList, activeSelectedKey, customerType, wholeDiscount)
            }
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
