import { getHistoryOrdersAPI, getHistoryOrderDetailsAPI } from 'services/historyOrders';

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
      const { payload } = action;
      const { pagination } = payload;
      const response = yield call(getHistoryOrdersAPI, payload);
      if (response.Status) {
        const orderList = response.Result.Data;
        const count = response.Result.Count;
        const newPagination = { ...pagination, total: count };
        yield put({
          type: 'changePagination',
          payload: newPagination,
        });
        yield put({
          type: 'saveHistoryOrders',
          payload: Array.isArray(orderList) ? orderList : [],
        });
        yield put({
          type: 'saveOrderDetails',
          patyload: [],
        });
      }
    },
    *getOrderDetails(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getHistoryOrderDetailsAPI, payload);
      const orderDetails = response.Result.Data;
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
      const { payload } = action;
      return {
        ...state,
        pagination: payload,
      };
    },
  },
};
