import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import DescriptionList from 'components/DescriptionList';

const { Description } = DescriptionList;

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))

export default class Receipt extends PureComponent {
  render() {
    console.log('order', this.props.order);
    const { order } = this.props;
    const { ID, createTime } = order;
    return (
      <div>
        <DescriptionList col={1} title="Health Element">
          <Description term="NO">{ID}</Description>
          <Description term="Time">{createTime}</Description>
          <Description>
            <Row>
              <Col span={6}>Product</Col>
              <Col span={6}>Price</Col>
              <Col span={6}>Qty</Col>
              <Col span={6}>Total</Col>
            </Row>
          </Description>
        </DescriptionList>
      </div>
    );
  }
}
