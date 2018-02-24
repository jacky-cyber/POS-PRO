import React, { PureComponent } from 'react';
import { Card, Button, Layout, Icon } from 'antd'
import CardItem from '../../components/List/Goods/cardItem'
import { connect } from 'dva'
import styles from './Choose.less'
import ChooseCalculator from '../../components/Calculator/Choose/'
import SelectedGoods from '../../components/List/SelectedGoods/'
import HeaderSearch from '../../components/HeaderSearch';
import GoodsList from './GoodsList'
import GoodsTable from './GoodsTable'
import Payment from './Payment'
import classNames from 'classnames'
import { Link, Route, Redirect, Switch } from 'dva/router';
import NotFound from '../Exception/404';
import { routerRedux } from 'dva/router';


const { Header, Sider, Content } = Layout;
let cx = classNames.bind(styles)

@connect(state => ({commodity: state.commodity}))

export default class CommodityList extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            display: false,
        }
    }
    toggleCollapse = () => {
        this.setState({
            display: !this.state.display,
        })
    }
    render() {
        const { commodity, dispatch } = this.props
        const view = this.props.location && this.props.location.pathname.replace('/pos/', '')
        const currentOrder = commodity.orders.filter(item => (item.key === commodity.activeKey))[0]
        const { content, display } = currentOrder
        let displayTable = cx({
            [styles.trigger]: true,
            [styles.activeTrigger]: view === 'table'
        })
        let displayCardList = cx({
            [styles.trigger]: true,
            [styles.activeTrigger]: view === 'list'
        })
        return (
            <Layout>
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
                        className={styles.calculator}
                    >
                        <ChooseCalculator />
                    </div>
                </Sider>
                <Content className={styles.rightContent}>
                    <div className={styles.header}>
                        <Icon
                            className={styles.trigger}
                            type="home"
                        />
                        <Icon
                            className={displayCardList}
                            type="table"
                            onClick={() => {dispatch(routerRedux.push('/pos/list'))}}
                        />
                        <Icon
                            className={displayTable}
                            type="profile"
                            onClick={() => {dispatch(routerRedux.push('/pos/table'))}}
                        />
                        <a style={{ marginLeft: 8 }} onClick={this.toggleCollapse}>
                            配置表格 <Icon type="down" />
                        </a>
                        <div className={styles.right}>
                            <HeaderSearch
                                className={`${styles.action} ${styles.search}`}
                                placeholder="商品搜索"
                                dataSource={['搜索提示一', '搜索提示二', '搜索提示三']}
                                onSearch={(value) => {
                                    console.log('input', value); // eslint-disable-line
                                }}
                                onPressEnter={(value) => {
                                    console.log('enter', value); // eslint-disable-line
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.tabHeader}></div>
                    <div className={styles.commodityListWrapper}>

                        {

                        // <Switch>
                        //     <Route path="/pos/list" render={() => <GoodsList content={content} dispatch={dispatch} />}  />
                        //     <Route path="/pos/table" render={() => <GoodsTable content={content} dispatch={dispatch} />}  />
                        // </Switch>
                        }
                    </div>
                </Content>
            </Layout>
        )
    }
}
