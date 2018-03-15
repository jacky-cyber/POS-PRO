import React, { PureComponent } from 'react'
import Print from 'rc-print';
import { Radio, Card, Button, Row, Col } from 'antd';
import ExpressHandler from '../ExpressHandler';
import ShippingHandler from '../ShippingHandler';
import LocalHandler from '../LocalHandler/';
import FooterToolbar from '../../../../components/FooterToolbar';
import { SALE_TYPE } from '../../../../constant';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class SaleHandler extends PureComponent {
  generateSaleTypeContent = (saleType, priceListNode) => {
    switch(saleType) {
      case SALE_TYPE.EXPRESS: {
        return <ExpressHandler priceListNode={priceListNode} />
      }
      case SALE_TYPE.SHIPPING: {
        return <ShippingHandler priceListNode={priceListNode} />
      }
      default: {
        return <LocalHandler priceListNode={priceListNode} />
      }
    }
  }
  submitOrderHandler = () => {

  }
  render() {
    const { saleType, dispatch, priceList } = this.props
    const priceListNode = (
      <div style={{width: '100%'}}>
        {
          priceList.map(item => (
            <Col span={6} key={item.title}> <span>{item.title}:</span> <span>{item.value}</span> </Col>
          ))
        }
      </div>
    )
    const title = (
      <div>
      <span>
        门店销售类型
      </span>
          <RadioGroup
            value={saleType}
            onChange={e => dispatch({ type: 'commodity/clickChangeSaleTypeButton', payload: e.target.value })}
            style={{marginLeft: 24}}
          >
            <RadioButton value={SALE_TYPE.LOCAL}>本地</RadioButton>
            <RadioButton value={SALE_TYPE.EXPRESS}>邮寄</RadioButton>
            <RadioButton value={SALE_TYPE.SHIPPING}>代发</RadioButton>
          </RadioGroup>
      </div>
    )
    return (
      <div>
        <Print
          ref="printForm"
          title="门店出口/邮寄/代发"
        >
          <div>
            <p className={styles.printHide}>first </p>
            <p className="green">second </p>
            <p className="pink">third </p>
          </div>
        </Print>
        <Card title={title} bordered={false} style={{marginBottom: 24}}>
        {
          this.generateSaleTypeContent(saleType, priceListNode)
        }
        </Card>
      </div>
    )
  }
}
