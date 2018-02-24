import React, { PureComponent } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import Cbutton from '../Cbutton';
import calculate from './logic/calculate';


class PaymentCalculator extends PureComponent {
  clickHandler = (buttonName) => {
    calculate(this.props.commodity, this.props.dispatch, buttonName);
  }
  render() {
    const { orders, activeTabKey } = this.props;
    const currentOrder = Array.isArray(orders) && orders.filter(item => (item.key === activeTabKey))[0] || {};
    return (
      <div className={styles.calcWrapper}>
        <div className={styles.numPad}>
          <Cbutton name="1" clickHandler={this.clickHandler} >1</Cbutton>
          <Cbutton name="2" clickHandler={this.clickHandler}>2</Cbutton>
          <Cbutton name="3" clickHandler={this.clickHandler}>3</Cbutton>
          <Cbutton name="+10" datatype="string" clickHandler={this.clickHandler} >+10</Cbutton>
          <Cbutton name="4" clickHandler={this.clickHandler}>4</Cbutton>
          <Cbutton name="5" clickHandler={this.clickHandler}>5</Cbutton>
          <Cbutton name="6" clickHandler={this.clickHandler}>6</Cbutton>
          <Cbutton name="+20" datatype="string" clickHandler={this.clickHandler} >+20</Cbutton>
          <Cbutton name="7" clickHandler={this.clickHandler}>7</Cbutton>
          <Cbutton name="8" clickHandler={this.clickHandler}>8</Cbutton>
          <Cbutton name="9" clickHandler={this.clickHandler}>9</Cbutton>
          <Cbutton name="+50" datatype="string" clickHandler={this.clickHandler} >+50</Cbutton>
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
}))(PaymentCalculator);
