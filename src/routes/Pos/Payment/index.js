import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Badge, Row, Col, Icon, Table, Radio, List, Card, Divider, Layout } from 'antd';
import styles from './index.less';
import Pay from './Pay';
import ExpressHandler from '../ExpressHandler';
import { POS_TAB_TYPE, POS_PHASE, CUSTOMER_TYPE } from '../../../constant';
import Print from 'rc-print';
import MilkPowderHandler from './MilkPowderHandler/';
import StoreSaleHandler from './StoreSaleHandler';
import StoreWholeSaleHandler from './StoreWholeSaleHandler/'
import DescriptionList from '../../../components/DescriptionList';
import SelectedGoods from '../../../components/List/SelectedGoods/';
// import WareHouse from './WareHouse';

const { Header, Sider, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList
const saleTypeLabelMapping = {
  1: '本地',
  2: '邮寄',
  3: '代发',
}

const typeLabelMapping = {
  1: '门店销售',
  2: '奶粉/生鲜',
  3: '批发',
}

const dataSource = [{
  key: '1',
  name: '胡彦斌',
  age: 32,
  address: '西湖区湖底公园1号'
}, {
  key: '2',
  name: '胡彦祖',
  age: 42,
  address: '西湖区湖底公园1号'
}];

const columns = [{
  title: '姓名',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '年龄',
  dataIndex: 'age',
  key: 'age',
}, {
  title: '住址',
  dataIndex: 'address',
  key: 'address',
}];

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
  componentDidMount() {
    Mousetrap.bind('v', () => {this.selectCustomerHandler()})
  }
  componentWillUnmount() {
    Mousetrap.unbind('v')
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
    const { goodsPrice, expressCost, shippingCost, totalPrice, saleType, receiveMoney, changeMoney, type, ID, createTime, customer } = this.props.order;
    const { memberName, memberAddress, memberEmail, memberPhone, memberType, memberScore, memberCardNumber, memberID } = customer || {}
    const priceList = [
      { title: '商品金额', value: goodsPrice },
      { title: '快递金额', value: expressCost || shippingCost },
      // { title: '直邮金额', value: expressCost },
      // { title: '代发金额', value: shippingCost },
      { title: '应收金额', value: totalPrice },
      { title: '实收金额', value: receiveMoney },
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
      <Layout>
        {/* <Sider
          width={440}
          className={styles.sider}
        >
          <Content
            className={styles.leftContent}
          >
            <SelectedGoods />
          </Content>
          <div
            className={styles.calculator}
          >
          </div>
        </Sider> */}
        <Sider
          width={440}
          className={styles.sider}
        >
          <Content
            className={styles.leftContent}
          >
            <SelectedGoods />
          </Content>
          <div
            className={styles.priceList}
          >
          <List
          dataSource={priceList}
          renderItem={item => (<List.Item className={styles.item}>{item.title}： {item.value}</List.Item>)}
           />
          </div>
        </Sider>
        <Content>
      <div className={styles.paymentLayout}>
        <Print
          ref="printForm"
          title="门店出口/邮寄/代发"
        >
        <div style={{display: 'none'}}>
            <div style={{ color: 'red', width: '80mm', border: '1px solid red' }}>
              <Table dataSource={dataSource} columns={columns} />
              <div className={styles.printHide}>111</div>
            </div>
        </div>
        </Print>
        <div className={styles.paymentWrapper}>
          {/* <Row
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
                // disabled={totalPrice === 0 || totalPrice !== realMoney - changeMoney}
                onClick={() => {
                  this.refs.printForm.onPrint();
                }}
              >
                打印
              </Button>
            </Col>
          </Row> */}
          <Card title="订单信息" style={{ marginBottom: 24 }} extra={<a onClick={this.selectCustomerHandler}>选择或新建客户</a>}>
            <DescriptionList size="small"  title="基本信息">
              <Description term="订单号">{ID}</Description>
              <Description term="订单类型">
              {typeLabelMapping[type]}{saleType ? `/${saleTypeLabelMapping[saleType]}` : null}
              </Description>
              <Description term="下单时间">{createTime}</Description>
            </DescriptionList>
            <Divider style={{ margin: '16px 0' }} />
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

        </Content>
      </Layout>
    );
  }
}
