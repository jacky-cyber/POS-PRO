import {
  getUserAPI,
  addOrUpdateUserAPI,
  getDepartmentAPI,
  addDepartmentAPI,
  query as queryUsers,
  queryCurrent,
} from 'services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    userList: [],
    departmentList: [],
  },

  effects: {
    // 获取所有用户
    *getAll(_, { call, put }) {
      const response = yield call(getUserAPI);
      if (response.Status) {
        const userList = response.Result.Data;
        const payload = Array.isArray(userList) ? userList : [];
        yield put({
          type: 'saveUserList',
          payload,
        });
      }
    },
    // 新增或更新用户
    *addOrUpdate(action, { call, put }) {
      const { payload } = action;
      const response = yield call(addOrUpdateUserAPI, payload);
      if (response.Status) {
        yield put({ type: 'getAll' });
      }
    },
    // 获取部门
    *getDepartment(_, { call, put }) {
      const response = yield call(getDepartmentAPI);
      if (response.Status) {
        const departmentList = response.Result.Data;
        const payload = Array.isArray(departmentList)
          ?
          [
            { ID: 0, Name: '测试店铺', key: 0, value: 0 },
            ...departmentList.map(item => ({ ...item, key: item.ID, value: item.ID })),
          ]
          :
          [];
        yield put({
          type: 'saveDepartmentList',
          payload,
        });
      }
    },
    // 新增部门
    *addDepartment(action, { call, put }) {
      const { payload } = action;
      const response = yield call(addDepartmentAPI, payload);
      if (response.Status) {
        yield put({ type: 'getDepartment' });
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
    saveDepartmentList(state, action) {
      return {
        ...state,
        departmentList: action.payload,
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
