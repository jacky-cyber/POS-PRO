import { addCompany, deleteCompany, updateCompany, getCompany, } from '../services/api';

export default {
  namespace: 'express',

  state: {
    expressList: [],
    loading: false,
  },

  effects: {
    *addCompany({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(addCompany, payload);
      yield put({type: 'getCompany'})
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *deleteCompany({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(deleteCompany, payload);
      yield put({type: 'getCompany'})
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *updateCompany({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(updateCompany, payload);
      yield put({type: 'getCompany'})
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *getCompany(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getCompany);
      const expressList = response.Result.Data
      const payload = Array.isArray(expressList) ? expressList : []
      yield put({
        type: 'saveExpressList',
        payload,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
  },

  reducers: {
    saveExpressList(state, action) {
      return {
        ...state,
        expressList: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
};
