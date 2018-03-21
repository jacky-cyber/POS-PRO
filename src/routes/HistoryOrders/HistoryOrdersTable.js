import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table, Radio } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './HistoryOrdersTable.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const saleTypeMapping = {
  1: '本地',
  2: '邮寄',
  3: '代发',
}

@connect(state => ({
  rule: state.rule,
  orderList: state.historyOrders.orderList,
  getOrderLoading: state.loading.effects['historyOrders/getHistoryOrders'],
  orderDetails: state.historyOrders.orderDetails,
  getDetailsLoading: state.loading.effects['historyOrders/getOrderDetails'],
  pagination: state.historyOrders.pagination,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    tempRowData: [],
  };

  componentDidMount() {
  }
  tableChangeHandler = (pagination={}, filters, sorter) => {
    const newPagination = {
      ...this.props.pagination,
      ...pagination,
    }
    this.props.dispatch({type: 'historyOrders/changePagination', payload: newPagination})
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'rule/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        PayTime: fieldsValue.date.map(item => item.format('YYYY-MM-DD')).toString(),
        MemberID: fieldsValue.customer,
        pagination: this.props.pagination,
      };
      dispatch({type: 'historyOrders/getHistoryOrders', payload: values})

      // this.setState({
      //   formValues: values,
      // });

      // dispatch({
      //   type: 'rule/fetch',
      //   payload: values,
      // });
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleAddInput = (e) => {
    this.setState({
      addInputValue: e.target.value,
    });
  }

  handleAdd = () => {
    this.props.dispatch({
      type: 'rule/add',
      payload: {
        description: this.state.addInputValue,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={8} sm={24}>
            <FormItem label="数据类型">
              {getFieldDecorator('dataType', {
                rules: [{
                  required: true, message: '请输入标题',
                }],
                initialValue: '2',
              })(
                <Radio.Group>
                  <Radio value="1">未日结的销售数据</Radio>
                  <Radio value="2">已日结的历史销售数据</Radio>
                </Radio.Group>
              )}
            </FormItem>
          </Col> */}
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
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={8} sm={24}>
            <FormItem label="数据类型">
              {getFieldDecorator('dataType', {
                rules: [{
                  required: true, message: '请输入标题',
                }],
                initialValue: '2',
              })(
                <Radio.Group>
                  <Radio value="1">未日结的销售数据</Radio>
                  <Radio value="2">已日结的历史销售数据</Radio>
                </Radio.Group>
              )}
            </FormItem>
          </Col> */}
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
          {/* <Col md={8} sm={24}>
            <FormItem label="商品编码">
              {getFieldDecorator('goodsCode')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col> */}
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
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={4} sm={24}>
            <FormItem label="卡号">
              {getFieldDecorator('cardNumber')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="单号">
              {getFieldDecorator('orderNumber')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col> */}
          {/* <Col md={8} sm={24}>
            <FormItem label="备注">
              {getFieldDecorator('remark')(
                <Input placeholder="请输入备注中的关键词" />
              )}
            </FormItem>
          </Col> */}
        </Row>
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

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  rowClickHandler = (record, index) => {
    return {
      onClick: () => {
        if (record.ID) {
          this.props.dispatch({type: 'historyOrders/getOrderDetails', payload: record.ID})
        }
      },
    };
  }

  render() {
    const { orderList } = this.props
    const { selectedRows, modalVisible, addInputValue } = this.state;

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
            dataIndex: 'OriginPrice'
          },
          {
            title: '实收金额',
            dataIndex: 'RealPrice'
          }
        ]
      },
      {
        title: '收款与找零',
        children: [
          {
            title: '收款金额',
            dataIndex: 'Collections',
            render: (text, record, index) => {
              return record.Cash + record.EFTPOS + record.UnionPay + record.Transfer + record.CreditCard + record.LatiPay + record.AliPay + record.WeChatPay
            }
          },
          {
            title: '找零金额',
            dataIndex: 'ChangeMoney',
          }
        ]
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
        ]
      },
      {
        title: '时间',
        children: [
          {
            title: '日期',
            dataIndex: 'PayTime',
          },
        ]
      },
      {
        title: '客户',
        children: [
          {
            title: '客户编号',
            dataIndex: 'MemberID',
          }
        ]
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
        dataIndex: 'BarCode',
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
      // {
      //   title: '毛利',
      //   dataIndex: 'GrossProfit',
      // },
      // {
      //   title: '营业员',
      //   dataIndex: 'Assistant',
      // },
      {
        title: '销售方式',
        dataIndex: 'SellType',
        render: (text, record, index) => (<span>{text ? saleTypeMapping[text] : `/`}</span>)
      }
    ]


    return (
      <PageHeaderLayout title="历史订单列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
            </div>
            <Table
              bordered
              // onChange={this.handleStandardTableChange}
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
              columns={goodsColumns}
              dataSource={this.props.orderDetails}
              loading={this.props.getDetailsLoading}
              rowKey={record => record.ID}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
