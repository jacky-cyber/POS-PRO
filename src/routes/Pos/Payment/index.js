import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Badge, Row, Col, Icon, Table, Radio, List, Card, Divider } from 'antd';
import styles from './index.less';
import Pay from './Pay';
import ExpressHandler from '../ExpressHandler';
import { POS_TAB_TYPE, POS_PHASE } from '../../../constant';
import Print from 'rc-print';
import MilkPowderHandler from './MilkPowderHandler/';
import StoreSaleHandler from './StoreSaleHandler';
import StoreWholeSaleHandler from './StoreWholeSaleHandler/'
import DescriptionList from '../../../components/DescriptionList';
// import WareHouse from './WareHouse';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList

@connect(state => ({
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
  activeTabKey: state.commodity.activeTabKey,
}))
export default class Payment extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isConfirmEnable: false,
    };
  }
  handlePrevClick = () => {
    // this.props.dispatch(routerRedux.goBack());
    const activeTabKey = this.props.activeTabKey
    const lastPhase = POS_PHASE.PAY
    const targetPhase = POS_PHASE.LIST
    this.props.dispatch({type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase, targetPhase }})
  }
  validate = (bool) => {
    this.setState({
      isConfirmEnable: bool,
    });
  }
  render() {
    const { dispatch } = this.props;
    const { goodsPrice, expressCost, shippingCost, totalPrice, saleType, realMoney, changeMoney, type, ID, createTime, } = this.props.order;
    const priceList = [
      { title: '商品金额', value: goodsPrice },
      { title: '直邮金额', value: expressCost },
      { title: '代发金额', value: shippingCost },
      { title: '应收金额', value: totalPrice },
      { title: '实收金额', value: realMoney },
      { title: '找零金额', value: changeMoney },
    ];


    const generateContent = (priceList) => {
      switch (type) {
        case POS_TAB_TYPE.STORESALE: {
          return <StoreSaleHandler saleType={saleType} dispatch={dispatch} priceList={priceList} />
        }
        case POS_TAB_TYPE.MILKPOWDER: {
          return <MilkPowderHandler />
        }
        case POS_TAB_TYPE.WHOLESALE: {
          return <StoreWholeSaleHandler />
        }
        default:
          return null
      }
    }
    return (
      <div className={styles.paymentLayout}>
        {/* <div>left</div> */}
        <div className={styles.paymentWrapper}>
          <Row
            type="flex"
            className={styles.header}
            justify="space-between"
            align="middle"
          >
            <Col>
              <Button onClick={this.handlePrevClick}>回退</Button>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Button
                onClick={this.confirmHandler}
                disabled={totalPrice === 0 || totalPrice !== realMoney - changeMoney}
              >确认
              </Button>
              <Button
                disabled={totalPrice === 0 || totalPrice !== realMoney - changeMoney}
                onClick={() => {
                  this.refs.printForm.onPrint();
                }}
              >
                打印
              </Button>
            </Col>
          </Row>
          <Card title="订单信息" style={{ marginBottom: 24 }} extra={<a>选择或新建客户</a>}>
            <DescriptionList size="small"  title="基本信息">
              <Description term="订单号">{ID}</Description>
              <Description term="订单类型">门店销售/本地</Description>
              <Description term="下单时间">{createTime}</Description>
            </DescriptionList>
            <Divider style={{ margin: '16px 0' }} />
            {/* <Card type="inner" title="多层级信息组"> */}
            <DescriptionList size="small" title="客户信息">
              <DescriptionList>
                <Description term="客户名">付小小</Description>
                <Description term="会员卡号">32943898021309809423</Description>
                <Description term="电子邮箱">ossica2018@163.com</Description>
                <Description term="电话">18112345678</Description>
                <Description term="地址">曲丽丽 18100000000 浙江省杭州市西湖区黄姑山路工专路交叉路口</Description>
              </DescriptionList>
            </DescriptionList>
            {/* </Card> */}

          </Card>
          {generateContent(priceList)}
          <Card title="支付" bordered={false} style={{marginBottom: 24 }}>
          <Pay
            totalPrice={goodsPrice}
            validate={this.validate}
          />
          </Card>
        </div>
      </div>
    );
  }
}
