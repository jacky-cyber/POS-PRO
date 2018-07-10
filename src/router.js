import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import styles from './index.less';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});


// function RouterConfig({ history, app }) {
function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  const PosLayout = routerData['/pos'].component;
  const Exception403 = routerData['/exception/403'].component;
  const Exception404 = routerData['/exception/404'].component;
  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/user"
            component={UserLayout}
          />
          <Route
            path="/exception/403"
            component={Exception403}
          />
          <AuthorizedRoute
            path="/pos"
            render={props => <PosLayout {...props} />}
            authority={['admin', 'user']}
            redirectPath="/exception/403"
          />
          <AuthorizedRoute
            path="/"
            render={props => (
              <BasicLayout {...props} />
            )}
            authority={['admin', 'user']}
            redirectPath="/user/login"
          />
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
