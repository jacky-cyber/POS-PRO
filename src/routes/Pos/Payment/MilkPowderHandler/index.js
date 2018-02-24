import React, { PureComponent } from 'react';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd'
import { connect } from 'dva';
import TableForm from './TableForm';
import CascaderInFormItem from './CascaderInFormItem';
import FooterToolbar from '../../../../components/FooterToolbar';
import styles from './index.less'


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
}))


@Form.create()

export default class MilkPowderHandler extends PureComponent {
  checkWaybill = (rule, value, callback) => {
    const waybillRequiredFiltered = value.filter(item => item.Sku.includes('CGF') || item.Sku.includes('CGF'))
    if (waybillRequiredFiltered.find(item => (item.InvoiceNo)) || waybillRequiredFiltered.length === 0) {
      callback()
      return
    }
    callback('SKU 包含 CGF 或 YDF 的奶粉必须抓取订单号')
  }
  fetchWaybillHandler = () => {
    const dataJson = JSON.stringify(this.props.form.getFieldValue('waybill'))
    const payload = {
      dataJson,
      setFieldsValueCallback: this.props.form.setFieldsValue,
    }
    this.props.dispatch({type: 'commodity/fetchWaybill', payload})
  }
  valueHandler = (values) => {
    const { ID } = this.props.order
    const newValues = { ...values, ...this.props.order }
    const valuesJson = JSON.stringify(newValues)
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    }
    this.props.dispatch({ type: 'commodity/submitOrder', payload })
  }
  render() {
    const { form, order, dispatch } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const { selectedList } = order || []
    const waybillRequiredFiltered = selectedList.filter(item => item.Sku.includes('CGF') || item.Sku.includes('YDF'))
    const waybillUnRequiredFiltered = selectedList.filter(item => !item.Sku.includes('CGF') && !item.Sku.includes('YDF'))
    let selectedListForWaybill = []
    waybillRequiredFiltered.forEach(item => {
      for (let i=0; i<item.Count; i++) {
        selectedListForWaybill.push({
          ...item, Key: `${item.Sku}-${i}`, Count: 1
        })
      }
    })
    selectedListForWaybill = [ ...selectedListForWaybill, ...waybillUnRequiredFiltered ]
    const extraNodeForFetchWaybill = (
      <a onClick={() => this.fetchWaybillHandler()}>抓取订单号</a>
    )
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
        this.valueHandler(values)
        }
      });
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
        <Card title="抓取运单号" bordered={false} style={{marginBottom: 24}} extra={extraNodeForFetchWaybill}>
        {getFieldDecorator('waybill', {
          initialValue: selectedListForWaybill,
          rules: [{ validator: this.checkWaybill }]
        })(
          <TableForm />
        )}
        </Card>
        <Card title="奶粉下单地址"  bordered={false} style={{marginBottom: 24}}>
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
          <Button type="primary" onClick={validate} >
            提交
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}

// export default connect(({ global, loading }) => ({
// }))(Form.create()(MilkPowderHandler));
