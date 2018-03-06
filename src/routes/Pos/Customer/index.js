import React, { PureComponent } from 'react';
import { connect } from 'dva'
import { Tabs, Button, Badge, Row, Col, Icon, Table, Input, Divider, Form, Select, Modal } from 'antd'
import styles from './index.less'
import MessageItem from './MessageItem.js'
import { routerRedux } from 'dva/router';
import SwitchableFormItem from '../../../components/SwitchableItem/SwitchableFormItem';
import classNames from 'classnames'
import TypeSelect from './TypeSelect'
import { POS_PHASE } from '../../../constant'

const { TabPane } = Tabs
const FormItem = Form.Item;
const { Option } = Select

const cx = classNames.bind(styles)

const fieldLabels = {
  name: '客户名',
  email: '电子邮箱',
  address: '地址',
  phone: '电话',
  number: '会员卡号',
  type: '会员类型',
};

const columns = [
  {
    title: '会员名称',
    dataIndex: 'Name',
  },
  {
    title: '会员类型',
    dataIndex: 'Type',
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
    dataIndex: 'PhoneNumber',
  }
]

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
  loading: state.commodity.commonLoading,
  customerList: state.commodity.customerList,
}))
@Form.create()
export default class Customer extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showAddCustomerForm: false,
      showCustomerMessage: false,
      tempRowData: {},
      isEdit: false,
      activeIndex: null,
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: 'commodity/getCustomer' })
  }
  handlePrevClick = () => {
    const { order, activeTabKey } = this.props
    const { lastPhase } = order
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: POS_PHASE.CUSTOMER, targetPhase: lastPhase } });
  }
  selectHandler = () => {
    const { order, activeTabKey } = this.props
    const { lastPhase } = order
    const { tempRowData } = this.state
    if (this.state.tempRowData.ID) {
      const customer = {
        memberID: tempRowData.ID,
        memberName: tempRowData.Name,
        memberAddress: tempRowData.Address,
        memberEmail: tempRowData.Email,
        memberPhone: tempRowData.Phone,
        memberType: tempRowData.Type,
        memberScore: tempRowData.Score,
        memberCardNumber: tempRowData.CardNumber
      }
      this.props.dispatch({ type: 'commodity/changeCustomer', payload: customer })
    } else {
      this.props.dispatch({ type: 'commodity/changeCustomer', payload: {} })
    }
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: POS_PHASE.CUSTOMER, targetPhase: lastPhase } });
  }
  cancelHandler = () => {
    this.setState({
      activeIndex: null,
      tempRowData: {},
      showCustomerMessage: false,
      showAddCustomerForm: false,
    })
  }
  validate = (bool) => {
    this.setState({
      isConfirmEnable: bool,
    })
  }
  handleFormSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // console.log(values)
      }
    });
  }
  submitHandler = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({ type: 'commodity/submitCustomer', payload: values })
        this.setState({
          showCustomerMessage: false,
          showAddCustomerForm: false,
          isEdit: false,
        })
      }
    });
  }
  updateHandler = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newValues = { ...values, ID: this.state.tempRowData.ID }
        this.props.dispatch({ type: 'commodity/updateCustomer', payload: newValues })
        this.setState({
          isEdit: false,
        })
      }
    });
  }
  showAddCustomerFormHandler = () => {
    this.setState({
      showAddCustomerForm: true,
      showCustomerMessage: false,
      isEdit: true,
      tempRowData: {},
      activeIndex: null,
    })
  }
  hideAddCustomerForm = () => {
    this.setState({
      showAddCustomerForm: false,
      showCustomerMessage: false,
      isEdit: false,
      activeIndex: null,
    })
    this.props.form.resetFields()
  }
  hideCustomerForm = () => {
    this.setState({
      showAddCustomerForm: false,
      showCustomerMessage: true,
      isEdit: false,
      // activeIndex: null,
    })
    this.props.form.resetFields()
  }
  rowClickHandler = (record, index) => {
    return {
      onClick: () => {
        if (record) {
          this.setState({
            tempRowData: record,
            showCustomerMessage: true,
            showAddCustomerForm: false,
            isEdit: false,
            activeIndex: index,
          })
        }
      },
    };
  }
  deleteCustomerHandler = () => {
    const { ID } = this.state.tempRowData
    if (ID) {
      this.props.dispatch({ type: 'commodity/deleteCustomer', payload: ID })
    }
    this.setState({
      isEdit: false,
      showCustomerMessage: false,
      activeIndex: null,
      tempRowData: {},
    })
  }
  searchHandler = (value) => {
    this.props.dispatch({ type: 'commodity/getCustomer', payload: value })
  }
  toEditHandler = () => {
    this.setState({
      isEdit: true,
    })
  }
  render() {
    const { dispatch, form, loading, customerList } = this.props
    const { totalPrice } = this.props.order
    const { getFieldDecorator, resetFields, } = form
    const { showAddCustomerForm, showCustomerMessage, tempRowData, isEdit, activeIndex, } = this.state
    const nameRow = cx({
      [styles.nameRow]: showCustomerMessage && !isEdit,
    })
    const customerForm = (
      <Form
        onSubmit={this.submitHandler}
        className={styles.addCustomerForm}
        hideRequiredMark={showCustomerMessage}
      >
        <Row gutter={16} className={nameRow}>
          <Col lg={12} sm={24} >
            <FormItem label={fieldLabels.name} {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入客户名' }],
                initialValue: tempRowData['Name'],
              })(
                <SwitchableFormItem FormItemElement={Input} editable={isEdit} />
              )}
            </FormItem>
          </Col>
          {
            showAddCustomerForm && (
              <Col lg={12} sm={24} pull={1} className={styles.submitFormItem}>
                <FormItem>
                  <Button shape="circle" onClick={() => this.hideAddCustomerForm()}>
                    <Icon type="minus-circle" />
                  </Button>
                  <Divider type="vertical" />
                  <Button htmlType="submit" shape="circle" loading={loading} >
                    <Icon type="save" />
                  </Button>
                </FormItem>
              </Col>
            )
          }
          {
            showCustomerMessage && (
              <Col lg={12} sm={24} pull={1} className={styles.submitFormItem}>
                {
                  isEdit ? (
                    <FormItem>
                      <Button shape="circle" onClick={() => this.hideCustomerForm()}>
                        <Icon type="minus-circle" />
                      </Button>
                      <Divider type="vertical" />
                      <Button shape="circle" onClick={() => this.updateHandler()}>
                        <Icon type="save" />
                      </Button>
                    </FormItem>
                  )
                    :
                    (
                      <FormItem>
                        <Button shape="circle" onClick={() => this.toEditHandler()}>
                          <Icon type="edit" />
                        </Button>
                        <Divider type="vertical" />
                        <Button shape="circle" loading={loading} onClick={() => this.deleteCustomerHandler()} >
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
          <Col lg={12} sm={24} >
            <FormItem label={fieldLabels.address} {...formItemLayout}>
              {getFieldDecorator('address', {
                rules: [{ required: true, message: '请输入地址' }],
                initialValue: tempRowData['Address'],
              })(
                <SwitchableFormItem FormItemElement={Input} editable={isEdit} />
              )}
            </FormItem>
          </Col>
          <Col lg={12} sm={24}>
            <FormItem label={fieldLabels.phone} {...formItemLayout}>
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: '请输入电话' }],
                initialValue: tempRowData['Phone'],
              })(
                <SwitchableFormItem FormItemElement={Input} editable={isEdit} />
              )}
            </FormItem>
          </Col>
          <Col lg={12} sm={24} >
            <FormItem label={fieldLabels.type} {...formItemLayout}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择会员类型' }],
                initialValue: tempRowData['Type'],
              })(
                <SwitchableFormItem FormItemElement={TypeSelect} editable={isEdit} />
              )}
            </FormItem>
          </Col>
          <Col lg={12} sm={24}>
            <FormItem label={fieldLabels.email} {...formItemLayout}>
              {getFieldDecorator('email', {
                initialValue: tempRowData['Email'],
              })(
                <SwitchableFormItem FormItemElement={Input} editable={isEdit} />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
    return (
      <div className={styles.customerWrapper}>
        <Row
          type="flex"
          className={styles.header}
          justify="space-between"
          align="middle"
        >
          <Col>
            <Button onClick={this.handlePrevClick}>回退</Button>
          </Col>
          <Col style={{ textAlign: 'center' }}>
            <Input.Search
              placeholder="搜索客户"
              onSearch={this.searchHandler}
              style={{ width: 260 }}
            />
            <Divider type="vertical" />
            <Button className={styles.addCustomer} onClick={this.showAddCustomerFormHandler}>
              <Icon type="user" onClick={() => this.showAddCustomerFormHandler()} />
              <Icon type="plus" />
            </Button>
          </Col>
          <Col style={{ textAlign: 'right' }}>
          {
            activeIndex !== null &&
          <Button onClick={this.cancelHandler}>取消选择</Button>
          }
          <Divider type="vertical" />
            <Button
             onClick={this.selectHandler}
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
            loading={loading}
            dataSource={customerList}
            size="small"
            onRow={this.rowClickHandler}
            rowClassName={(record, index) => {
              if (index === activeIndex) {
                return styles.activeRow
              }
            }}
          />
        </div>
      </div>
    )
  }
}
// export default connect(state => ({
//   order: state.commodity.orders.filter(item => item.key === state.commodity.activeKey)[0],
//   activeTabKey: state.commodity.activeKey
// }))(Customer)
