import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { SALE_TYPE_MAPPING, POS_TYPE } from 'constant';
import { Row, Col, Card, Form, Input, Icon, Button, DatePicker, Table } from 'antd';
import Print from 'rc-print';
import { Receipt, MilkPowderReceipt } from 'components/BaseComponents';
import PageHeaderLayout from 'layouts/PageHeaderLayout';

import styles from './index.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@connect(state => ({
  orderList: state.orders.orderList,
  getOrderLoading: state.loading.effects['orders/getHistoryOrders'],
  orderDetails: state.orders.orderDetails,
  getDetailsLoading: state.loading.effects['orders/getOrderDetails'],
  orderReceipt: state.orders.orderReceipt,
  getReceiptLoading: state.loading.effects['orders/getOrderReceipt'],
  pagination: state.orders.pagination,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    expandForm: false,
  };

  componentDidMount() {
    this.searchHandler();
  }
  tableChangeHandler = (pagination = {}, filters, sorter) => {
    this.searchHandler(null, pagination);
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.searchHandler();
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }


  searchHandler = (e, pagination) => {
    if (e) {
      e.preventDefault();
    }
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const value = {
        PayTime: fieldsValue.date.map(item => item.format('YYYY-MM-DD')).toString(),
        MemberID: fieldsValue.customer,
      };
      const payload = {
        value,
        pagination: pagination || this.props.pagination,
      };
      dispatch({ type: 'orders/getHistoryOrders', payload });
    });
  }

  getOrderDetailHandler = (ID) => {
    if (ID) {
      return this.props.dispatch({ type: 'orders/getOrderDetails', payload: ID });
    }
  }

  formatOrderDetails = (orderList) => {
    return orderList.map(item => ({
      ...item,
      EN: item.ProductName,
      RetailPrice: item.OriginPrice,
      Count: item.CountQuantity,
    }));
  }

  getOrderReceiptHandler = (ID) => {
    if (ID) {
      return this.props.dispatch({ type: 'orders/getOrderReceipt', payload: ID });
    }
  }

  fillReceiptHandler = (record) => {
    const { Type } = record;
    this.getOrderReceiptHandler(record.ID).then(() => {
      this.printHandler(Type);
    });
  }

  printHandler = (type) => {
    if (type === POS_TYPE.MILKPOWDER.value) {
      this.milkPowderReceiptDOM.onPrint();
      return;
    }
    this.receiptDOM.onPrint();
  }
  storeReceiptDOM = (node) => {
    this.receiptDOM = node;
  }
  storeMilkReceiptDOM = (node) => {
    this.milkPowderReceiptDOM = node;
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        onSubmit={this.searchHandler}
        layout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="起止日期">
              {getFieldDecorator('date', {
                initialValue: [moment().subtract(7, 'days'), moment()],
                rules: [{
                  required: true, message: '请选择起止日期',
                }],
              })(
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('customer', {
                rules: [{
                  // required: true, message: '请选择会员ID',
                }],
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.searchHandler} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="起止日期">
              {getFieldDecorator('date', {
                rules: [{
                  required: true, message: '请选择起止日期',
                }],
              })(
                <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('customer', {
                rules: [{
                  // required: true, message: '请选择会员ID',
                }],
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} />
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  render() {
    const { orderList, orderDetails, orderReceipt } = this.props;

    const orderColumns = [
      {
        title: '销售单信息',
        children: [
          {
            title: '流水号',
            dataIndex: 'ID',
          },
          {
            title: '应收金额',
            dataIndex: 'OriginPrice',
            align: 'center',
          },
          {
            title: '实收金额',
            dataIndex: 'RealPrice',
            align: 'center',
          },
        ],
      },
      {
        title: '收款与找零',
        children: [
          {
            title: '收款金额',
            dataIndex: 'Collections',
            align: 'center',
            render: (text, record) => {
              return (
                record.Cash
              + record.EFTPOS
              + record.UnionPay
              + record.Transfer
              + record.CreditCard
              + record.LatiPay
              + record.AliPay
              + record.WeChatPay
              );
            },
          },
          {
            title: '找零金额',
            dataIndex: 'ChangeMoney',
            align: 'center',
          },
        ],
      },
      {
        title: '收款分类',
        children: [
          {
            title: '现金',
            dataIndex: 'Cash',
            align: 'center',
          },
          {
            title: 'EFTPOS',
            dataIndex: 'EFTPOS',
            align: 'center',
          },
          {
            title: '银联',
            dataIndex: 'UnionPay',
            align: 'center',
          },
          {
            title: '转账',
            dataIndex: 'Transfer',
            align: 'center',
          },
          {
            title: '信用卡',
            dataIndex: 'CreditCard',
            align: 'center',
          },
          {
            title: 'LatiPay',
            dataIndex: 'LatiPay',
            align: 'center',
          },
          {
            title: '支付宝',
            dataIndex: 'AliPay',
            align: 'center',
          },
          {
            title: '微信',
            dataIndex: 'WeChatPay',
            align: 'center',
          },
        ],
      },
      {
        title: '时间',
        children: [
          {
            title: '日期',
            dataIndex: 'PayTime',
            align: 'center',
          },
        ],
      },
      {
        title: '客户',
        children: [
          {
            title: '客户编号',
            dataIndex: 'MemberID',
            align: 'center',
          },
        ],
      },
      {
        title: '操作',
        dataIndex: 'Operation',
        align: 'center',
        render: (text, record) => {
          return (
            <div className={styles.orderOperation}>
              <Button
                type="primary"
                size="small"
                onClick={() => this.getOrderDetailHandler(record.ID)}
              >
              详情
              </Button>
              <Button
                size="small"
                onClick={() => this.fillReceiptHandler(record)}
              >
              补小票
              </Button>
            </div>
          );
        },
      },
    ];

    const goodsColumns = [
      {
        title: '商品编码',
        dataIndex: 'Sku',
        align: 'center',
      },
      {
        title: '条码',
        dataIndex: 'Barcode',
        align: 'center',
      },
      {
        title: '品名',
        dataIndex: 'ProductName',
        align: 'center',
      },
      {
        title: '单位',
        dataIndex: 'Unit',
        align: 'center',
      },
      {
        title: '数量',
        dataIndex: 'CountQuantity',
        align: 'center',
      },
      {
        title: '零售金额',
        dataIndex: 'OriginPrice',
        align: 'center',
      },
      {
        title: '销售金额',
        dataIndex: 'RealPrice',
        align: 'center',
      },
      {
        title: '销售方式',
        dataIndex: 'SellType',
        align: 'center',
        render: (text) => {
          return (
            <span>
              {
                text
                  ?
                    SALE_TYPE_MAPPING.filter(item => item.value === text)[0] &&
                    SALE_TYPE_MAPPING.filter(item => item.value === text)[0].labelCN
                  :
                '/'
              }
            </span>
          );
        },
      },
    ];


    return (
      <PageHeaderLayout title="历史订单列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <Table
              bordered
              size="small"
              rowClassName={styles.td}
              onChange={this.tableChangeHandler}
              rowKey={record => record.ID}
              columns={orderColumns}
              dataSource={orderList}
              pagination={this.props.pagination}
              loading={this.props.getOrderLoading}
            />
            <Table
              bordered
              size="small"
              columns={goodsColumns}
              dataSource={orderDetails}
              loading={this.props.getDetailsLoading}
              rowKey={record => record.ID}
              local={{ emptyText: '请先选择订单' }}
              pagination={false}
            />
          </div>
        </Card>
        <Print
          ref={this.storeReceiptDOM}
        >
          <div style={{ display: 'none' }}>
            <div>
              <Receipt
                order={orderReceipt}
              />
            </div>
          </div>
        </Print>
        <Print
          ref={this.storeMilkReceiptDOM}
        >
          <div style={{ display: 'none' }}>
            <div>
              <MilkPowderReceipt
                order={orderReceipt}
              />
            </div>
          </div>
        </Print>
      </PageHeaderLayout>
    );
  }
}
