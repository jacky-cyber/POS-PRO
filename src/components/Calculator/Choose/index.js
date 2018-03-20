import React, { PureComponent } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import Cbutton from '../Cbutton';
import calculate from './logic/calculate';
import { POS_TAB_TYPE } from '../../../constant';
import Mousetrap from 'mousetrap';
import isNumber from '../isNumber';

import ReactDOM from 'react-dom';

const numPad = [
  {
    key: '1',
    label: '1',
    keyboard: '1',
  },
  {
    key: '2',
    label: '2',
    keyboard: '2',
  },
  {
    key: '3',
    label: '3',
    keyboard: '3',
  },
  {
    key: 'count',
    label: '数量',
    keyboard: 'q',
  },
  {
    key: '4',
    label: '4',
    keyboard: '4',
  },
  {
    key: '5',
    label: '5',
    keyboard: '5',
  },
  {
    key: '6',
    label: '6',
    keyboard: '6',
  },
  {
    key: 'discount',
    label: '折扣',
    keyboard: 'd',
  },
  {
    key: '7',
    label: '7',
    keyboard: '7',
  },
  {
    key: '8',
    label: '8',
    keyboard: '8',
  },
  {
    key: '9',
    label: '9',
    keyboard: '9',
  },
  {
    key: 'unitPrice',
    label: '价格',
    keyboard: 'p',
  },
  {
    key: 'clear',
    label: '清除',
    keyboard: 'c',
  },
  {
    key: '0',
    label: '0',
    keyboard: '0',
  },
  {
    key: '.',
    label: '.',
    keyboard: '.',
  },
  {
    key: 'del',
    label: 'del',
    keyboard: 'del',
  },
]

const actionPad = [
  {
    key: 'customer',
    label: '客户',
    keyboard: 'v',
  },
  {
    key: 'payment',
    label: '付款',
    keyboard: 'enter',
  }
]


class ChooseCalculator extends PureComponent {
  button = []
  componentDidMount() {
    numPad.forEach(item => {
      Mousetrap.bind(item.keyboard, () => {
        this.button[item.key].querySelector('button').blur()
        this.button[item.key].querySelector('button').focus()
        this.button[item.key].querySelector('button').click()
      })
    })
    actionPad.forEach(item => {
      Mousetrap.bind(item.keyboard, () => {
        this.button[item.key].querySelector('button').blur()
        this.button[item.key].querySelector('button').focus()
        this.button[item.key].querySelector('button').click()
      })
    })
    //   Mousetrap.bind('4', () => {
    //     this.button4.querySelector('button').blur()
    //   this.button4.querySelector('button').focus()
    //   this.button4.querySelector('button').click()
    //  }
    // )
    //   Mousetrap.bind('backspace', () => calculate(this.props.commodity, this.props.dispatch, 'del'))
    //   Mousetrap.bind('d', () => calculate(this.props.commodity, this.props.dispatch, 'discount'))
  }
  componentWillUnmount() {
    numPad.forEach(item => {
      Mousetrap.unbind(item.keyboard)
    })
    actionPad.forEach(item => {
      Mousetrap.unbind(item.keyboard)
    })
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
            {
              actionPad.map(item => (
                <Cbutton
                  key={item.key}
                  name={item.key}
                  clickHandler={this.clickHandler}
                  ref={node => (this.button[item.key] = ReactDOM.findDOMNode(node))}
                >
                  {item.label}
                   </Cbutton>
              ))
            }
            {/* <Cbutton name="customer" clickHandler={this.clickHandler}>客户</Cbutton>
            <Cbutton name="payment" clickHandler={this.clickHandler}>付款</Cbutton> */}
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
          {
            numPad.map(item => {
              if (isNumber(item.key)) {
                return <Cbutton
                  key={item.key}
                  name={item.key}
                  clickHandler={this.clickHandler}
                  ref={node => (this.button[item.key] = ReactDOM.findDOMNode(node))}
                >
                  {item.label}
                </Cbutton>
              } else {
                return <Cbutton
                  key={item.key}
                  datatype="string"
                  name={item.key}
                  clickHandler={this.clickHandler}
                  className={calculateType === item.key ? styles.activeButton : null}
                  ref={node => (this.button[item.key] = ReactDOM.findDOMNode(node))}
                >
                  {item.label}
                </Cbutton>
              }
            })
          }
          {/* <Cbutton name="1" clickHandler={this.clickHandler} ref={node => (this.button = ReactDOM.findDOMNode(node))} >1</Cbutton>
          <Cbutton name="2" clickHandler={this.clickHandler}>2</Cbutton>
          <Cbutton name="3" clickHandler={this.clickHandler}>3</Cbutton>
          <Cbutton name="count" datatype="string" clickHandler={this.clickHandler} className={calculateType === 'count' ? styles.activeButton : null}>数量</Cbutton>
          <Cbutton name="4" clickHandler={this.clickHandler} ref={node => (this.button4 = ReactDOM.findDOMNode(node))}>4</Cbutton>
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
          <Cbutton name="del" datatype="string" clickHandler={this.clickHandler}>del</Cbutton> */}
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
