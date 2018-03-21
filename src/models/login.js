import { routerRedux } from 'dva/router';
import { fakeAccountLogin, login } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import Cookies from 'js-cookie';
import { message } from 'antd';
import { getMenuData } from '../common/menu'
import { app } from '../index'
import { getRouterData } from '../common/router';
import createLoading from 'dva-loading';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    // *login({ payload }, { call, put }) {
    //   const response = yield call(fakeAccountLogin, payload);
    //   yield put({
    //     type: 'changeLoginStatus',
    //     payload: response,
    //   });
    //   // Login successfully
    //   if (response.status === 'ok') {
    //     reloadAuthorized();
    //     yield put(routerRedux.push('/'));
    //   }
    // },
    *login({ payload }, { put, call }) {
      const response = yield call(login, payload)
      if (response) {
        const { Result={} } = response
        const { Data={} } = Result
        Cookies.set('currentUser', Data, { expires: 1, path: '' })
        yield put({
          type: 'user/saveCurrentUser',
          payload: Data,
        })
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: response.Status,
            currentAuthority: 'user',
          },
        });
        let authority = response.Result.Data.Authority
        const generateAuthority = (authority) => {
          if (typeof authority === 'string') {
            return authority.split(',')
          } else if (Array.isArray(authority)) {
            return authority
          } else {
            return []
          }
        }
        const routerAuthority = generateAuthority(authority)
        Cookies.set('authority', routerAuthority, { expires: 1, path: '' })
        Cookies.set('xxx', 'xxx', { expires: 1, path: '' })
        console.log(Cookies.getJSON('authority'))
        console.log(Cookies.get('xxx'))
        reloadAuthorized()
        // getMenuData()
        // window.location.reload()
        yield put(routerRedux.push('/'));
        app.router(require('../router').default);
        getRouterData(app)
      }
    },
    *logoutUnRedirect(_, { put, select }) {
      try {
        // get location pathname
        // const urlParams = new URL(window.location.href);
        // const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        // urlParams.searchParams.set('redirect', pathname);
        // window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
        Cookies.remove('authority', { path: '' })
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
        Cookies.remove('authority', { path: '' })
      }
    },
    // *logout(_, { put, select }) {
    //   try {
    //     // get location pathname
    //     const urlParams = new URL(window.location.href);
    //     const pathname = yield select(state => state.routing.location.pathname);
    //     // add the parameters in the url
    //     urlParams.searchParams.set('redirect', pathname);
    //     window.history.replaceState(null, 'login', urlParams.href);
    //   } finally {
    //     yield put({
    //       type: 'changeLoginStatus',
    //       payload: {
    //         status: false,
    //         currentAuthority: 'guest',
    //       },
    //     });
    //     reloadAuthorized();
    //     yield put(routerRedux.push('/user/login'));
    //   }
    // },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        // type: payload.type,
      };
    },
  },
}
