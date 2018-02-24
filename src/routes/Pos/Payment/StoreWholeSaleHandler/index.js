import React, { PureComponent } from 'react';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd'
import { connect } from 'dva';
import FooterToolbar from '../../../../components/FooterToolbar';


@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))


@Form.create()

export default class StoreWholeSaleHandler extends PureComponent {
  submitHandler = () => {
    const { ID } = this.props.order
    const { selectedList, expressData, shippingData, ...restOrder } = this.props.order
    const address = {
      SenderName: "",
      SenderPhoneNumber: "",
      ReceiverName: "",
      ReceiverPhoneNumber: "",
      ReceiverIDNumber: "",
      ReceiverAddress: {
        Province: "",
        City: "",
        District: ""
      },
      ReceiverDetailedAddress: "",
    }
    const newValues = { ...restOrder, waybill: selectedList, ...address, }
    const valuesJson = JSON.stringify(newValues)
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    }
    console.log('valuesJson', valuesJson)
    this.props.dispatch({ type: 'commodity/submitOrder', payload })
  }
  render() {
    return (
    <div>
        <FooterToolbar style={{ width: '100%' }}>
          <Button type="primary" onClick={this.submitHandler} >
            提交
          </Button>
        </FooterToolbar>
      </div>
    )
  }
}
