import React, { PureComponent } from 'react';
import { Card, Form, Input, Row, Col, Cascader, Button, Icon, Popover } from 'antd'
import { connect } from 'dva';
import FooterToolbar from '../../../../components/FooterToolbar';
import styles from './index.less'



@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))


@Form.create()

export default class LocalHandler extends PureComponent {
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
    this.props.dispatch({ type: 'commodity/submitOrder', payload })
  }
  render() {
    // console.log(222)
    // const { form, order, dispatch } = this.props;
    // const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;
    // const { expressData } = order || []
    // const newExpressData = expressData.map(item => ({
    //   ...item, Name: item.Name.Name
    // }))
    // const errors = getFieldsError();
    // const getErrorInfo = () => {
    //   const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    //   if (!errors || errorCount === 0) {
    //     return null;
    //   }
    //   const scrollToField = (fieldKey) => {
    //     const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
    //     if (labelNode) {
    //       labelNode.scrollIntoView(true);
    //     }
    //   };
    //   const errorList = Object.keys(errors).map((key) => {
    //     if (!errors[key]) {
    //       return null;
    //     }
    //     return (
    //       <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
    //         <Icon type="cross-circle-o" className={styles.errorIcon} />
    //         <div className={styles.errorMessage}>{errors[key][0]}</div>
    //         <div className={styles.errorField}>{fieldLabels[key]}</div>
    //       </li>
    //     );
    //   });
    //   return (
    //     <span className={styles.errorIcon}>
    //       <Popover
    //         title="表单校验信息"
    //         content={errorList}
    //         overlayClassName={styles.errorPopover}
    //         trigger="click"
    //         getPopupContainer={trigger => trigger.parentNode}
    //       >
    //         <Icon type="exclamation-circle" />
    //       </Popover>
    //       {errorCount}
    //     </span>
    //   );
    // };

    const priceListNode = (
      <div></div>

    )

    return (
      <div>
        <FooterToolbar style={{ width: '100%' }}>
          {/* {getErrorInfo()} */}
          <Button type="primary" onClick={this.submitHandler} extra={priceListNode} >
            提交
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}

// export default connect(({ global, loading }) => ({
// }))(Form.create()(MilkPowderHandler));
