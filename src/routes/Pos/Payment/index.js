import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Badge, Row, Col, Icon, Table, Radio, List, Card, Divider } from 'antd';
import styles from './index.less';
import Pay from './Pay';
import ExpressHandler from '../ExpressHandler';
import { POS_TAB_TYPE, POS_PHASE, CUSTOMER_TYPE } from '../../../constant';
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
  selectCustomerHandler = () => {
    const { order, activeTabKey } = this.props
    const { lastPhase } = order
    this.props.dispatch({type: 'commodity/changePosPhase', payload: {activeTabKey, lastPhase: POS_PHASE.PAY, targetPhase: POS_PHASE.CUSTOMER}});
  }
  render() {
    const { dispatch } = this.props;
    const { goodsPrice, expressCost, shippingCost, totalPrice, saleType, realMoney, changeMoney, type, ID, createTime, customer } = this.props.order;
    const { memberName, memberAddress, memberEmail, memberPhone, memberType, memberScore, memberCardNumber, memberID } = customer || {}
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
          <Card title="订单信息" style={{ marginBottom: 24 }} extra={<a onClick={this.selectCustomerHandler}>选择或新建客户</a>}>
            <DescriptionList size="small"  title="基本信息">
              <Description term="订单号">{ID}</Description>
              <Description term="订单类型">门店销售/本地</Description>
              <Description term="下单时间">{createTime}</Description>
            </DescriptionList>
            <Divider style={{ margin: '16px 0' }} />
            {/* <Card type="inner" title="多层级信息组"> */}
            <DescriptionList size="small" title="会员信息">
            {
              memberID ?
              <DescriptionList>
                <Description term="会员名">{memberName}</Description>
                <Description term="会员卡号">{memberCardNumber}</Description>
                <Description term="电子邮箱">{memberEmail}</Description>
                <Description term="电话">{memberPhone}</Description>
                <Description term="地址">{memberAddress}</Description>
                <Description term="会员类型">{CUSTOMER_TYPE.filter(item => item.value === memberType)[0].label}</Description>
                <Description term="会员积分">{typeof memberScore === 'number' ? memberScore.toString() : ''}</Description>
              </DescriptionList>
              :
                <Description>无会员信息</Description>
            }
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
