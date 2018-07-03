import { connect } from 'dva';

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))

export default class Pos {
  generatePrint() {
    const { order = {} } = this.props;
    const print = {
      ID: order.ID,
      createTime: order.createTime,
      shop: order.shop,
      selectedList: order.selectedList,
      totalPrice: order.totalPrice,
      expressCost: order.expressCost,
      shippingCost: order.shippingCost,
      expressData: order.expressData,
      shippingData: order.shippingData,
      paymentData: order.paymentData,
      type: order.type,
      saleType: order.saleType,
    };
    return print;
  }
  static submitOrder() {
    const { order = {} } = this.props;
    const { ID } = order;
    const { selectedList, expressData, shippingData, ...restOrder } = order;
    // 构造奶粉订单必要的地址
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
    const print = this.generatePrint();
    const newValues = { ...restOrder, waybill: selectedList, ...address, print };
    const valuesJson = JSON.stringify(newValues);
    const payload = {
      orderID: ID,
      dataJson: valuesJson,
    };
    this.props.dispatch({ type: 'commodity/submitOrder', payload });
  }
}
