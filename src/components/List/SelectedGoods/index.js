import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { Card, Row, Col, Divider, Tag } from 'antd';
import { connect } from 'dva';
import styles from './index.less';

const cx = classNames.bind(styles);

const saleTypeLabelMapping = {
  1: '本地',
  2: '邮寄',
  3: '代发',
}

class SelectedGoods extends PureComponent {
  handleClick = (key) => {
    this.props.dispatch({ type: 'commodity/toggleSelectedGoods', payload: key });
  }
  generateSelectedListNode = (selectedList, activeSelectedKey) => (
    selectedList.map((item) => {
      const className = cx({
        card: true,
        selected: item.Key === activeSelectedKey,
      });
      const unitPrice = (item.NewUnitPrice || item.NewUnitPrice === 0) ? item.NewUnitPrice : item.RetailPrice;
      const count = item.Count;
      const discount = item.Discount;
      const price = unitPrice * count * (discount || 100) / 100;
      const saleType = item.SaleType
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
            <Col span={18}>
              <span>
                数量：{count}
              </span>
              <Divider type="vertical" className={styles.divider} />
              <span>单价：</span>
              <span className={(item.NewUnitPrice || item.NewUnitPrice === 0) ? styles.deletedText : null}>
                {item.RetailPrice}
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
            <Col span={6} style={{ textAlign: 'right'}}>
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
              <Tag color="#2db7f5">{discount}% 折扣</Tag>
              ) : null
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
    const activeSelectedKey = currentOrder && currentOrder.activeSelectedKey;
    const selectedList = currentOrder && currentOrder.selectedList;
    if (!selectedList || (Array.isArray(selectedList) && selectedList.length === 0)) {
      return <div>购物车是空的</div>;
    }
    if (Array.isArray(selectedList) && selectedList.length > 0) {
      return (
        <div className={styles.selectedGoodsWrapper}>
          {this.generateSelectedListNode(selectedList, activeSelectedKey)}
          <Card
            bordered={false}
            bodyStyle={{ padding: '3px 15px 10px 15px' }}
            className={styles.totalPriceCard}
          >
            <span className={styles.totalPrice}>
              总价： {currentOrder.goodsPrice}
            </span>
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
