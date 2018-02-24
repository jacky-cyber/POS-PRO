import React, { PureComponent } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import Cbutton from '../Cbutton';
import calculate from './logic/calculate';
import { POS_TAB_TYPE } from '../../../constant';
// import key from 'keymaster';

import ReactDOM from 'react-dom';

class ChooseCalculator extends PureComponent {
  componentDidMount() {
    // const button = this.button.getElementsByTagName('button')[0]
    // this.props.dispatch({type: 'commodity/storageButtonDOM', payload: this.button})
    // key('backspace', () => {
    //   button.click()
    //    button.focus()
    //    setTimeout(() => button.blur(), 500)
    //    } );

  }
  clickHandler = (buttonName) => {
    calculate(this.props.commodity, this.props.dispatch, buttonName);
  }
  createActionPad = (orderType) => {
    switch (orderType) {
      case POS_TAB_TYPE.ALLOCATEANDTRANSFER:
        return (
          <div>
            <Cbutton name="warehouse" clickHandler={this.clickHandler}>仓库</Cbutton>
            <Cbutton name="allocateAndTransfer" clickHandler={this.clickHandler}>发起调拨</Cbutton>
          </div>
        );
      default:
        return (
          <div>
            <Cbutton name="customer" clickHandler={this.clickHandler}>客户</Cbutton>
            <Cbutton name="payment" clickHandler={this.clickHandler}>付款</Cbutton>
          </div>
        );
    }
  }
  render() {
    const { orders, activeTabKey } = this.props;
    const currentOrder = Array.isArray(orders) && orders.filter(item => (item.key === activeTabKey))[0] || {};
    const orderType = currentOrder.type;
    const { selectedList = [], activeSelectedKey } = currentOrder;
    const selectedItem = selectedList.filter(item => item.Key === activeSelectedKey)[0] || {};
    const calculateType = selectedItem.CalculateType;
    return (
      <div className={styles.calcWrapper}>
        <div className={styles.actionPad}>
          {
            this.createActionPad(orderType)
          }
        </div>
        <div className={styles.numPad}>
          <Cbutton name="1" clickHandler={this.clickHandler} ref={node => (this.button = ReactDOM.findDOMNode(node))} >1</Cbutton>
          <Cbutton name="2" clickHandler={this.clickHandler}>2</Cbutton>
          <Cbutton name="3" clickHandler={this.clickHandler}>3</Cbutton>
          <Cbutton name="count" datatype="string" clickHandler={this.clickHandler} className={calculateType === 'count' ? styles.activeButton : null}>数量</Cbutton>
          <Cbutton name="4" clickHandler={this.clickHandler}>4</Cbutton>
          <Cbutton name="5" clickHandler={this.clickHandler}>5</Cbutton>
          <Cbutton name="6" clickHandler={this.clickHandler}>6</Cbutton>
          <Cbutton name="discount" datatype="string" clickHandler={this.clickHandler} className={calculateType === 'discount' ? styles.activeButton : null}>折扣</Cbutton>
          <Cbutton name="7" clickHandler={this.clickHandler}>7</Cbutton>
          <Cbutton name="8" clickHandler={this.clickHandler}>8</Cbutton>
          <Cbutton name="9" clickHandler={this.clickHandler}>9</Cbutton>
          <Cbutton name="unitPrice" datatype="string" clickHandler={this.clickHandler} className={calculateType === 'unitPrice' ? styles.activeButton : null}>价格</Cbutton>
          <Cbutton name="clear" clickHandler={this.clickHandler}>c</Cbutton>
          <Cbutton name="0" clickHandler={this.clickHandler}>0</Cbutton>
          <Cbutton name="." clickHandler={this.clickHandler}>.</Cbutton>
          <Cbutton name="del" datatype="string" clickHandler={this.clickHandler}>del</Cbutton>
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  commodity: state.commodity,
  activeTabKey: state.commodity.activeTabKey,
  orders: state.commodity.orders,
}))(ChooseCalculator);
