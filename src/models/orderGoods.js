import { getWholeSaleGoods, addWholeSaleOrder } from 'services/api';
import { orderGenerateAPI } from 'services/orderGoods';
import { message } from 'antd';

export default {
  namespace: 'orderGoods',

  state: {
    goodsList: [],
    allGoodsList: [],
    generatedOrder: [],
    commonLoading: false,
  },

  effects: {
    *clickGenerateOrderButton(action, { take, put }) {
      yield put({ type: 'changeLoading', payload: true });
      yield put({ type: 'fetchAllGoodsList' });
      yield take('fetchAllGoodsList/@@end');
      yield put({ type: 'generateOrder' });
      yield put({ type: 'changeLoading', payload: false });
    },
    *fetchAllGoodsList(_, { call, put }) {
      const response = yield call(getWholeSaleGoods);
      const goodsList = response.Result.Data;
      yield put({
        type: 'saveAllGoodsList',
        payload: Array.isArray(goodsList) ? goodsList : [],
      });
    },
    *fetchGoodsList(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getWholeSaleGoods, payload);
      const goodsList = response.Result.Data;
      yield put({
        type: 'saveGoodsList',
        payload: Array.isArray(goodsList) ? goodsList : [],
      });
    },
    *addOrder(action, { call }) {
      const { payload } = action;
      const response = yield call(addWholeSaleOrder, payload);
      if (response.Status) {
        message.success('提交成功');
      } else {
        message.error('提交失败');
      }
    },
    *generateOrder(action, { call, put }) {
      const response = yield call(orderGenerateAPI);
      if (response.Result) {
        const { Result = {} } = response;
        const { Data = [] } = Result;
        yield put({ type: 'saveGeneratedOrder', payload: Data });
      }
    },
  },

  reducers: {
    saveGoodsList(state, action) {
      return {
        ...state,
        goodsList: action.payload,
      };
    },
    saveAllGoodsList(state, action) {
      return {
        ...state,
        allGoodsList: action.payload,
      };
    },
    saveGeneratedOrder(state, action) {
      const { payload } = action;
      return {
        ...state,
        generatedOrder: payload,
      };
    },
    changeLoading(state, action) {
      const { payload } = action;
      return {
        ...state,
        commonLoading: payload,
      };
    },
  },
};
