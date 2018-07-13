import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { SALE_TYPE_MAPPING, POS_TYPE } from 'constant';
import { Row, Col, Card, Form, Input, Icon, Button, DatePicker, Table, Divider } from 'antd';
import PageHeaderLayout from 'layouts/PageHeaderLayout';

import styles from './index.less';

const FormItem = Form.Item;


@connect(state => ({
  dailyOrders: state.orders.dailyOrders,
  dailyTotalSale: state.orders.dailyTotalSale,
  getDailyOrdersLoading: state.loading.effects['orders/getDailyOrders'],
  getDetailsLoading: state.loading.effects['orders/getOrderDetailAndAddToOrder'],
}))
@Form.create()


export default class TableList extends PureComponent {
  componentDidMount() {
    this.searchHandler();
  }
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.searchHandler();
  }


  searchHandler = (e, pagination) => {
    if (e) {
      e.preventDefault();
    }
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const value = {
        PayTime: fieldsValue.date.format('YYYY-MM-DD').toString(),
      };
      const payload = {
        value,
      };
      dispatch({ type: 'orders/getDailyOrders', payload });
    });
  }

  getOrderDetailHandler = (ID) => {
    if (ID) {
      return this.props.dispatch({ type: 'orders/getOrderDetailAndAddToOrder', payload: ID });
    }
  }

  expandHandler = (expand, record) => {
    if (expand) {
      this.getOrderDetailHandler(record.ID);
    }
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        onSubmit={this.searchHandler}
        layout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="日期">
              {getFieldDecorator('date', {
                  initialValue: moment(),
                  rules: [{
                    required: true, message: '请选择日期',
                  }],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="查询日期"
                  />
                )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  getTitle = () => {
    const { dailyTotalSale } = this.props;
    const { totalFee, shippingFee } = dailyTotalSale;
    return (
      <div>
        <span className={styles.title}>
        今日销售额：{totalFee + shippingFee}
        </span>
        <Divider type="vertical" />
        <span>
          （商品{totalFee} 邮费{shippingFee}）
        </span>
      </div>
    );
  }

  render() {
    const {
      dailyOrders,
      dailyTotalSale,
      getDailyOrdersLoading,
      getDetailsLoading,
    } = this.props;


    const orderColumns = [
      {
        title: '销售单信息',
        dataIndex: 'saleTicket',
        children: [
          {
            title: '流水号',
            dataIndex: 'ID',
            key: 'ID',
          },
          {
            title: '零售价',
            dataIndex: 'OriginPrice',
            key: 'OriginPrice',
            align: 'center',
          },
          {
            title: '销售价',
            dataIndex: 'RealPrice',
            key: 'RealPrice',
            align: 'center',
          },
        ],
      },
      {
        title: '收款与找零',
        dataIndex: 'receive',
        children: [
          {
            title: '收款金额',
            dataIndex: 'Collections',
            key: 'Collections',
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
            key: 'ChangeMoney',
            align: 'center',
          },
        ],
      },
      {
        title: '收款分类',
        dataIndex: 'receiveDetail',
        children: [
          {
            title: '现金',
            dataIndex: 'Cash',
            key: 'Cash',
            align: 'center',
          },
          {
            title: 'EFTPOS',
            dataIndex: 'EFTPOS',
            key: 'EFTPOS',
            align: 'center',
          },
          {
            title: '银联',
            dataIndex: 'UnionPay',
            key: 'UnionPay',
            align: 'center',
          },
          {
            title: '转账',
            dataIndex: 'Transfer',
            key: 'Transfer',
            align: 'center',
          },
          {
            title: '信用卡',
            dataIndex: 'CreditCard',
            key: 'CreditCard',
            align: 'center',
          },
          {
            title: 'LatiPay',
            dataIndex: 'LatiPay',
            key: 'LatiPay',
            align: 'center',
          },
          {
            title: '支付宝',
            dataIndex: 'AliPay',
            key: 'AliPay',
            align: 'center',
          },
          {
            title: '微信',
            dataIndex: 'WeChatPay',
            key: 'WeChatPay',
            align: 'center',
          },
        ],
      },
      {
        title: '时间',
        dataIndex: 'time',
        children: [
          {
            title: '日期',
            dataIndex: 'PayTime',
            key: 'PayTime',
            align: 'center',
          },
        ],
      },
      {
        title: '客户',
        dataIndex: 'customer',
        children: [
          {
            title: '客户编号',
            dataIndex: 'MemberID',
            key: 'MemberID',
            align: 'center',
          },
        ],
      },
      // {
      //   title: '操作',
      //   dataIndex: 'Operation',
      //   align: 'center',
      //   render: (text, record) => {
      //     return (
      //       <div className={styles.orderOperation}>
      //         <Button
      //           type="primary"
      //           size="small"
      //           onClick={() => this.getOrderDetailHandler(record.ID)}
      //         >
      //         详情
      //         </Button>
      //       </div>
      //     );
      //   },
      // },
    ];


    const expandedRowRender = (record) => {
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
        <Table
          size="small"
          columns={goodsColumns}
          dataSource={record.detail}
          pagination={false}
          loading={getDetailsLoading}
          rowKey={record => record.ID}
        />
      );
    };


    return (
      <PageHeaderLayout title="销控表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <Table
              bordered
              size="small"
              rowClassName={styles.td}
              rowKey={record => record.ID}
              columns={orderColumns}
              dataSource={dailyOrders}
              pagination={false}
              loading={getDailyOrdersLoading}
              expandedRowRender={expandedRowRender}
              onExpand={this.expandHandler}
              title={this.getTitle}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
