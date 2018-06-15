import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Dropdown, Badge } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import cls from 'classnames';
import { TabOne } from 'components/BaseComponents';
import styles from './PosLayout.less';
import { POS_TAB_TYPE, POS_PHASE } from '../constant';
import GoodsTable from '../routes/Pos/GoodsTable';
import Payment from '../routes/Pos/Payment';
import Customer from '../routes/Pos/Customer';


const { Content } = Layout;

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

@connect(({ commodity }) => ({
  orders: commodity.orders,
  activeTabKey: commodity.activeTabKey,
  order: commodity.orders.filter(item => item.key === commodity.activeTabKey)[0],
}))

export default class PosLayout extends PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }
  componentDidMount() {
    const { orders } = this.props;
    if (orders.length === 0) {
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
  remove = (currentIndex) => {
    this.props.dispatch({ type: 'commodity/clickRemoveButton', payload: currentIndex });
  }
  generatePosLayoutContent = (targetPhase) => {
    switch (targetPhase) {
      case POS_PHASE.TABLE: {
        return <GoodsTable />;
      }
      case POS_PHASE.PAY: {
        return <Payment />;
      }
      case POS_PHASE.CUSTOMER: {
        return <Customer />;
      }
      default: {
        return null;
      }
    }
  };
  tabChangeHandler = (activeKey) => {
    if (activeKey === '+') {
      this.props.dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.STORESALE });
    } else if (activeKey === '-') {
      const { orders, activeTabKey } = this.props || {};
      const currentIndex = orders.findIndex(item => item.key === activeTabKey);
      this.props.dispatch({ type: 'commodity/clickRemoveButton', payload: currentIndex });
    } else {
      this.props.dispatch({ type: 'commodity/clickTab', payload: activeKey });
    }
  }
  render() {
    const { dispatch, orders, activeTabKey, order } = this.props;
    const createTabTitle = (title, type, key, currentTime) => {
      const tabsBarContentCls = cls({
        [styles.tabsBarContent]: true,
        [styles.tabsActiveBarContent]: activeTabKey === key,
        [styles.tabsBarContentAllocate]: type === POS_TAB_TYPE.ALLOCATEANDTRANSFER,
        [styles.tabsBarContentMilkPowder]: type === POS_TAB_TYPE.MILKPOWDER,
        [styles.tabsBarContentWholeSale]: type === POS_TAB_TYPE.WHOLESALE,
      });
      if (typeof title === 'number') {
        const tabsBarElement = (
          <div className={tabsBarContentCls} key={key}>
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
      <div className={styles.operationButton} key="+">
        <Icon type="plus" />
      </div>
    );
    const minusButton = (
      <div className={styles.operationButton} key="-">
        <Icon type="minus" />
      </div>
    );
    const rightExtraMenu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={() => dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.MILKPOWDER })}>新建奶粉/生鲜订单</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={() => dispatch({ type: 'commodity/clickAddTabButton', payload: POS_TAB_TYPE.WHOLESALE })}>新建批发订单</a>
        </Menu.Item>
      </Menu>
    );
    const rightExtra = (
      <Dropdown overlay={rightExtraMenu} trigger={['click']}>
        <div className={styles.operationButton}>
          <Icon type="right" />
        </div>
      </Dropdown>
    );

    const leftExtra = (
      <div style={{ width: 440 }}>
        <Link to="/">
          <h1>POS</h1>
        </Link>
      </div>
    );

    const layout = (
      <Layout>
        <Content style={{ height: '100%' }}>
          <div style={{ minHeight: 'calc(100vh - 260px)' }}>
            <div
              className={styles.tabsWrapper}
            >
              <TabOne
                content={this.generatePosLayoutContent(order && order.targetPhase)}
                activeKey={activeTabKey}
                onChange={this.tabChangeHandler}
                leftExtra={leftExtra}
                rightExtra={rightExtra}
              >
                {
                orders.map(orderItem => (
                  createTabTitle(orderItem.title, orderItem.type, orderItem.key, orderItem.currentTime)
                ))
              }
                {
                plusButton
              }
                {
                minusButton
              }
              </TabOne>
            </div>
          </div>
        </Content>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={cls(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
