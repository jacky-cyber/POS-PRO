import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';
import ReactDOM from 'react-dom';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover, Table } from 'antd';
import Print from 'rc-print';
import { connect } from 'dva';
import FooterToolbar from '../../../../components/FooterToolbar';
import styles from './index.less';
import Receipt from '../Receipt';
import { POS_PHASE } from '../../../../constant';


const columns = [{
  title: '姓名',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '年龄',
  dataIndex: 'age',
  key: 'age',
}, {
  title: '住址',
  dataIndex: 'address',
  key: 'address',
}];

const keyboardMapping = ['backspace', 'p', 'enter'];


@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  submitLoading: state.loading.effects['commodity/submitOrder'],
}))


@Form.create()


export default class LocalHandler extends PureComponent {
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
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
  render() {
    const { priceListNode, submitLoading, order } = this.props;
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
        {/* <FooterToolbar style={{ width: '100%', paddingLeft: 440, }} extra={priceListNode} > */}
        <FooterToolbar style={{ width: '100%', paddingLeft: 440 }}>
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

// export default connect(({ global, loading }) => ({
// }))(Form.create()(MilkPowderHandler));
