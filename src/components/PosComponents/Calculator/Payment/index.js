import React, { PureComponent } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import Cbutton from '../Cbutton';
import styles from './index.less';
import calculate from './logic/calculate';
import isNumber from '../isNumber';

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
    key: 'toggle',
    label: '-/+',
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
    key: 'plus20',
    label: '+20',
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
    key: 'plus50',
    label: '+50',
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


class PaymentCalculator extends PureComponent {
  constructor(props) {
    super(props);
    this.button = {};
  }
  componentDidMount() {
    const { button } = this;
    numPad.forEach((item) => {
      if (item.keyboard) {
        Mousetrap.bind(item.keyboard, () => {
          // this.clickHandler(item.key)
          button[item.key].querySelector('button').blur();
          button[item.key].querySelector('button').focus();
          button[item.key].querySelector('button').click();
        });
      }
    });
  }
  componentWillUnmount() {
    numPad.forEach((item) => {
      if (item.keyboard) {
        Mousetrap.unbind(item.keyboard);
      }
    });
  }
  clickHandler = (buttonName) => {
    calculate(this.props.commodity, this.props.dispatch, buttonName);
  }
  render() {
    return (
      <div className={styles.calcWrapper}>
        <div className={styles.numPad}>
          {
            numPad.map((item) => {
              if (isNumber(item.key)) {
                return (
                  <Cbutton
                    key={item.key}
                    name={item.key}
                    clickHandler={this.clickHandler}
                    ref={node => (this.button[item.key] = ReactDOM.findDOMNode(node))}
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
                    ref={node => (this.button[item.key] = ReactDOM.findDOMNode(node))}
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
}))(PaymentCalculator);
