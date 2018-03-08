import { routerRedux } from 'dva/router';
import { fakeAccountLogin, login } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import Cookies from 'js-cookie';
import { message } from 'antd';

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
      console.log('response', response)
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: response.Status,
          currentAuthority: 'user',
        },
      });
      if (response.Status === 1) {
        Cookies.set('authority', response.Result.Data.Authority, { expires: 7, path: '' })
        yield put(routerRedux.push('/'));
      } else {
        message.error('用户名或密码错误')
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
    *logout(_, { put, select }) {
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
        // reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
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
};
