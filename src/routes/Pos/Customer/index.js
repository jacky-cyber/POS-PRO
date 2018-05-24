import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Row, Col, Icon, Table, Input, Divider, Form, InputNumber, Card } from 'antd';
import classNames from 'classnames';
import { POS_PHASE, CUSTOMER_TYPE } from 'constant';
import Mousetrap from 'mousetrap';
import { SwitchableFormItem } from 'components/BaseComponents';
import { formatToPercentage } from 'utils/utils';
import styles from './index.less';
import TypeSelect from './TypeSelect';

const FormItem = Form.Item;

const cx = classNames.bind(styles);

const keyboardMapping = ['backspace', 'enter'];

const getCustomerTypeLabel = (value) => {
  const item = CUSTOMER_TYPE.filter(item => item.value === value)[0];
  if (item) {
    return item.label;
  } else {
    return '/';
  }
};

const fieldMapping = {
  ID: {
    key: 'ID',
    label: 'ID',
  },
  name: {
    key: 'Name',
    label: '客户名',
  },
  email: {
    key: 'Email',
    label: '电子邮箱',
  },
  address: {
    key: 'Address',
    label: '地址',
  },
  phone: {
    key: 'Phone',
    label: '电话',
  },
  cardNumber: {
    key: 'CardNumber',
    label: '会员卡号',
  },
  score: {
    key: 'Score',
    label: '积分',
  },
  type: {
    key: 'Type',
    label: '会员类型',
  },
  discount: {
    key: 'Discount',
    label: '会员折扣',
  },
};

const columns = [
  {
    title: '会员名称',
    dataIndex: 'Name',
  },
  {
    title: '会员类型',
    dataIndex: 'Type',
    render: text => (getCustomerTypeLabel(text)),
  },
  {
    title: '会员卡号',
    dataIndex: 'Number',
  },
  {
    title: '邮箱',
    dataIndex: 'Email',
  },
  {
    title: '地址',
    dataIndex: 'Address',
  },
  {
    title: '电话',
    dataIndex: 'Phone',
  },
  {
    title: '折扣',
    dataIndex: 'Discount',
  },
];

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};


