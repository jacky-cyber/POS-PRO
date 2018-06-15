import React, { PureComponent } from 'react';
import { Card, Table, Row, Col } from 'antd';
import { connect } from 'dva';
import DescriptionList from 'components/DescriptionList';
import styles from './index.less';


const { Description } = DescriptionList;

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  ID: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0].ID,
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
  columns = [{
    title: '商品名',
    dataIndex: 'EN',
  }, {
    title: 'SKU',
    dataIndex: 'Sku',
  }, {
    title: '数量',
    dataIndex: 'Count',
  }, {
    title: '运单号',
    dataIndex: 'InvoiceNo',
  }]
  render() {
    const { order, milkPowderData } = this.props;
    const {
      SenderName,
      SenderPhoneNumber,
      ReceiverName,
      ReceiverPhoneNumber,
      ReceiverIDNumber,
      ReceiverAddress = {},
      ReceiverDetailedAddress,
    } = milkPowderData;
    const { City, District, Province } = ReceiverAddress;
    const { ID, createTime } = order;
    const { waybill = [] } = milkPowderData;
    return (
      <div className={styles.milkPowderReceiptWrapper}>
        <h1 className={styles.title}>奶粉下单</h1>
        <h3>订单信息</h3>
        <DescriptionList col={2} className={styles.content}>
          <Description term="订单号">{ID}</Description>
          <Description term="下单时间">{createTime}</Description>
        </DescriptionList>
        <h3>商品信息</h3>
        <Table
          size="small"
          columns={this.columns}
          dataSource={waybill}
          rowKey={record => record.Key}
          pagination={false}
        />
        <h3>收件人信息</h3>
        <Row className={styles.content}>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                姓名
              </span>
              <span>
                {ReceiverName}
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                号码
              </span>
              <span>
                {ReceiverPhoneNumber}
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                身份证号
              </span>
              <span>
                {ReceiverIDNumber}
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                地址
              </span>
              <span>
                { City } { District } { Province }
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                详细地址
              </span>
              <span>
                { ReceiverDetailedAddress }
              </span>
            </div>
          </Col>
        </Row>
        <h3>寄件人信息</h3>
        <Row className={styles.content}>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                姓名
              </span>
              <span>
                {SenderName}
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.item}>
              <span>
                电话
              </span>
              <span>
                {SenderPhoneNumber}
              </span>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
