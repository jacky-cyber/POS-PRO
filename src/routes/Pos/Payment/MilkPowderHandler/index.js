import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd';
import { connect } from 'dva';
import Print from 'rc-print';
import { POS_PHASE } from 'constant';
import { MilkPowderReceipt } from 'components/BaseComponents';
import TableForm from './TableForm';
import CascaderInFormItem from './CascaderInFormItem';
import FooterToolbar from '../../../../components/FooterToolbar';
import styles from './index.less';

const keyboardMapping = ['backspace', 'p', 'enter'];

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
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  submitLoading: state.loading.effects['commodity/submitOrder'],
}))


@Form.create({
  onFieldsChange(props, changedFields) {
    const { dispatch } = props;
    const key = Object.keys(changedFields)[0];
    const payload = {
      [key]: changedFields[key].value,
    };
    dispatch({
      type: 'commodity/changeReceiverAddress',
      payload,
    });
  },
  mapPropsToFields(props) {
    const { order } = props;
    const {
      selectedList,
      SenderName,
      SenderPhoneNumber,
      ReceiverName,
      ReceiverPhoneNumber,
      ReceiverIDNumber,
      ReceiverAddress,
      ReceiverDetailedAddress,
    } = order || [];
    const value = {
      selectedList,
      SenderName,
      SenderPhoneNumber,
      ReceiverName,
      ReceiverPhoneNumber,
      ReceiverIDNumber,
      ReceiverAddress,
      ReceiverDetailedAddress,
    };
    const obj = {};
    Object.keys(value).forEach((item) => {
      if (item === 'ReceiverAddress') {
        Object.assign(obj,
          { [item]: Form.createFormField({ value: value[item].ID }) }
        );
      } else {
        Object.assign(obj,
          { [item]: Form.createFormField({ value: value[item] }) }
        );
      }
    });
    return obj;
  },
})

export default class MilkPowderHandler extends PureComponent {
  state = {
    printInfo: {},
  }
  componentDidMount() {
    Mousetrap.bind('backspace', () => this.prevHandler());
    Mousetrap.bind('p', () => this.printHandler());
    Mousetrap.bind('enter', () => this.submitButton.click());
    this.fetchWaybillHandler();
  }
  componentWillUnmount() {
    keyboardMapping.forEach((item) => {
      Mousetrap.unbind(item);
    });
  }
  getPrintInfo = () => {
    const { order = {} } = this.props;
    // 构造打印对象
    const print = {
      ID: order.ID,
      waybill: order.selectedList,
      createTime: order.createTime,
      SenderName: order.SenderName,
      SenderPhoneNumber: order.SenderPhoneNumber,
      ReceiverName: order.ReceiverName,
      ReceiverPhoneNumber: order.ReceiverPhoneNumber,
      ReceiverIDNumber: order.ReceiverIDNumber,
      ReceiverAddress: order.ReceiverAddress,
      ReceiverDetailedAddress: order.receiverDetailedAddress,
    };
    return print;
  }
  prevHandler = () => {
    const { activeTabKey } = this.props;
    const lastPhase = POS_PHASE.PAY;
    const targetPhase = POS_PHASE.TABLE;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase } });
  }
  checkWaybill = (rule, value, callback) => {
    if (value.find(item => (item.InvoiceNo)) || value.length === 0) {
      callback();
      return;
    }
    callback('奶粉订单提交前必须抓取订单号');
  }
  fetchWaybillHandler = () => {
    // const dataJson = JSON.stringify(this.props.form.getFieldValue('waybill'));
    // const payload = {
    //   dataJson,
    //   setFieldsValueCallback: this.props.form.setFieldsValue,
    // };
    // this.props.dispatch({ type: 'commodity/fetchWaybill', payload });
    this.props.dispatch({ type: 'commodity/fetchWaybill' });
  }
  printHandler = () => {
    const { printForm } = this.refs;
    printForm.onPrint();
  }
  valueHandler = () => {
    const { order = {} } = this.props;
    const { ID } = order;
    // 构造打印对象
    const print = {
      ID: order.ID,
      createTime: order.createTime,
      SenderName: order.SenderName,
      SenderPhoneNumber: order.SenderPhoneNumber,
      ReceiverName: order.ReceiverName,
      ReceiverPhoneNumber: order.ReceiverPhoneNumber,
      ReceiverIDNumber: order.ReceiverIDNumber,
      ReceiverAddress: order.ReceiverAddress,
      ReceiverDetailedAddress: order.receiverDetailedAddress,
    };
    const { selectedList, ...rest } = this.props.order;
    const newValues = {
      ...rest,
      waybill: selectedList,
      print,
    };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
  validate = (callback) => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (callback) {
          callback(values);
        }
      }
    });
  }
  render() {
    const { printInfo } = this.state;
    const { form, order, dispatch, submitLoading } = this.props;
    const { receiveMoney, totalPrice } = order;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const extraNodeForFetchWaybill = (
      <a onClick={() => this.fetchWaybillHandler()}>抓取订单号</a>
    );
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
          title="奶粉/生鲜"
        >
          <div style={{ display: 'none' }}>
            <div>
              <MilkPowderReceipt order={this.getPrintInfo()} />
            </div>
          </div>
        </Print>
        <Card title="抓取运单号" bordered={false} style={{ marginBottom: 24 }} extra={extraNodeForFetchWaybill}>
          {getFieldDecorator('selectedList', {
            rules: [{ validator: this.checkWaybill }],
          })(
            <TableForm />
          )}
        </Card>
        <Card title="奶粉下单地址" bordered={false} style={{ marginBottom: 24 }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label={fieldLabels.senderName}>
                  {getFieldDecorator('SenderName', {
                    rules: [{ required: true, message: '请输入寄件人姓名' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label={fieldLabels.senderPhoneNumber}>
                  {getFieldDecorator('SenderPhoneNumber', {
                    rules: [{ required: true, message: '请输入寄件人电话' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label={fieldLabels.receiverName}>
                  {getFieldDecorator('ReceiverName', {
                    rules: [{ required: true, message: '请输入收件人姓名' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label={fieldLabels.receiverPhoneNumber}>
                  {getFieldDecorator('ReceiverPhoneNumber', {
                    rules: [{ required: true, message: '请输入收件人电话' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label={fieldLabels.receiverIDNumber}>
                  {getFieldDecorator('ReceiverIDNumber', {
                    rules: [{ required: true, message: '请输入收件人身份证号' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label={fieldLabels.receiverAddress}>
                  {getFieldDecorator('ReceiverAddress', {
                    rules: [{ required: true, message: '选择收件人地址' }],
                  })(
                    <CascaderInFormItem />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label={fieldLabels.receiverDetailedAddress}>
                  {getFieldDecorator('ReceiverDetailedAddress', {
                    rules: [{ required: true, message: '请输入收件人详细地址（具体到门牌号）' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <FooterToolbar style={{ width: '100%' }}>
          {getErrorInfo()}
          <Button onClick={this.prevHandler}>返回</Button>
          <Button
            onClick={() => this.validate(this.printHandler)}
            disabled={!!(totalPrice - receiveMoney > 0)}
          >
            打印
          </Button>
          <Button
            type="primary"
            onClick={() => this.validate(this.valueHandler)}
            disabled={!!(totalPrice - receiveMoney > 0)}
            loading={submitLoading}
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
