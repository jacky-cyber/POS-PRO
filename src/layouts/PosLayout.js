import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Avatar, Dropdown, Tag, message, Spin, Tabs, Button, Badge } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Link } from 'dva/router';
import groupBy from 'lodash/groupBy';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import Debounce from 'lodash-decorators/debounce';
import NoticeIcon from '../components/NoticeIcon';
import NotFound from '../routes/Exception/404';
import styles from './PosLayout.less';
import ChooseCalculator from '../components/Calculator/Choose/';
import SelectedGoods from '../components/List/SelectedGoods/';
import { POS_TAB_TYPE, POS_PHASE, } from '../constant';
import { routerRedux } from 'dva/router';
import GoodsList from '../routes/Pos/GoodsList';
import GoodsTable from '../routes/Pos/GoodsTable';
import Payment from '../routes/Pos/Payment';
import Customer from '../routes/Pos/Customer';
import moment from 'moment';

const cls = classNames.bind(styles);

const { Header, Sider, Content, Footer } = Layout;
const TabPane = Tabs.TabPane;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

class PosLayout extends PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }
  constructor(props) {
    super(props);
  }
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }
  componentDidMount() {
    this.innerHeight = window.innerHeight;
    if (this.props.commodity.orders.length === 0) {
      this.props.dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.STORESALE });
    }
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Orssica';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Orssica`;
    }
    return title;
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  @Debounce(600)
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }
  onChange = (activeKey) => {
    if (activeKey === '+') {
      this.props.dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.STORESALE });
      return;
    } else if (activeKey === '-') {
      return;
    } else if (activeKey === 'leftHeader') {
      this.props.dispatch(routerRedux.push('/'));
      return;
    }
    this.props.dispatch({ type: 'commodity/clickTab', payload: activeKey });
  }
  remove = (currentIndex) => {
    this.props.dispatch({ type: 'commodity/clickRemoveButton', payload: currentIndex });
  }
  render() {
    const { currentUser, fetchingNotices, dispatch } = this.props;
    const { orders, activeTabKey } = this.props.commodity || {};
    const currentIndex = orders.findIndex(item => item.key === activeTabKey);
    const currentOrder = orders.filter(item => item.key === activeTabKey)[0]
    const createTabTitle = (title, type, key, currentTime) => {
      const tabsBarContentCls = cls({
        [styles.tabsBarContent]: true,
        [styles.tabsBarContentAllocate]: type === POS_TAB_TYPE.ALLOCATEANDTRANSFER,
        [styles.tabsBarContentMilkPowder]: type === POS_TAB_TYPE.MILKPOWDER,
        [styles.tabsBarContentWholeSale]: type === POS_TAB_TYPE.WHOLESALE,
      });
      if (typeof title === 'number') {
        const tabsBarElement = (
          <div className={tabsBarContentCls}>
            <Badge count={title} overflowCount={1000} style={{ background: '#393939' }} />
            {
              activeTabKey === key && <span>{currentTime}</span>
            }
          </div>
        );
        return tabsBarElement;
      }
    };
    const plusButton = (
      <div className={styles.operationButton}>
        <Icon type="plus" />
      </div>
    );
    const minusButton = (
      <div className={styles.operationButton}>
        <Icon type="minus" onClick={this.remove.bind(this, currentIndex)} />
      </div>
    );
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item disabled><Icon type="user" />个人中心</Menu.Item>
        <Menu.Item disabled><Icon type="setting" />设置</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    const leftHeader = (
      <div className={styles.logo}>
        <Link to="/">
          <h1>POS</h1>
        </Link>
      </div>
    );
    // const rightButtonListData = []

    const rightButtonList = (
      <div>
        <div>
          <Button>111</Button>
        </div>
        <div>
          <Button>111</Button>
        </div>
      </div>
    );
    const rightButtonMenu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={() => dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.MILKPOWDER })}>新建奶粉/生鲜订单</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={() => dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.WHOLESALE })}>新建批发订单</a>
        </Menu.Item>
      </Menu>
    );
    const rightButton = (
      <Dropdown overlay={rightButtonMenu} trigger={['click']}>
        <Button icon="left" />
      </Dropdown>
    );
    const generatePosLayoutContent = () => {
      switch (currentOrder.targetPhase) {
        case POS_PHASE.LIST: {
          return <GoodsList />
        }
        case POS_PHASE.TABLE: {
          return <GoodsTable />
        }
        case POS_PHASE.PAY: {
          return <Payment />
        }
        case POS_PHASE.CUSTOMER: {
          return <Customer />
        }
        default: {
          return null
        }
      }
    }


    const layout = (
      <Layout>
        <Content style={{ height: '100%' }}>
          <div style={{ minHeight: 'calc(100vh - 260px)' }}>
            <div
              className={styles.tabsWrapper}
            >
              <Tabs
                hideAdd
                tabBarExtraContent={rightButton}
                onChange={this.onChange}
                activeKey={activeTabKey}
                type="card"
              >
                <TabPane tab={<span>POS</span>} key="leftHeader" />
                {
                  orders.map(orderItem => (
                    <TabPane tab={createTabTitle(orderItem.title, orderItem.type, orderItem.key, orderItem.currentTime)} key={orderItem.key}>
                      <div className={styles.tabContent}>
                        {
                          generatePosLayoutContent()
                        }
                      </div>
                    </TabPane>
                  ))
                }
                <TabPane tab={plusButton} key="+" />
                <TabPane tab={minusButton} key="-" />
              </Tabs>
            </div>
          </div>
        </Content>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  currentUser: state.user.currentUser,
  fetchingNotices: state.global.fetchingNotices,
  notices: state.global.notices,
  commodity: state.commodity,
}))(PosLayout);
