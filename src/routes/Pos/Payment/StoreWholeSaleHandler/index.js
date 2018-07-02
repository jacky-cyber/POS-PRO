import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd';
import { connect } from 'dva';
import Print from 'rc-print';
import { Receipt } from 'components/BaseComponents';
import FooterToolbar from '../../../../components/FooterToolbar';
import { POS_PHASE } from '../../../../constant';

const keyboardMapping = ['backspace', 'p', 'enter'];

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  submitLoading: state.loading.effects['commodity/submitOrder'],
}))


@Form.create()

export default class StoreWholeSaleHandler extends PureComponent {
  state = {
    printInfo: {},
  }
  componentDidMount() {
    Mousetrap.bind('backspace', () => this.prevHandler());
    Mousetrap.bind('p', () => this.printHandler());
    // Mousetrap.bind('enter', () => this.submitHandler())
    Mousetrap.bind('enter', () => this.submitButton.click());
  }
  componentWillUnmount() {
    keyboardMapping.forEach((item) => {
      Mousetrap.unbind(item);
    });
  }

  generatePrint = () => {
    const { order = {} } = this.props;
    const print = {
      ID: order.ID,
      createTime: order.createTime,
      shop: order.shop,
      selectedList: order.selectedList,
      totalPrice: order.totalPrice,
      expressCost: order.expressCost,
      shippingCost: order.shippingCost,
      expressData: order.expressData,
      shippingData: order.shippingData,
      paymentData: order.paymentData,
      type: order.type,
      saleType: order.saleType,
    };
    return print;
  }
  printHandler = () => {
    const print = this.generatePrint();
    this.setState({ printInfo: print }, () => {
      this.refs.printForm.onPrint();
    });
  }
  prevHandler = () => {
    const activeTabKey = this.props.activeTabKey;
    const lastPhase = POS_PHASE.PAY;
    const targetPhase = POS_PHASE.TABLE;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase } });
  }
  submitHandler = () => {
    const { order = {} } = this.props;
    const { ID } = order;
    const { selectedList, expressData, shippingData, ...restOrder } = order;
    const address = {
      SenderName: '',
      SenderPhoneNumber: '',
      ReceiverName: '',
      ReceiverPhoneNumber: '',
      ReceiverIDNumber: '',
      ReceiverAddress: {
        Province: '',
        City: '',
        District: '',
      },
      ReceiverDetailedAddress: '',
    };
    // 构造打印对象
    const print = this.generatePrint();
    const newValues = { ...restOrder, waybill: selectedList, ...address, print };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
  render() {
    const { printInfo } = this.state;
    const { order, submitLoading } = this.props;
    const { receiveMoney, totalPrice } = order;
    return (
      <div>
        <Print
          ref="printForm"
          title="门店出口/邮寄/代发"
        >
          <div style={{ display: 'none' }}>
            <div>
              <Receipt order={printInfo} />
            </div>
          </div>
        </Print>
        <FooterToolbar style={{ width: '100%' }}>
          <Button onClick={this.prevHandler}>返回</Button>
          <Button
            onClick={this.printHandler}
            disabled={!!(totalPrice - receiveMoney > 0)}
          >
            打印
          </Button>
          <Button
            type="primary"
            onClick={this.submitHandler}
            loading={submitLoading}
            disabled={!!(totalPrice - receiveMoney > 0)}
            ref={node => (this.submitButton = ReactDOM.findDOMNode(node))}
          >
            提交
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}
