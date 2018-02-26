import React, { PureComponent } from 'react';
import { Card, Button, Form, Icon, Col, Row, DatePicker, TimePicker, Input, Select, Popover, InputNumber } from 'antd';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import TableForm from './TableForm';
import styles from './style.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const fieldLabels = {
  name: '店名',
  shopAssistant: '在岗营业员',
  cash100: '100',
  cash50: '50',
  cash20: '20',
  cash10: '10',
  cash5: '5',
  cash2: '2',
  cash1: '1',
  cash0Dot5: '0.5',
  cash0Dot2: '0.2',
  cash0Dot1: '0.1',
  cashOpening: '初始现金',
  cashClosing: '现金余额',
  bankSaving: '存入银行',
  dateNow: '日期',
  url: '仓库域名',
  owner: '仓库管理员',
  approver: '审批人',
  dateRange: '生效日期',
  type: '仓库类型',
  name2: '任务名',
  url2: '任务描述',
  owner2: '执行人',
  approver2: '责任人',
  dateRange2: '生效日期',
  type2: '任务类型',
};

const cashFieldsNameMap = {
  cash100: '100',
  cash50: '50',
  cash20: '20',
  cash10: '10',
  cash5: '5',
  cash2: '2',
  cash1: '1',
  cash0Dot5: '0Dot5',
  cash0Dot2: '0Dot2',
  cash0Dot1: '0Dot1',
};


const tableData = [{
  key: '1',
  workId: '00001',
  name: 'John Brown',
  department: 'New York No. 1 Lake Park',
}, {
  key: '2',
  workId: '00002',
  name: 'Jim Green',
  department: 'London No. 1 Lake Park',
}, {
  key: '3',
  workId: '00003',
  name: 'Joe Black',
  department: 'Sidney No. 1 Lake Park',
}];

class AdvancedForm extends PureComponent {
  calcTotalCash = () => {
    const cashValues = this.props.form.getFieldsValue(Object.values(cashFieldsNameMap));
    const tempArray = Object.entries(cashValues)
      .filter(item => (item[1]))
      .map(item => [item[0].replace('Dot', '.'), item[1]])
      .map(item => (item[0] - 0) * item[1]);
    const cashInBox = tempArray.length > 0
      ?
      tempArray.reduce((partial, value) => {
        return partial + value;
      })
      :
      0;
    const cashOpening = this.props.form.getFieldValue('cashOpening') || 0;
    const income = cashInBox - cashOpening;
    return income;
  }
  calcCashInBank = (cashIncome) => {
    const cashClosing = this.props.form.getFieldValue('cashClosing') || 0;
    const cashInBank = cashIncome - cashClosing || 0;
    return cashInBank;
  }
  render() {
    const { form, dispatch, submitting } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const cashIncome = this.calcTotalCash();
    const cashInBank = this.calcCashInBank(cashIncome);
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        console.log(values);
        if (!error) {
          // submit the values
          dispatch({
            type: 'form/submitAdvancedForm',
            payload: values,
          });
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
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const extraCash = (
      <span>实际现金销售：{cashIncome}</span>
    );
    return (
      <PageHeaderLayout
        title="发起订货"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="基本信息" className={styles.card} bordered={false} />
        <Card title="在岗营业员" className={styles.card} bordered={false}>
          <Form hideRequiredMark>
            <Row guuter={16}>
              <Col lg={12} md={12} sm={24}>
                <Form.Item label={fieldLabels.shopAssistant}>
                  {getFieldDecorator('shopAssistant', {
                    rules: [{ required: true, message: '请选择在岗营业员' }],
                  })(
                    <Select placeholder="请选择在岗营业员" mode="multiple">
                      <Option value="xiao">哈登</Option>
                      <Option value="mao">保罗</Option>
                    </Select>
                    )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card title="实际收入" className={styles.card} bordered={false}>
          <Card title="现金" className={styles.card} type="inner" extra={extraCash}>
            <Form layout="horizontal" hideRequiredMark>
              <Row gutter={16}>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash100} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash100, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash50} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash50, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash20} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash20, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash10} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash10, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash5} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash5, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash2} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash2, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash1} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash1, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash0Dot5} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash0Dot5, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash0Dot2} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash0Dot2, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cash0Dot1} {...formItemLayout}>
                    {getFieldDecorator(cashFieldsNameMap.cash0Dot1, {
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cashOpening} {...formItemLayout}>
                    {getFieldDecorator('cashOpening', {
                      rules: [{ required: true, message: '请输入初始现金' }],
                    })(
                      <InputNumber min={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.cashClosing} {...formItemLayout}>
                    {getFieldDecorator('cashClosing', {
                      rules: [{ required: true, message: '请输入现金余额' }],
                    })(
                      <InputNumber min={0} />
                      )}
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} sm={24}>
                  <Form.Item label={fieldLabels.bankSaving} {...formItemLayout}>
                    {getFieldDecorator('bankSaving', {
                    })(
                      <span>{cashInBank}</span>
                      )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Card>
        <FooterToolbar>
          {getErrorInfo()}
          <Button type="primary" onClick={validate} loading={submitting}>
            提交
                </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    );
  }
}

export default connect(state => ({
  collapsed: state.global.collapsed,
  submitting: state.form.advancedFormSubmitting,
}))(Form.create()(AdvancedForm));
