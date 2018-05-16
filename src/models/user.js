import { message } from 'antd';
import { query as queryUsers, queryCurrent } from '../services/user';
import { getUser, addOrUpdateUser } from '../services/api';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    userList: [],
  },

  effects: {
    *getAll(_, { call, put }) {
      const response = yield call(getUser);
      if (response.Status) {
        const userList = response.Result.Data;
        const payload = Array.isArray(userList) ? userList : [];
        yield put({
          type: 'saveUserList',
          payload,
        });
      } else {
        message.error('获取失败');
      }
    },
    *addOrUpdate(action, { call, put }) {
      const { payload } = action;
      const response = yield call(addOrUpdateUser, payload);
      if (response.Status) {
        const payload = response.Result.Data;
        yield put({ type: 'getAll' });
      } else {
        message.error('添加失败');
      }
    },
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
  },

  reducers: {
    saveUserList(state, action) {
      return {
        ...state,
        userList: action.payload,
      };
    },
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
