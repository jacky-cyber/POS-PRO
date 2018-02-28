import { getHistoryOrders, getHistoryOrderDetails } from '../services/api';
import { message } from 'antd'

export default {
  namespace: 'historyOrders',

  state: {
    orderList: [],
    orderDetails: [],
    pagination: {
      total: null,
      current: 1,
      pageSize: 10,
    },
  },

  effects: {
    *getHistoryOrders(action, { call, put, select }) {
      const { payload } = action
      const response = yield call(getHistoryOrders, payload);
      const orderList = response.Result.Data
      const count = response.Result.Count
      const pagination = yield select(state => state.historyOrders.pagination)
      const newPagination = { ...pagination, total: count, }
      yield put({
        type: 'changePagination',
        payload: newPagination,
      })
      yield put({
        type: 'saveHistoryOrders',
        payload: Array.isArray(orderList) ? orderList : [],
      });
    },
    *getOrderDetails(action, { call, put }) {
      const { payload } = action
      const response = yield call(getHistoryOrderDetails, payload);
      const orderDetails = response.Result.Data
      console.log('orderDetails', orderDetails)
      yield put({
        type: 'saveOrderDetails',
        payload: Array.isArray(orderDetails) ? orderDetails : [],
      });
    },
  },

  reducers: {
    saveHistoryOrders(state, action) {
      return {
        ...state,
        orderList: action.payload,
      };
    },
    saveOrderDetails(state, action) {
      return {
        ...state,
        orderDetails: action.payload,
      };
    },
    changePagination(state, action) {
      const { payload } = action
      return {
        ...state,
        pagination: payload,
      }
    }
  },
};
