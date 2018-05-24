import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { SALE_TYPE_MAPPING } from 'constant';
import { Row, Col, Card, Form, Input, Icon, Button, DatePicker, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './HistoryOrdersTable.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@connect(state => ({
  orderList: state.historyOrders.orderList,
  getOrderLoading: state.loading.effects['historyOrders/getHistoryOrders'],
  orderDetails: state.historyOrders.orderDetails,
  getDetailsLoading: state.loading.effects['historyOrders/getOrderDetails'],
  pagination: state.historyOrders.pagination,
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
      dispatch({ type: 'historyOrders/getHistoryOrders', payload });
    });
  }


  rowClickHandler = (record, index) => {
    return {
      onClick: () => {
        if (record.ID) {
          this.props.dispatch({ type: 'historyOrders/getOrderDetails', payload: record.ID });
        }
      },
    };
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
    const { orderList } = this.props;

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
          },
          {
            title: '实收金额',
            dataIndex: 'RealPrice',
          },
        ],
      },
      {
        title: '收款与找零',
        children: [
          {
            title: '收款金额',
            dataIndex: 'Collections',
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
          },
        ],
      },
      {
        title: '收款分类',
        children: [
          {
            title: '现金',
            dataIndex: 'Cash',
          },
          {
            title: 'EFTPOS',
            dataIndex: 'EFTPOS',
          },
          {
            title: '银联',
            dataIndex: 'UnionPay',
          },
          {
            title: '转账',
            dataIndex: 'Transfer',
          },
          {
            title: '信用卡',
            dataIndex: 'CreditCard',
          },
          {
            title: 'LatiPay',
            dataIndex: 'LatiPay',
          },
          {
            title: '支付宝',
            dataIndex: 'AliPay',
          },
          {
            title: '微信',
            dataIndex: 'WeChatPay',
          },
        ],
      },
      {
        title: '时间',
        children: [
          {
            title: '日期',
            dataIndex: 'PayTime',
          },
        ],
      },
      {
        title: '客户',
        children: [
          {
            title: '客户编号',
            dataIndex: 'MemberID',
          },
        ],
      },
      {
        title: '操作',
        dataIndex: 'Operation',
      },
    ];

    const goodsColumns = [
      {
        title: '商品编码',
        dataIndex: 'Sku',
      },
      {
        title: '条码',
        dataIndex: 'Barcode',
      },
      {
        title: '品名',
        dataIndex: 'ProductName',
      },
      {
        title: '单位',
        dataIndex: 'Unit',
      },
      {
        title: '数量',
        dataIndex: 'CountQuantity',
      },
      {
        title: '零售金额',
        dataIndex: 'OriginPrice',
      },
      {
        title: '销售金额',
        dataIndex: 'RealPrice',
      },
      {
        title: '销售方式',
        dataIndex: 'SellType',
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
              onRow={this.rowClickHandler}
              dataSource={orderList}
              pagination={this.props.pagination}
              loading={this.props.getOrderLoading}
            />
            <Table
              bordered
              size="small"
              columns={goodsColumns}
              dataSource={this.props.orderDetails}
              loading={this.props.getDetailsLoading}
              rowKey={record => record.ID}
              local={{ emptyText: '请先选择订单' }}
              pagination={false}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
