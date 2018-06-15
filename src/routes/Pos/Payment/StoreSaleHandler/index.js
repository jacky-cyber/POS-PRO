import React, { PureComponent } from 'react';
import { Radio, Card, Col } from 'antd';
import ExpressHandler from '../ExpressHandler';
import ShippingHandler from '../ShippingHandler';
import LocalHandler from '../LocalHandler/';
import { SALE_TYPE } from '../../../../constant';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class SaleHandler extends PureComponent {
  generateSaleTypeContent = (saleType) => {
    switch (saleType) {
      case SALE_TYPE.EXPRESS: {
        return <ExpressHandler />;
      }
      case SALE_TYPE.SHIPPING: {
        return <ShippingHandler />;
      }
      default: {
        return <LocalHandler />;
      }
    }
  }
  submitOrderHandler = () => {

  }
  render() {
    const { saleType, dispatch } = this.props;
    const title = (
      <div>
        <span>
          门店销售类型
        </span>
        <RadioGroup
          value={saleType}
          onChange={e => dispatch({ type: 'commodity/clickChangeSaleTypeButton', payload: e.target.value })}
          style={{ marginLeft: 24 }}
        >
          <RadioButton value={SALE_TYPE.LOCAL}>本地</RadioButton>
          <RadioButton value={SALE_TYPE.EXPRESS}>邮寄</RadioButton>
          <RadioButton value={SALE_TYPE.SHIPPING}>代发</RadioButton>
        </RadioGroup>
      </div>
    );
    return (
      <div>
        <Card title={title} bordered={false} style={{ marginBottom: 24 }}>
          {
            this.generateSaleTypeContent(saleType)
          }
        </Card>
      </div>
    );
  }
}
