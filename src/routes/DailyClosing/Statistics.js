import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { routerRedux } from 'dva/router';
import { POS_TAB_TYPE } from '../../constant'

import styles from './Statistics.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
    commodity: state.commodity
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
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

  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
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
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

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

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }
    addHandler = () => {
        this.props.dispatch(routerRedux.push('/pos/choose'));
        this.props.dispatch({type: 'commodity/clickAddButton', payload: POS_TAB_TYPE.ALLOCATEANDTRANSFER})
    }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="门店">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
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
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="规则3">
              {getFieldDecorator('rule3')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则4">
              {getFieldDecorator('rule4')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="规则5">
              {getFieldDecorator('rule5')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="规则6">
              {getFieldDecorator('rule6')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
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

  render() {
    const { selectedRows, modalVisible, addInputValue } = this.state;

    const columns = [
      {
        title: '编号',
        dataIndex: 'no',
        sorter: true,
      },
      {
        title: '部门',
        dataIndex: 'department',
        sorter: true,
      },
      {
        title: '现金',
        dataIndex: 'cash',
        sorter: true,
      },
      {
        title: 'EFTPOS',
        dataIndex: 'eftpos',
          sorter: true,
      },
      {
        title: '银联',
        dataIndex: 'unionPay',
        sorter: true,
      },
      {
        title: '转账',
          dataIndex: 'transfer',
          sorter: true,
      },
        {
            title: '信用卡',
            dataIndex: 'creditCard',
            sorter: true,
        },
        {
            title: 'LatiPay',
            dataIndex: 'latiPay',
            sorter: true,
        },
        {
            title: '支付宝',
            dataIndex: 'AliPay',
            sorter: true,
        },
        {
            title: '微信',
            dataIndex: 'WeChatPay',
            sorter: true,
        },
        {
            title: '总额-1',
            dataIndex: 'Total1',
            sorter: true,
        },
        {
            title: '奶粉',
            dataIndex: 'MilkPowder',
            sorter: true,
        },
        {
            title: '运费',
            dataIndex: 'MilkPowderFreight',
            sorter: true,
        },
        {
            title: '出口保健品',
            dataIndex: 'exportHealthCareProduct',
            sorter: true,
        },
        {
            title: '本地保健品',
            dataIndex: 'localHealthCareProduct',
            sorter: true,
        },
        {
            title: '总额-2',
            dataIndex: 'total2',
            sorter: true,
        },
        {
            title: '差额',
            dataIndex: 'balance',
            sorter: true,
        },
    ];


    return (
      <PageHeaderLayout title="调拨单列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <Button type="primary" onClick={this.addHandler}>新建调拨单</Button>
            <Table
              onChange={this.handleStandardTableChange}
              rowKey={record => record.key}
              columns={columns}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
