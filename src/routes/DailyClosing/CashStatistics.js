import React, { PureComponent } from 'react';
import { Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, InputNumber, Spin } from 'antd';
import { connect } from 'dva';
import Cookies from 'js-cookie';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import styles from './style.less';

const { TextArea } = Input;

const serviceChargeMapping = {
  unionPay: 0.022,
  creditCard: 0.025,
  aliPay: 0.015,
  weChatPay: 0.015,
  eftopsIncome: 1,
  transferIncome: 1,
  latiPayIncome: 1,
};

const fieldLabelsAndNamesMapping = {
  date: {
    label: '日期',
    name: 'Date',
  },
  shopName: {
    label: '店名',
    name: 'ShopName',
  },
  shopAssistant: {
    label: '在岗营业员',
    name: 'ShopAssistant',
  },
  cash100: {
    label: '100',
    name: 'Cash100',
  },
  cash50: {
    label: '50',
    name: 'Cash50',
  },
  cash20: {
    label: '20',
    name: 'Cash20',
  },
  cash10: {
    label: '10',
    name: 'Cash10',
  },
  cash5: {
    label: '5',
    name: 'Cash5',
  },
  cash2: {
    label: '2',
    name: 'Cash2',
  },
  cash1: {
    label: '1',
    name: 'Cash1',
  },
  cash0Dot5: {
    label: '0.5',
    name: 'Cash0Dot5',
  },
  cash0Dot2: {
    label: '0.2',
    name: 'Cash0Dot2',
  },
  cash0Dot1: {
    label: '0.1',
    name: 'Cash0Dot1',
  },
  cashOpening: {
    label: '开箱金额',
    name: 'CashOpening',
  },
  cashClosing: {
    label: '闭箱金额',
    name: 'CashClosing',
  },
  bankSaving: {
    label: '存入银行',
    name: 'BankSaving',
  },
  unionPay: {
    label: '实际银联收款',
    name: 'UnionPay',
  },
  unionPayIncome: {
    label: '实际银联销售',
    name: 'UnionPayIncome',
  },
  unionPayServiceCharge: {
    label: '手续费',
    name: 'UnionPayServiceCharge',
  },
  unionPayIntoAccount: {
    label: '实际银联到账',
    name: 'UnionPayIntoAccount',
  },
  creditCard: {
    label: '实际 CreditCard 收款',
    name: 'CreditCard',
  },
  creditCardIncome: {
    label: '实际 CreditCard 销售',
    name: 'CreditCardIncome',
  },
  creditCardServiceCharge: {
    label: '手续费',
    name: 'CreditCardServiceCharge',
  },
  aliPay: {
    label: '实际支付宝收款',
    name: 'AliPay',
  },
  aliPayIncome: {
    label: '实际支付宝销售',
    name: 'AliPayIncome',
  },
  aliPayServiceCharge: {
    label: '手续费',
    name: 'AliPayServiceCharge',
  },
  weChatPay: {
    label: '实际微信收款',
    name: 'WeChatPay',
  },
  weChatPayIncome: {
    label: '实际微信销售',
    name: 'WeChatPayIncome',
  },
  weChatPayServiceCharge: {
    label: '手续费',
    name: 'WeChatPayServiceCharge',
  },
  eftopsIncome: {
    label: '实际 EFTOPS 销售',
    name: 'EftopsIncome',
  },
  transferIncome: {
    label: '实际转账销售',
    name: 'TransferIncome',
  },
  latiPayIncome: {
    label: '实际纽元通 LatiPay 销售',
    name: 'LatiPayIncome',
  },
  frontEndIncome: {
    label: '前台销售额',
    name: 'FrontEndIncome',
  },
  backEndIncome: {
    label: '后台销售额',
    name: 'BackEndIncome',
  },
  exportRecord: {
    label: '出口记录',
    name: 'ExportRecord',
  },
  operator: {
    label: '操作员',
    name: 'Operator',
  },
  realTotalIncome: {
    label: '实际总销售额',
    name: 'RealTotalIncome',
  },
  accountTotalIncome: {
    label: '账面总销售额',
    name: 'AccountTotalIncome',
  },
  difference: {
    label: '差额',
    name: 'Difference',
  },
  remark: {
    label: '备注',
    name: 'Remark',
  },
};

