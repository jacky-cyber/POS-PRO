import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { routerRedux } from 'dva/router';
import { POS_TAB_TYPE } from '../../../constant';
import GoodsList from './GoodsList'

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  goodsList: state.orderGoods.goodsList,
  isGetGoodsListLoading: state.orderGoods.isGetGoodsListLoading,
}))
@Form.create()
export default class PlaceAnOrder extends PureComponent {
  state = {
    goodsOrderedList: [],
    goodsList: [],
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'orderGoods/fetchGoodsList' })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsList && Array.isArray(nextProps.goodsList)) {
      this.setState({ goodsList: nextProps.goodsList })
    }
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
  countChangeHandler(value, record) {
    const { goodsOrderedList } = this.state
    let newList = []
    const tempItem = goodsOrderedList.filter(item => item.Sku === record.Sku)[0]
    if (tempItem) {
      newList = goodsOrderedList.map(item => {
        if (item.Sku === tempItem.Sku) { return { ...tempItem, Count: value } }
        return item
      })
    } else {
      newList = [...goodsOrderedList, { ...record, Count: value }]
    }
    const newFilteredList = newList.filter(item => item.Count !== 0)
    this.setState({ goodsOrderedList: newFilteredList }, () => console.log(this.state.goodsOrderedList))
  }
  clickChooseGoodsHandler() {
    this.setState({ modalVisible: true })
  }

  render() {
    const { goodsList, isGetGoodsListLoading, } = this.props;
    const { modalVisible } = this.state

    const columns = [
      {
        title: 'SKU',
        dataIndex: 'Sku',
      },
      {
        title: '英文名',
        dataIndex: 'EnglishName',
      },
      {
        title: '中文名',
        dataIndex: 'Name',
      },
      {
        title: '规格',
        dataIndex: 'Specification',
      },
      {
        title: '订货数量',
        dataIndex: 'Count',
        render: (text, record, index) => (
          <InputNumber value={text} min={0} max={record.Storage || 0} onChange={(value) => this.countChangeHandler(value, record)} />
        )
      },
      {
        title: '库存量',
        dataIndex: 'Storage',
      },
    ];


    return (
      <PageHeaderLayout title="发起订货">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <div className={styles.tableListForm}>
              {this.renderForm()}
            </div> */}
            <Button type="primary" onClick={() => this.clickChooseGoodsHandler()}>点击选择商品</Button>
            <Modal
              visible={modalVisible}
              onCancel={() => this.setState({ modalVisible: false })}
              width={1200}
              footer={null}
              closable={false}
            >
              <GoodsList
                goodsList={this.state.goodsList}
                loading={isGetGoodsListLoading}
                countChangeHandler={this.countChangeHandler.bind(this)}
              />
            </Modal>
            <Table
              onChange={this.handleStandardTableChange}
              rowKey={record => record.key}
              columns={columns}
              dataSource={this.state.goodsOrderedList}
              pagination={null}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
