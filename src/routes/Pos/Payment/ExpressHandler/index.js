import React, { PureComponent } from 'react';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover, Table } from 'antd';
import { connect } from 'dva';
import TableForm from './TableForm';
import FooterToolbar from '../../../../components/FooterToolbar';
import { POS_PHASE } from '../../../../constant';
import styles from './index.less';
import Print from 'rc-print';
import Receipt from '../Receipt';


const fieldLabels = {
  expressData: '邮寄包裹信息',
};

const keyboardMapping = ['backspace', 'p', 'enter'];


const dataSource = [{
  key: '1',
  name: '胡彦斌',
  age: 32,
  address: '西湖区湖底公园1号',
}, {
  key: '2',
  name: '胡彦祖',
  age: 42,
  address: '西湖区湖底公园1号',
}];

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

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  express: state.express,
  submitLoading: state.loading.effects['commodity/submitOrder'],
}))


@Form.create()

export default class ExpressHandler extends PureComponent {
  componentDidMount() {
    Mousetrap.bind('backspace', () => this.prevHandler());
    Mousetrap.bind('p', () => this.printHandler());
    Mousetrap.bind('enter', () => this.validate());
  }
  componentWillUnmount() {
    keyboardMapping.forEach((item) => {
      Mousetrap.unbind(item);
    });
  }
  prevHandler = () => {
    const activeTabKey = this.props.activeTabKey;
    const lastPhase = POS_PHASE.PAY;
    const targetPhase = POS_PHASE.TABLE;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase } });
  }
  printHandler = () => {
    this.refs.printForm.onPrint();
  }
  checkExpressData = (rule, value, callback) => {
    if (value[0]) {
      const { Name, InvoiceNo } = value[0];
      if (Name && InvoiceNo) {
        callback();
        return;
      }
      callback('快递公司和运单号是必填的');
    } else {
      callback();
    }
  }
  valueHandler = (values) => {
    const { ID } = this.props.order;
    const { selectedList, ...restOrder } = this.props.order;
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
    const newValues = { ...values, ...restOrder, waybill: selectedList, ...address };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
  validate = () => {
    this.props.form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.valueHandler(values);
      }
    });
  }
  render() {
    const { form, order, dispatch, priceListNode, submitLoading } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const { expressData, receiveMoney, totalPrice } = order || [];
    const errors = getFieldsError();
    const getErrorInfo = () => {
      const errorCount = Object.keys(errors).filter(key => errors[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(errors).map((key) => {
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      );
    };


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
        <Card title="邮寄包裹管理" bordered={false} style={{ marginBottom: 24 }} >
          {getFieldDecorator('expressData', {
              initialValue: expressData,
              rules: [{ validator: this.checkExpressData }],
            })(
              <TableForm
                dispatch={dispatch}
                express={this.props.express}
              />
              )}
        </Card>
        <FooterToolbar style={{ width: '100%' }} extra={priceListNode}>
          {getErrorInfo()}
          <Button onClick={this.prevHandler}>返回</Button>
          <Button
            onClick={this.printHandler}
          >
            打印
          </Button>
          <Button
            type="primary"
            onClick={this.validate}
            loading={submitLoading}
            disabled={!!(totalPrice - receiveMoney > 0)}
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