const cashFieldsNameMap = {
  cash100: 'Cash100',
  cash50: 'Cash50',
  cash20: 'Cash20',
  cash10: 'Cash10',
  cash5: 'Cash5',
  cash2: 'Cash2',
  cash1: 'Cash1',
  cash0Dot5: 'Cash0Dot5',
  cash0Dot2: 'Cash0Dot2',
  cash0Dot1: 'Cash0Dot1',
};

@connect(({ dailyClosing, loading }) => ({
  dailyClosingResult: dailyClosing.dailyClosingResult,
  submitLoading: loading.effects['dailyClosing/addOrUpdateDailyClosing'],
  getLoading: loading.effects['dailyClosing/getDailyClosing'],
}))

@Form.create()

export default class CashStatistics extends PureComponent {
  state = {
    width: '100%',
  };
  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }
   resizeFooterToolbar = () => {
     const sider = document.querySelectorAll('.ant-layout-sider')[0];
     const width = `calc(100% - ${sider.style.width})`;
     if (this.state.width !== width) {
       this.setState({ width });
     }
   }
  dateChangeHandler = (date, dateString) => {
    const payload = {
      dtTurnoverDate: dateString,
      setFieldsValueCallback: this.props.form.setFieldsValue,
    };
    this.props.dispatch({ type: 'dailyClosing/getDailyClosing', payload });
  }


  calcTotalCash = () => {
    const cashValues = this.props.form.getFieldsValue(Object.values(cashFieldsNameMap));
    const tempArray = Object.entries(cashValues)
      .filter(item => (item[1]))
      .map(item => [item[0].replace('Cash', ''), item[1]])
      .map(item => [item[0].replace('Dot', '.'), item[1]])
      .map(item => (item[0] - 0) * item[1]);
    const cashInBox = tempArray.length > 0
      ?
      tempArray.reduce((partial, value) => {
        return partial + value;
      })
      :
      0;
    const cashOpening = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.cashOpening.name) || 0;
    const income = cashInBox - cashOpening;
    return income;
  }
  calcCashInBank = (cashIncome) => {
    const cashClosing = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.cashClosing.name) || 0;
    const cashInBank = cashIncome - cashClosing || 0;
    return cashInBank;
  }
  calcUnionPayIncome = () => {
    const unionPay = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.unionPay.name) || 0;
    const service = unionPay && unionPay * serviceChargeMapping.unionPay;
    return (unionPay - service).toFixed(2);
  }
  calcUnionPayServiceCharge = () => {
    const unionPay = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.unionPay.name) || 0;
    const serviceCharge = unionPay && unionPay * serviceChargeMapping.unionPay;
    return (serviceCharge).toFixed(2);
  }
  calcIncome = (name) => {
    const value = this.props.form.getFieldValue(fieldLabelsAndNamesMapping[name].name) || 0;
    const serviceCharge = value && value * serviceChargeMapping[name];
    const income = parseFloat((value - serviceCharge).toFixed(2));
    // this.props.form.setFieldsValue({[fieldLabelsAndNamesMapping[name]['name']]: income})
    return income;
  }
  calcServiceCharge = (name) => {
    const value = this.props.form.getFieldValue(fieldLabelsAndNamesMapping[name].name) || 0;
    const serviceCharge = (value && value * serviceChargeMapping[name]).toFixed(2);
    return parseFloat(serviceCharge);
  }
  calcUnCashIncome = () => {
    const unionPayIncome = this.calcIncome('unionPay');
    const creditCardIncome = this.calcIncome('creditCard');
    const aliPayIncome = this.calcIncome('aliPay');
    const weChatPayIncome = this.calcIncome('weChatPay');
    const eftopsIncome = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.eftopsIncome.name) || 0;
    const transferIncome = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.transferIncome.name) || 0;
    const latiPayIncome = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.latiPayIncome.name) || 0;
    const income = unionPayIncome + creditCardIncome + aliPayIncome + weChatPayIncome + eftopsIncome + transferIncome + latiPayIncome;
    return income;
  }
  calcTotalAccountIncome = () => {
    const frontEndIncome = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.frontEndIncome.name) || 0;
    const backEndIncome = this.props.form.getFieldValue(fieldLabelsAndNamesMapping.backEndIncome.name) || 0;
    return frontEndIncome + backEndIncome;
  }
  render() {
    const { form, submitLoading, getLoading } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    const cashIncome = this.calcTotalCash();
    const unCashIncome = this.calcUnCashIncome();
    const totalAccountIncome = this.calcTotalAccountIncome();
    const cashInBank = this.calcCashInBank(cashIncome);
    const unionPayIncome = this.calcIncome('unionPay');
    const unionPayServiceCharge = this.calcServiceCharge('unionPay');
    const unionPayIntoAccount = this.calcServiceCharge('unionPay');
    const creditCardIncome = this.calcIncome('creditCard');
    const creditCardServiceCharge = this.calcServiceCharge('creditCard');
    const aliPayIncome = this.calcIncome('aliPay');
    const aliPayServiceCharge = this.calcServiceCharge('aliPay');
    const weChatPayServiceCharge = this.calcServiceCharge('weChatPay');
    const realTotalIncome = cashIncome + unCashIncome;
    const difference = parseFloat((realTotalIncome - totalAccountIncome).toFixed(2));
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
        let item = [...key];
        item[0] = item[0].toLowerCase();
        item = item.join('');
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabelsAndNamesMapping[item].label}</div>
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
    const cashFormItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const formItemLayout = {
      labelCol: { span: 16 },
      wrapperCol: { span: 8 },
    };
    const basicFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const extraCash = (
      <span>实际现金销售：{cashIncome}</span>
    );
    const extraUnCash = (
      <span>实际非现金销售：{unCashIncome}</span>
    );
    const extraTotalAccountIncome = (
      <span>账面总销售额: {totalAccountIncome}</span>
    );
    const footerExtra = (
      <Row gutter={16} className={styles.footerExtra}>
        <Col lg={6} md={12} sm={24}>
          <Form.Item label={fieldLabelsAndNamesMapping.realTotalIncome.label} {...formItemLayout} >
            {getFieldDecorator(fieldLabelsAndNamesMapping.realTotalIncome.name, {
                      initialValue: 0,
                    })(
                      <span>{realTotalIncome}</span>
                      )}
          </Form.Item>
        </Col>
        <Col lg={6} md={12} sm={24}>
          <Form.Item label={fieldLabelsAndNamesMapping.accountTotalIncome.label} {...formItemLayout} >
            {getFieldDecorator(fieldLabelsAndNamesMapping.accountTotalIncome.name, {
                      initialValue: 0,
                    })(
                      <span>{totalAccountIncome}</span>
                      )}
          </Form.Item>
        </Col>
        <Col lg={6} md={12} sm={24}>
          <Form.Item label={fieldLabelsAndNamesMapping.difference.label} {...formItemLayout} >
            {getFieldDecorator(fieldLabelsAndNamesMapping.difference.name, {
                      initialValue: 0,
                    })(
                      <span>{difference}</span>
                      )}
          </Form.Item>
        </Col>
      </Row>
      // <div>
      //   <span>实际总销售额 {unCashIncome + cashIncome}</span>
      //   <Divider type="vertical" />
      //   <span>账面中销售额 {totalAccountIncome}</span>
      //   <Divider type="vertical" />
      //   <span>差额 {(unCashIncome + cashIncome - totalAccountIncome).toFixed(2)}</span>
      // </div>
    );
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          console.log('values', values);
          console.log(typeof values.Date.format('YYYY-MM-DD'));
          const newValues = {
            dtTurnoverDate: values.Date.format('YYYY-MM-DD'),
            i100D: values.Cash100,
            i50D: values.Cash50,
            i20D: values.Cash20,
            i10D: values.Cash10,
            i5D: values.Cash5,
            i2D: values.Cash2,
            i1D: values.Cash1,
            i50C: values.Cash0Dot5,
            i20C: values.Cash0Dot2,
            i10C: values.Cash0Dot1,
            fUniPay: values.UnionPay,
            fUnipayFee: unionPayServiceCharge,
            fCredit: values.CreditCard,
            fCreditFee: creditCardServiceCharge,
            fAliPay: values.AliPay,
            fAliPayFee: aliPayServiceCharge,
            fWeChat: values.WeChatPay,
            fWeChatFee: weChatPayServiceCharge,
            fCashOpening: values.CashOpening,
            fCashClosing: values.CashClosing,
            fEftpos: values.EftopsIncome,
            fTransfer: values.TransferIncome,
            fZFBWC: values.LatiPayIncome,
            iDepartmentID: Cookies.get('departmentID'),
            fFrontSale: values.FrontEndIncome,
            fBackSale: values.BackEndIncome,
            sSaleName: values.ShopAssistant,
            sOperator: values.Operator,
            fFreight: values.ExportRecord,
            sDiffAppendix: values.Remark,
          };
          console.log('newValues', newValues);
          this.props.dispatch({ type: 'dailyClosing/addOrUpdateDailyClosing', payload: newValues });
          // submit the values
          // dispatch({
          //   type: 'form/submitAdvancedForm',
          //   payload: values,
          // });
        }
      });
    };
    return (
      <PageHeaderLayout
        title="现金收款复查"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="日期" className={styles.card} bordered={false}>
          <Form layout="horizontal" >
            <Row guuter={16}>
              <Col lg={12} md={12} sm={24}>
                <Form.Item label={fieldLabelsAndNamesMapping.date.label}>
                  {getFieldDecorator(fieldLabelsAndNamesMapping.date.name, {
                    rules: [{ required: true, message: '请选择日期' }],
                  })(
                    <DatePicker onChange={this.dateChangeHandler} />
                    )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Spin
          spinning={getLoading}
          size="large"
          tip="请先选择日期或等待响应"
        >

          <Card title="基本信息" className={styles.card} bordered={false} />
          <Card title="在岗营业员" className={styles.card} bordered={false}>
            <Form layout="horizontal" >
              <Row guuter={16}>
                <Col lg={12} md={12} sm={24}>
                  <Form.Item label={fieldLabelsAndNamesMapping.shopAssistant.label}>
                    {getFieldDecorator(fieldLabelsAndNamesMapping.shopAssistant.name, {
                    // initialValue: typeof dailyClosingResult['sSaleName'] === 'string' ? dailyClosingResult['sSaleName'].split(',') : [],
                      initialValue: [],
                    rules: [{ required: true, message: '请选择在岗营业员' }],
                  })(
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      tokenSeparators={[',', ';', '，', '；']}
                    />
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
                    <Form.Item label={fieldLabelsAndNamesMapping.cash100.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash100.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i100D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash50.label} {...cashFormItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash50.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i50D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash20.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash20.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i20D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash10.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash10.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i10D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash5.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash5.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i5D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash2.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash2.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i2D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash1.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash1.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i1D'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash0Dot5.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash0Dot5.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i50C'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash0Dot2.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash0Dot2.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i20C'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cash0Dot1.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cash0Dot1.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['i10C'] || 0,
                    })(
                      <InputNumber min={0} precision={0} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cashOpening.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cashOpening.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fCashOpening'] || 0,
                      rules: [{ required: true, message: '开箱金额' }],
                    })(
                      <InputNumber min={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.cashClosing.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.cashClosing.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fCashClosing'] || 0,
                      rules: [{ required: true, message: '闭箱金额' }],
                    })(
                      <InputNumber min={0} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={4} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.bankSaving.label} {...cashFormItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.bankSaving.name, {
                      initialValue: 0,
                    })(
                      <span>{cashInBank}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card title="非现金" className={styles.card} type="inner" extra={extraUnCash}>
              <Form layout="horizontal" hideRequiredMark>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.unionPay.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.unionPay.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fUnipay'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.unionPayIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.unionPayIncome.name, {
                    })(
                      <span>{this.calcIncome('unionPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.unionPayServiceCharge.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.unionPayServiceCharge.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcServiceCharge('unionPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.unionPayIntoAccount.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.unionPayIntoAccount.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcIncome('unionPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.creditCard.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.creditCard.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fCredit'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.creditCardIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.creditCardIncome.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcIncome('creditCard')}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.creditCardServiceCharge.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.creditCardServiceCharge.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcServiceCharge('creditCard')}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.aliPay.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.aliPay.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fAlipay'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.aliPayIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.aliPayIncome.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcIncome('aliPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.aliPayServiceCharge.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.aliPayServiceCharge.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcServiceCharge('aliPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.weChatPay.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.weChatPay.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fWechat'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.weChatPayIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.weChatPayIncome.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcIncome('weChatPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.weChatPayServiceCharge.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.weChatPayServiceCharge.name, {
                      initialValue: 0,
                    })(
                      <span>{this.calcServiceCharge('weChatPay')}</span>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.eftopsIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.eftopsIncome.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fEftpos'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.transferIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.transferIncome.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fTransfer'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.latiPayIncome.label} {...formItemLayout}>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.latiPayIncome.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fZFBWC'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card title="账面收入" className={styles.card} type="inner" extra={extraTotalAccountIncome}>
              <Form layout="horizontal" hideRequiredMark>
                <Row gutter={16}>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.frontEndIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.frontEndIncome.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fFrontSale'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={6} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.backEndIncome.label} {...formItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.backEndIncome.name, {
                      initialValue: 0,
                      // initialValue: dailyClosingResult['fBackSale'] || 0,
                    })(
                      <InputNumber min={0} precision={2} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card title="出口记录" className={styles.card} type="inner" >
              <Form layout="horizontal" >
                <Row gutter={16}>
                  <Col lg={12} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.exportRecord.label} {...basicFormItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.exportRecord.name, {
                      initialValue: [],
                      // initialValue: typeof dailyClosingResult['fFreight'] === 'string' ? dailyClosingResult['fFreight'].split(',') : [],
                    })(
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        tokenSeparators={[',', ';', '，', '；']}
                      />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={12} md={12} sm={24}>
                    <Form.Item label={fieldLabelsAndNamesMapping.operator.label} {...basicFormItemLayout} >
                      {getFieldDecorator(fieldLabelsAndNamesMapping.operator.name, {
                      initialValue: '',
                      // initialValue: dailyClosingResult['sOperator'] || '',
                      rules: [{ required: true, message: '操作员是必须的' }],
                    })(
                      <Input />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card title="备注" className={styles.card} type="inner" >
              <Form layout="horizontal" hideRequiredMark>
                <Row gutter={16}>
                  <Col lg={24} md={24} sm={24}>
                    <Form.Item>
                      {getFieldDecorator(fieldLabelsAndNamesMapping.remark.name, {
                    })(
                      <TextArea style={{ width: '100%' }} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Card>
        </Spin>

        <FooterToolbar extra={footerExtra} style={{ width: this.state.wdith, paddingLeft: this.props.collapsed ? 100 : 280 }}>
          {getErrorInfo()}
          <Button
            type="primary"
            onClick={validate}
            loading={submitLoading}
          >
            提交
          </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    );
  }
}

// export default connect(state => ({
//   // collapsed: state.global.collapsed,
//   // submitting: state.form.advancedFormSubmitting,
//   dailyClosingResult: state.dailyClosing.dailyClosingResult,
// }))(Form.create()(CashStatistics));
