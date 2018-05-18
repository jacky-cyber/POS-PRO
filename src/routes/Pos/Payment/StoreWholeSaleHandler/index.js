import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd';
import { connect } from 'dva';
import Print from 'rc-print';
import Receipt from '../Receipt';
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
  printHandler = () => {
    this.refs.printForm.onPrint();
  }
  prevHandler = () => {
    const activeTabKey = this.props.activeTabKey;
    const lastPhase = POS_PHASE.PAY;
    const targetPhase = POS_PHASE.TABLE;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase } });
  }
  submitHandler = () => {
    const { ID } = this.props.order;
    const { selectedList, expressData, shippingData, ...restOrder } = this.props.order;
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
    const newValues = { ...restOrder, waybill: selectedList, ...address };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    console.log('valuesJson', valuesJson);
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
  render() {
    const { order, submitLoading } = this.props;
    const { receiveMoney, totalPrice } = order;
    return (
      <div>
        <Print
          ref="printForm"
          title="门店出口/邮寄/代发"
        >
          <div style={{ display: 'none' }}>
            <div style={{ width: '80mm', border: '1px solid' }}>
              <Receipt />
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
