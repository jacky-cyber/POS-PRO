import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { SALE_TYPE_MAPPING, POS_TYPE, POS_TAB_TYPE } from 'constant';
import { Row, Col, Card, Form, Input, Icon, Button, DatePicker, Table, Badge, Modal } from 'antd';
import Print from 'rc-print';
import { Receipt, MilkPowderReceipt } from 'components/BaseComponents';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import CascaderInFormItem from '../../Pos/Payment/MilkPowderHandler/CascaderInFormItem';
import SearchForm from './SearchForm';

import styles from './index.less';

const FormItem = Form.Item;


const fieldLabels = {
  senderName: '寄件人姓名',
  senderPhoneNumber: '寄件人号码',
  receiverName: '收件人姓名',
  receiverPhoneNumber: '收件人号码',
  receiverIDNumber: '收件人身份证号',
  receiverAddress: '收件人地址',
  receiverDetailedAddress: '收件人详细地址（具体到门牌号）',
};

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
    visible: false,
    tempReceiverAddress: {},
  };

  tableChangeHandler = (pagination = {}, filters, sorter) => {
    this.searchHandler(null, pagination);
  }

  getStatus = (record) => {
    const { Type, IsPush } = record;
    if (Type === POS_TAB_TYPE.MILKPOWDER) {
      return IsPush === 1 ? 'success' : 'error';
    } else {
      return 'default';
    }
  }

  getPushDisabled = (record) => {
    const { Type, IsPush } = record;
    if (Type === POS_TAB_TYPE.MILKPOWDER) {
      return IsPush === 1;
    } else {
      return true;
    }
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

  validate = () => {
    const { form } = this.props;
    const { tempReceiverAddress } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { ID, ...restValues } = fieldsValue;
      const value = {
        ...restValues,
        ReceiverAddress: tempReceiverAddress,
      };
      const Data = JSON.stringify(value);
      const OrderID = ID;
      const payload = {
        value: { OrderID, Data },
      };
      console.log('payload', payload);
      this.props.dispatch({ type: 'orders/pushMilkPowderOrder', payload });
    });
  }

  // modal 相关操作
  handleModalOpen = () => {
    this.setState({
      visible: true,
    });
    return new Promise((resolve) => {
      resolve();
    });
  }

  handleOk = () => {
    this.validate();
    this.handleCancel();
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }


  searchHandler = (e, pagination) => {
    const { dispatch } = this.props;
    const payload = {
      pagination: pagination || this.props.pagination,
    };
    dispatch({ type: 'orders/getHistoryOrders', payload });
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

  pushHandler = (record) => {
    this.getOrderReceiptHandler(record.ID).then(() => {
      this.handleModalOpen();
    }).then(() => {
      const { orderReceipt, form } = this.props;
      const {
        ID,
        SenderName,
        SenderPhoneNumber,
        ReceiverName,
        ReceiverPhoneNumber,
        ReceiverIDNumber,
        ReceiverAddress,
        ReceiverDetailedAddress,
      } = orderReceipt;
      const { setFieldsValue } = form;
      const value = {
        ID,
        SenderName,
        SenderPhoneNumber,
        ReceiverName,
        ReceiverPhoneNumber,
        ReceiverIDNumber,
        ReceiverAddress: ReceiverAddress.ID,
        ReceiverDetailedAddress,
      };
      this.setState({
        tempReceiverAddress: ReceiverAddress,
      });
      setFieldsValue(value);
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

  // renderSimpleForm() {
  //   const { getFieldDecorator } = this.props.form;
  //   return (
  //     <Form
  //       onSubmit={this.searchHandler}
  //       layout="inline"
  //     >
  //       <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
  //         <Col md={8} sm={24}>
  //           <FormItem label="起止日期">
  //             {getFieldDecorator('date', {
  //               initialValue: [moment().subtract(7, 'days'), moment()],
  //               // rules: [{
  //               //   required: true, message: '请选择起止日期',
  //               // }],
  //             })(
  //               <RangePicker
  //                 style={{ width: '100%' }}
  //                 placeholder={['开始日期', '结束日期']}
  //               />
  //             )}
  //           </FormItem>
  //         </Col>
  //         <Col md={4} sm={24}>
  //           <FormItem label="客户">
  //             {getFieldDecorator('customer', {
  //               rules: [{
  //                 // required: true, message: '请选择会员ID',
  //               }],
  //             })(
  //               <Input />
  //             )}
  //           </FormItem>
  //         </Col>
  //         <Col md={8} sm={24}>
  //           <span className={styles.submitButtons}>
  //             <Button type="primary" htmlType="submit">查询</Button>
  //             <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
  //             <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
  //               展开 <Icon type="down" />
  //             </a>
  //           </span>
  //         </Col>
  //       </Row>
  //     </Form>
  //   );
  // }
  render() {
    const { orderList, orderDetails, orderReceipt, form } = this.props;
    const { getFieldDecorator } = form;
    const { visible } = this.state;

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
        title: '推送',
        dataIndex: 'Push',
        children: [
          {
            title: '状态',
            dataIndex: 'IsPush',
            align: 'center',
            render: (text, record) => {
              return (
                <div>
                  <Badge status={this.getStatus(record)} />
                </div>
              );
            },
          },
          {
            title: '操作',
            dataIndex: 'PushAction',
            align: 'center',
            render: (text, record) => {
              return (
                <div>
                  <Button
                    size="small"
                    onClick={() => this.pushHandler(record)}
                    disabled={this.getPushDisabled(record)}
                  >
                        推送
                  </Button>
                </div>
              );
            },
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

    const pushForm = (
      <Form layout="vertical">
        <Form.Item style={{ display: 'none' }} label={fieldLabels.senderName}>
          {getFieldDecorator('ID', {
              // initialValue: orderReceipt.SenderName,
                    // rules: [{ required: true, message: '请输入寄件人姓名' }],
                  })(
                    <Input />
                  )}
        </Form.Item>
        <Col span={24}>
          <Form.Item label={fieldLabels.senderName}>
            {getFieldDecorator('SenderName', {
              // initialValue: orderReceipt.SenderName,
                    // rules: [{ required: true, message: '请输入寄件人姓名' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.senderPhoneNumber}>
            {getFieldDecorator('SenderPhoneNumber', {
                    // rules: [{ required: true, message: '请输入寄件人电话' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.receiverName}>
            {getFieldDecorator('ReceiverName', {
                    // rules: [{ required: true, message: '请输入收件人姓名' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.receiverPhoneNumber}>
            {getFieldDecorator('ReceiverPhoneNumber', {
                    // rules: [{ required: true, message: '请输入收件人电话' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.receiverIDNumber}>
            {getFieldDecorator('ReceiverIDNumber', {
                    // rules: [{ required: true, message: '请输入收件人身份证号' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.receiverAddress}>
            {getFieldDecorator('ReceiverAddress', {
                    // rules: [{ required: true, message: '选择收件人地址' }],
                  })(
                    <CascaderInFormItem />
                  )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={fieldLabels.receiverDetailedAddress}>
            {getFieldDecorator('ReceiverDetailedAddress', {
                    // rules: [{ required: true, message: '请输入收件人详细地址（具体到门牌号）' }],
                  })(
                    <Input />
                  )}
          </Form.Item>
        </Col>
      </Form>
    );


    return (
      <PageHeaderLayout title="历史订单列表">
        <Modal
          title="订单推送"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          { pushForm }
        </Modal>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <SearchForm />
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
