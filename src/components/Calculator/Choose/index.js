import React, { PureComponent } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import styles from './index.less';
import Cbutton from '../Cbutton';
import calculate from './logic/calculate';
import { POS_TAB_TYPE } from '../../../constant';
import isNumber from '../isNumber';

export const numPad = [
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
];

export const actionPad = [
  {
    key: 'customer',
    label: '客户',
    keyboard: 'v',
  },
  {
    key: 'payment',
    label: '付款',
    keyboard: 'enter',
  },
];


class ChooseCalculator extends PureComponent {
  constructor(props) {
    super(props);
    this.button = {};
  }
  componentDidMount() {
    console.log('didchoose')
    const { button } = this;
    // this.props.dispatch({ type: 'commodity/changeChooseCalculatorButton', payload: button });
    numPad.forEach((item) => {
      Mousetrap.bind(item.keyboard, () => {
        this.clickHandler(item.key)
        // button[item.key].querySelector('button').blur();
        // button[item.key].querySelector('button').focus();
        // button[item.key].querySelector('button').click();
      });
    });
    actionPad.forEach((item) => {
      Mousetrap.bind(item.keyboard, () => {
        this.clickHandler(item.key)
    //     button[item.key].querySelector('button').blur();
    //     button[item.key].querySelector('button').focus();
    //     button[item.key].querySelector('button').click();
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps)
    // const { button } = this
    // const currentKey = this.props.order.key;
    // const nextKey = nextProps.order.key;
    // if (Object.keys(button).length > 0 && currentKey !== nextKey) {
    //   numPad.forEach((item) => {
    //     Mousetrap.bind(item.keyboard, () => {
    //       button[item.key].querySelector('button').blur();
    //       button[item.key].querySelector('button').focus();
    //       button[item.key].querySelector('button').click();
    //     });
    //   });
    //   actionPad.forEach((item) => {
    //     Mousetrap.bind(item.keyboard, () => {
    //       button[item.key].querySelector('button').blur();
    //       button[item.key].querySelector('button').focus();
    //       button[item.key].querySelector('button').click();
    //     });
    //   });
    // }
  }
  componentWillUnmount() {
    console.log('unmountchoose')
    numPad.forEach((item) => {
      if (item.keyboard) {
        Mousetrap.unbind(item.keyboard);
      }
    });
    actionPad.forEach((item) => {
      if (item.keyboard) {
        Mousetrap.unbind(item.keyboard);
      }
    });
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
                  ref={(node) => {this.button[item.key] = ReactDOM.findDOMNode(node)}}
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
    const { order, activeTabKey } = this.props;
    const { selectedList = [], activeSelectedKey, type } = order;
    const selectedItem = selectedList.filter(item => item.Key === activeSelectedKey)[0] || {};
    const calculateType = selectedItem.CalculateType;
    return (
      <div className={styles.calcWrapper}>
        <div className={styles.actionPad}>
          {
            this.createActionPad(type)
          }
        </div>
        <div className={styles.numPad}>
          {
            numPad.map((item) => {
              if (isNumber(item.key)) {
                return (
                  <Cbutton
                    key={item.key}
                    name={item.key}
                    clickHandler={this.clickHandler}
                    ref={(node) => {
                       this.button[item.key] = ReactDOM.findDOMNode(node);
                       }}
                  >
                    {item.label}
                  </Cbutton>
);
              } else {
                return (
                  <Cbutton
                    key={item.key}
                    datatype="string"
                    name={item.key}
                    clickHandler={this.clickHandler}
                    className={calculateType === item.key ? styles.activeButton : null}
                    ref={(node) => { this.button[item.key] = ReactDOM.findDOMNode(node); }}
                    dataClicked={item.dataClicked}
                  >
                    {item.label}
                  </Cbutton>
);
              }
            })
          }
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  commodity: state.commodity,
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))(ChooseCalculator);
