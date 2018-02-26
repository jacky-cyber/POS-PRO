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

@connect(state => ({
    rule: state.rule,
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
        dispatch({
            type: 'rule/fetch',
        });
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
                ...fieldsValue,
                updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
            };

            this.setState({
                formValues: values,
            });

            dispatch({
                type: 'rule/fetch',
                payload: values,
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
                    <Col md={8} sm={24}>
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
                    </Col>
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
                    </Col>
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
                    <Col md={8} sm={24}>
                        <FormItem label="商品编码">
                            {getFieldDecorator('goodsCode')(
                                <InputNumber style={{ width: '100%' }} />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={4} sm={24}>
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
                    </Col>
                    <Col md={4} sm={24}>
                        <FormItem label="收银员">
                            {getFieldDecorator('shopAssistant')(
                                <Select placeholder="请选择收银员" mode="multiple">
                                    <Option value="xiao">哈登</Option>
                                    <Option value="mao">保罗</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={4} sm={24}>
                        <FormItem label="客户">
                            {getFieldDecorator('customer')(
                                <Select placeholder="请选择客户" mode="multiple">
                                    <Option value="xiao">哈登</Option>
                                    <Option value="mao">保罗</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label="备注">
                            {getFieldDecorator('remark')(
                                <Input placeholder="请输入备注中的关键词" />
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
        const { rule: { loading: ruleLoading, data } } = this.props;
        const { selectedRows, modalVisible, addInputValue } = this.state;

        const orderColumns = [
            {
                title: '销售单信息',
                children: [
                    {
                        title: '流水号',
                        dataIndex: 'SertialNumber',
                    },
                    {
                        title: '收银员',
                        dataIndex: 'Cashier'
                    },
                    {
                        title: '应收金额',
                        dataIndex: 'ReceivableAmounts'
                    },
                    {
                        title: '实收金额',
                        dataIndex: 'RealAmounts'
                    }
                ]        
            },
            {
                title: '收款与找零',
                children: [
                    {
                        title: '收款金额',
                        dataIndex: 'ReceivedAmounts',
                    },
                    {
                        title: '找零金额',
                        dataIndex: 'GiveChangeAmounts',
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
                        title: '刷卡',
                        dataIndex: 'SwipeCard',
                    },
                    {
                        title: '储值卡',
                        dataIndex: 'SavingCard',
                    },
                    {
                        title: '外币',
                        dataIndex: 'ForeignCurrency',
                    },
                    {
                        title: '其他付款',
                        dataIndex: 'Other',
                    },
                ]
            },
            {
                title: '时间',
                children: [
                    {
                        title: '日期',
                        dataIndex: 'Date',
                    },
                    {
                        title: '时间',
                        dataIndex: 'Time',
                    },
                ]
            },
            {
                title: '客户',
                children: [
                    {
                        title: '优惠卡',
                        dataIndex: 'DiscountCard',
                    },
                    {
                        title: '客户编号',
                        dataIndex: 'CustomerIdentifier',
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
                dataIndex: 'GoodsCode',
            },
            {
                title: '条码',
                dataIndex: 'BarCode',
            },
            {
                title: '品名',
                dataIndex: 'GoodsName',
            },
            {
                title: '单位',
                dataIndex: 'Unit',
            },
            {
                title: '数量',
                dataIndex: 'Count',
            },
            {
                title: '进货金额',
                dataIndex: 'ImportAmounts',
            },
            {
                title: '零售金额',
                dataIndex: 'RetailAmounts',
            },
            {
                title: '销售金额',
                dataIndex: 'SaleAmounts',
            },
            {
                title: '会员金额',
                dataIndex: 'VipAmounts',
            },
            {
                title: '折扣',
                dataIndex: 'Discount',
            },
            {
                title: '毛利',
                dataIndex: 'GrossProfit',
            },
            {
                title: '营业员',
                dataIndex: 'Assistant',
            },
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
                            loading={ruleLoading}
                            onChange={this.handleStandardTableChange}
                            rowKey={record => record.key}
                            columns={orderColumns}
                        />
                        <Table
                            bordered
                            columns={goodsColumns}
                        />
                    </div>
                </Card>
            </PageHeaderLayout>
        );
    }
}
