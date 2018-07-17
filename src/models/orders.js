import {
  getHistoryOrdersAPI,
  getHistoryOrderDetailsAPI,
  getHistoryOrderReceiptAPI,
  getDailyOrdersAPI,
  pushMilkPowderOrderAPI,
} from 'services/orders';
import { message } from 'antd';
import moment from 'moment';

const defaultDate = [moment().subtract(7, 'days'), moment()].map(item => (
  item.format('YYYY-MM-DD').toString()
));

export default {
  namespace: 'orders',

  state: {
    orderList: [],
    dailyOrders: [],
    orderDetails: [],
    dailyTotalSale: {},
    searchCondition: {
      PayTime: {
        value: defaultDate,
      },
    },
    pagination: {
      total: null,
      current: 1,
      pageSize: 10,
    },
    orderReceipt: {},
  },

  effects: {
    *getHistoryOrders(action, { call, put, select }) {
      const orders = yield select(state => state.orders);
      const { searchCondition } = orders;
      const { payload } = action;
      const { pagination } = payload;
      // const value = {};
      // Object.keys(searchCondition).forEach((item) => {
      //   Object.assign(value, { item: searchCondition.item.value });
      // });
      // console.log('value', value);
      const response = yield call(getHistoryOrdersAPI, { value: searchCondition.PayTime.value, pagination });
      try {
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
      } catch (e) {
        throw e;
      }
    },
    *getOrderDetails(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getHistoryOrderDetailsAPI, payload);
      try {
        const orderDetails = response.Result.Data;
        yield put({
          type: 'saveOrderDetails',
          payload: Array.isArray(orderDetails) ? orderDetails : [],
        });
      } catch (e) {
        throw e;
      }
    },
    *getOrderDetailAndAddToOrder(action, { call, put, select }) {
      const { payload } = action;
      const response = yield call(getHistoryOrderDetailsAPI, payload);
      try {
        const orderDetail = response.Result.Data;
        const dailyOrders = yield select(state => state.orders.dailyOrders);
        const newDailyOrders = dailyOrders.map((item) => {
          if (item.ID === payload) {
            return { ...item, detail: orderDetail };
          }
          return item;
        });
        console.log('nreOrderList', newDailyOrders);
        yield put({
          type: 'saveDailyOrders',
          payload: Array.isArray(newDailyOrders) ? newDailyOrders : [],
        });
      } catch (e) {
        throw e;
      }
    },
    *getOrderReceipt(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getHistoryOrderReceiptAPI, payload);
      try {
        const orderReceipt = response.Result.Data || '';
        const formattedReceipt = JSON.parse(orderReceipt);
        yield put({
          type: 'saveOrderReceipt',
          payload: formattedReceipt || {},
        });
      } catch (e) {
        console.log('e', e);
      }
    },
    *getDailyOrders(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getDailyOrdersAPI, payload);
      try {
        const orderList = response.Result.Data;
        const totalFee = response.Result.TotalFee;
        const shippingFee = response.Result.ShippingFee;
        const fee = {
          totalFee,
          shippingFee,
        };
        yield put({
          type: 'saveDailyOrders',
          payload: Array.isArray(orderList) ? orderList : [],
        });
        yield put({
          type: 'changeDailyTotalSale',
          payload: fee,
        });
      } catch (e) {
        throw e;
      }
    },
    *pushMilkPowderOrder(action, { call }) {
      const { payload } = action;
      const response = yield call(pushMilkPowderOrderAPI, payload);
      if (response.Message === 'success') {
        message.success('提交成功');
      } else {
        message.error('提交失败');
      }
    },

  },

  reducers: {
    saveHistoryOrders(state, action) {
      return {
        ...state,
        orderList: action.payload,
      };
    },
    saveDailyOrders(state, action) {
      return {
        ...state,
        dailyOrders: action.payload,
      };
    },
    saveOrderDetails(state, action) {
      return {
        ...state,
        orderDetails: action.payload,
      };
    },
    saveOrderReceipt(state, action) {
      return {
        ...state,
        orderReceipt: action.payload,
      };
    },
    changePagination(state, action) {
      const { payload } = action;
      return {
        ...state,
        pagination: payload,
      };
    },
    changeDailyTotalSale(state, action) {
      const { payload } = action;
      return {
        ...state,
        dailyTotalSale: payload,
      };
    },
    changeSearchCondition(state, action) {
      const { payload } = action;
      return {
        ...state,
        searchCondition: payload,
      };
    },
  },
};
