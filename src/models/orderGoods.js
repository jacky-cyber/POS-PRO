import { fetchGoodsToOrder } from '../services/api';

export default {
  namespace: 'orderGoods',

  state: {
    goodsList: [],
    isGetGoodsListloading: true,
  },

  effects: {
    *fetchGoodsList(_, { call, put }) {
      yield put({
        type: 'changeGetGoodsListLoading',
        payload: true,
      });
      const response = yield call(fetchGoodsToOrder);
      const { List } = response || {}
      yield put({
        type: 'saveGoodsList',
        payload: Array.isArray(List) ? List : [],
      });
      yield put({
        type: 'changeGetGoodsListLoading',
        payload: false,
      });
    },
  },

  reducers: {
    saveGoodsList(state, action) {
      return {
        ...state,
        goodsList: action.payload,
      };
    },
    changeGetGoodsListLoading(state, action) {
      return {
        ...state,
        isGetGoodsListloading: action.payload,
      };
    },
  },
};