@connect(({ commodity, loading }) => ({
  order: commodity.orders.filter(item => item.key === commodity.activeTabKey)[0],
  activeTabKey: commodity.activeTabKey,
  customerList: commodity.customerList,
  getLoading: loading.effects['commodity/getCustomer'],
  submitLoading: loading.effects['commodity/submitCustomer'],
  updateLoading: loading.effects['commodity/updateCustomer'],
}))
@Form.create()
export default class Customer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAddCustomerForm: false,
      showCustomerMessage: false,
      isEditing: false,
      activeIndex: null,
    };
  }
  componentDidMount() {
    Mousetrap.bind('backspace', () => this.prevHandler());
    Mousetrap.bind('enter', () => this.selectHandler());
    this.props.dispatch({ type: 'commodity/getCustomer' });
    this.showCustomerMessageHandler();
  }
  componentWillUnmount() {
    keyboardMapping.forEach((item) => {
      Mousetrap.unbind(item);
    });
  }
  showCustomerMessageHandler = () => {
    // 如果该单存在客户，则渲染出客户信息
    const { order } = this.props;
    const { customer } = order;
    const { memberID } = customer;
    const tempCustomer = {};
    Object.keys(customer).forEach((item) => {
      Object.assign(tempCustomer, { [item.replace('member', '')]: customer[item] });
    });
    if (memberID) {
      this.setState({
        showCustomerMessage: true,
        showAddCustomerForm: false,
        isEditing: false,
        activeIndex: memberID,
      });
      this.props.form.setFieldsValue(tempCustomer);
    } else {
      this.setState({
        showCustomerMessage: false,
        showAddCustomerForm: false,
        isEditing: false,
        activeIndex: null,
      });
    }
  }
  showCustomerMessageAfterSubmit = (value, ID) => {
    const newValue = { ...value, ID };
    this.setState({
      showCustomerMessage: true,
      showAddCustomerForm: false,
      isEditing: false,
      activeIndex: ID,
    });
    this.props.form.setFieldsValue(newValue);
  }
  prevHandler = () => {
    const { order, activeTabKey } = this.props;
    const { lastPhase } = order;
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: POS_PHASE.CUSTOMER, targetPhase: lastPhase } });
  }
  selectHandler = () => {
    const tempCustomer = this.props.form.getFieldsValue();
    const { order, activeTabKey } = this.props;
    const { lastPhase } = order;
    const customer = {
      memberID: tempCustomer.ID || '',
      memberName: tempCustomer.Name || '',
      memberAddress: tempCustomer.Address || '',
      memberEmail: tempCustomer.Email || '',
      memberPhone: tempCustomer.Phone || '',
      memberType: tempCustomer.Type || '',
      memberScore: tempCustomer.Score || '',
      memberCardNumber: tempCustomer.CardNumber || '',
      memberDiscount: tempCustomer.Discount || '',
    };
    this.props.dispatch({ type: 'commodity/changeCustomer', payload: customer });
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: POS_PHASE.CUSTOMER, targetPhase: lastPhase } });
  }
  cancelHandler = () => {
    this.props.form.resetFields();
    this.setState({
      activeIndex: null,
      showCustomerMessage: false,
      showAddCustomerForm: false,
    });
  }
  submitHandler = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'commodity/submitCustomer',
          payload: { values, callback: this.showCustomerMessageAfterSubmit },
        });
      }
    });
  }
  updateHandler = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const tempCustomer = this.props.form.getFieldsValue();
        const { ID } = tempCustomer;
        const newValues = { ...values, ID };
        this.props.dispatch({
          type: 'commodity/updateCustomer',
          payload: newValues,
        })
          .then(() => {
            this.setState({
              showCustomerMessage: true,
              showAddCustomerForm: false,
              isEditing: false,
            }, () => {
              this.props.form.setFieldsValue(newValues);
            });
          });
      }
    });
  }
  showAddCustomerFormHandler = () => {
    this.setState({
      showAddCustomerForm: true,
      showCustomerMessage: false,
      isEditing: true,
      activeIndex: null,
    }, () => {
      this.props.form.resetFields();
    });
  }
  quitEdit = () => {
    this.setState({
      isEditing: false,
    });
  }
  rowClickHandler = (record) => {
    return {
      onClick: () => {
        if (record) {
          const { ID } = record;
          this.setState({
            showCustomerMessage: true,
            showAddCustomerForm: false,
            isEditing: false,
            activeIndex: ID,
          }, () => {
            this.props.form.setFieldsValue(record);
          });
        }
      },
    };
  }
  deleteCustomerHandler = () => {
    const tempCustomer = this.props.form.getFieldsValue();
    const { ID } = tempCustomer;
    const { order } = this.props;
    const { customer } = order;
    const { memberID } = customer;
    if (ID) {
      this.props.dispatch({ type: 'commodity/deleteCustomer', payload: ID });
      if (ID === memberID) {
        this.props.dispatch({ type: 'commodity/changeCustomer', payload: {} });
      }
      this.showCustomerMessageHandler();
    }
  }
  searchHandler = (value) => {
    this.props.dispatch({ type: 'commodity/getCustomer', payload: value });
  }
  toEditHandler = () => {
    this.setState({
      isEditing: true,
    });
  }
  render() {
    const { form, getLoading, submitLoading, customerList, order } = this.props;
    const { getFieldDecorator } = form;
    const {
      showAddCustomerForm,
      showCustomerMessage,
      isEditing,
      activeIndex,
    } = this.state;
    const nameRow = cx({
      [styles.nameRow]: showCustomerMessage && !isEditing,
    });
    const tempCustomer = this.props.form.getFieldsValue();
    const { ID } = tempCustomer;
    const customerForm = (
      <Card>
        <Form
          onSubmit={this.submitHandler}
          className={styles.addCustomerForm}
          hideRequiredMark={showCustomerMessage}
        >
          <Row gutter={16} className={nameRow}>
            <Col lg={8} sm={24} >
              <FormItem
                label={fieldMapping.name.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.name.key, {
                  rules: [{ required: true, message: '请输入客户名' }],
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
            </Col>
            <Col style={{ display: 'none' }}>
              <FormItem>
                {getFieldDecorator(fieldMapping.ID.key, {
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator(fieldMapping.cardNumber.key, {
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator(fieldMapping.score.key, {
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
            </Col>
            {
              showAddCustomerForm && (
                <Col lg={16} sm={24} pull={1} className={styles.submitFormItem}>
                  <FormItem>
                    <Button
                      shape="circle"
                      onClick={this.showCustomerMessageHandler}
                    >
                      <Icon type="minus-circle" />
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      htmlType="submit"
                      shape="circle"
                      loading={submitLoading}
                    >
                      <Icon type="save" />
                    </Button>
                  </FormItem>
                </Col>
              )
            }
            {
              showCustomerMessage && (
                <Col lg={16} sm={24} pull={1} className={styles.submitFormItem}>
                  {
                    isEditing ? (
                      <FormItem>
                        <Button
                          shape="circle"
                          onClick={this.quitEdit}
                        >
                          <Icon type="minus-circle" />
                        </Button>
                        <Divider type="vertical" />
                        <Button
                          shape="circle"
                          onClick={this.updateHandler}
                        >
                          <Icon type="save" />
                        </Button>
                      </FormItem>
                    )
                    :
                    (
                      <FormItem>
                        <Button
                          shape="circle"
                          onClick={this.toEditHandler}
                        >
                          <Icon type="edit" />
                        </Button>
                        <Divider type="vertical" />
                        <Button
                          shape="circle"
                          loading={submitLoading}
                          onClick={this.deleteCustomerHandler}
                        >
                          <Icon type="delete" />
                        </Button>
                      </FormItem>
                    )
                  }
                </Col>
              )
            }
          </Row>
          <Row gutter={16}>
            <Col lg={8} sm={24} >
              <FormItem
                label={fieldMapping.address.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.address.key, {
                  rules: [{ required: true, message: '请输入地址' }],
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={8} sm={24}>
              <FormItem
                label={fieldMapping.phone.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.phone.key, {
                  rules: [{ required: true, message: '请输入电话' }],
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={8} sm={24} >
              <FormItem
                label={fieldMapping.type.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.type.key, {
                  rules: [{ required: true, message: '请选择会员类型' }],
                })(
                  <SwitchableFormItem
                    formItemElement={TypeSelect}
                    isEditing={isEditing}
                    format={getCustomerTypeLabel}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={8} sm={24}>
              <FormItem
                label={fieldMapping.email.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.email.key, {
                })(
                  <SwitchableFormItem
                    formItemElement={Input}
                    isEditing={isEditing}
                  />
                )}
              </FormItem>
            </Col>
            <Col lg={8} sm={24}>
              <FormItem
                label={fieldMapping.discount.label}
                {...formItemLayout}
              >
                {getFieldDecorator(fieldMapping.discount.key, {
                  initialValue: 1,
              })(
                <SwitchableFormItem
                  formItemElement={InputNumber}
                  isEditing={isEditing}
                  format={formatToPercentage}
                  formItemElementProps={{
                    min: 0,
                    max: 1,
                    step: 0.05,
                    precision: 2,
                    formatter: value => `${value * 100}%`,
                    parser: value => ((parseFloat(value.replace('%', '')) || 0) / 100),
                  }}
                />
              )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    );
    return (
      <div className={styles.customerWrapper}>
        <Row
          type="flex"
          className={styles.header}
          justify="space-between"
          align="middle"
        >
          <Col>
            <Button onClick={this.prevHandler}>回退</Button>
          </Col>
          <Col style={{ textAlign: 'center' }}>
            <Input.Search
              placeholder="搜索客户"
              onSearch={this.searchHandler}
              style={{ width: 260 }}
            />
            <Divider type="vertical" />
            <Button
              className={styles.addCustomer}
              onClick={this.showAddCustomerFormHandler}
            >
              <Icon type="user" />
              <Icon type="plus" />
            </Button>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            {
              ID && (
                <Button
                  onClick={this.cancelHandler}
                >
                  取消选择
                </Button>
              )}
            <Divider type="vertical" />
            <Button
              onClick={this.selectHandler}
              type={`${ID ? 'primary' : ''}`}
            >
              确认
            </Button>
          </Col>
        </Row>
        <div className={styles.displayArea}>
          {(showCustomerMessage || showAddCustomerForm) && customerForm}
        </div>
        <div className={styles.customerTable}>
          <Table
            bordered
            columns={columns}
            rowKey={record => record.ID}
            loading={getLoading}
            dataSource={customerList}
            size="small"
            onRow={this.rowClickHandler}
            rowClassName={(record) => {
              if (record.ID === activeIndex) {
                return styles.activeRow;
              }
            }}
          />
        </div>
      </div>
    );
  }
}
