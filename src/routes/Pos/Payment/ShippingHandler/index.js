import React, { PureComponent } from 'react';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover, Table } from 'antd';
import { connect } from 'dva';
import TableForm from './TableForm';
import CascaderInFormItem from '../MilkPowderHandler/CascaderInFormItem';
import FooterToolbar from '../../../../components/FooterToolbar';
import styles from './index.less';
import Print from 'rc-print';
import Mousetrap from 'mousetrap';
import { POS_PHASE } from '../../../../constant';
import Receipt from '../Receipt';


const fieldLabels = {
  shippingData: '代发包裹信息',
  SenderName: '寄件人姓名',
  SenderPhoneNumber: '寄件人号码',
  ReceiverName: '收件人姓名',
  ReceiverPhoneNumber: '收件人号码',
  ReceiverIDNumber: '收件人身份证号',
  ReceiverAddress: '收件人地址',
  ReceiverDetailedAddress: '收件人详细地址（具体到门牌号）',
};


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

const keyboardMapping = ['backspace', 'p', 'enter'];


@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  express: state.express,
  loading: state.commodity.commonLoading,
  submitLoading: state.loading.effects['commodity/submitOrder'],
}))


@Form.create()

export default class ShippingHandler extends PureComponent {
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
  printHandler = () => {
    this.refs.printForm.onPrint();
  }
  prevHandler = () => {
    const activeTabKey = this.props.activeTabKey;
    const lastPhase = POS_PHASE.PAY;
    const targetPhase = POS_PHASE.TABLE;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase } });
  }
  checkShippingData = (rule, value, callback) => {
    const { Name } = value[0];
    if (Name.ID && Name.Name) {
      callback();
      return;
    }
    callback('快递公司是必填的');
  }
  fetchWaybillHandler = () => {
    const dataJson = JSON.stringify(this.props.form.getFieldValue('waybill'));
    const payload = {
      dataJson,
      setFieldsValueCallback: this.props.form.setFieldsValue,
    };
    this.props.dispatch({ type: 'commodity/fetchWaybill', payload });
  }
  submit = (value) => {
    this.props.dispatch({ type: 'commodity/submitOrder', payload: value });
  }
  valueHandler = (values) => {
    const { order } = this.props;
    const { ID } = order;
    const { selectedList, ...restOrder } = order;
    const newValues = { ...values, ...restOrder, waybill: selectedList };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    this.submit(payload);
  }
  validate = () => {
    this.props.form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.valueHandler(values);
      }
    });
  }
  render() {
    const { form, order, dispatch, loading, submitLoading } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const { shippingData, totalWeight, receiveMoney, totalPrice } = order || [];
    const validate = () => {
    };
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
            <div>
              <Receipt />
            </div>
          </div>
        </Print>
        <Card title="代发包裹管理" bordered={false} style={{ marginBottom: 24 }} >
          {getFieldDecorator('shippingData', {
              initialValue: shippingData,
            rules: [{ validator: this.checkShippingData }],
          })(
            <TableForm
              dispatch={dispatch}
              express={this.props.express}
              setFieldsValue={this.props.form.setFieldsValue}
              totalWeight={totalWeight}
            />
          )}
        </Card>
        <Card title="代发下单地址" bordered={false} style={{ marginBottom: 24 }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label={fieldLabels.SenderName}>
                  {getFieldDecorator('SenderName', {
                    rules: [{ required: true, message: '请输入寄件人姓名' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label={fieldLabels.SenderPhoneNumber}>
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
                <Form.Item label={fieldLabels.ReceiverName}>
                  {getFieldDecorator('ReceiverName', {
                    rules: [{ required: true, message: '请输入收件人姓名' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={8} md={12} sm={24}>
                <Form.Item label={fieldLabels.ReceiverPhoneNumber}>
                  {getFieldDecorator('ReceiverPhoneNumber', {
                    rules: [{ required: true, message: '请输入收件人电话' }],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
                <Form.Item label={fieldLabels.ReceiverIDNumber}>
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
                <Form.Item label={fieldLabels.ReceiverAddress}>
                  {getFieldDecorator('ReceiverAddress', {
                    rules: [{ required: true, message: '选择收件人地址' }],
                  })(
                    <CascaderInFormItem />
                  )}
                </Form.Item>
              </Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label={fieldLabels.ReceiverDetailedAddress}>
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
            onClick={this.printHandler}
            disabled={!!(totalPrice - receiveMoney > 0)}
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
