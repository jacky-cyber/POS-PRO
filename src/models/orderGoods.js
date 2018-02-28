import { getWholeSaleGoods, addWholeSaleOrder } from '../services/api';
import { message } from 'antd'

export default {
  namespace: 'orderGoods',

  state: {
    goodsList: [],
  },

  effects: {
    *fetchGoodsList(_, { call, put }) {
      const response = yield call(getWholeSaleGoods);
      const goodsList = response.Result.Data
      console.log('goodsList', goodsList)
      yield put({
        type: 'saveGoodsList',
        payload: Array.isArray(goodsList) ? goodsList : [],
      });
    },
    *addOrder(action, { call, put}) {
      const { payload } = action
      try {
        const response = yield call(addWholeSaleOrder, payload)
        if (response.Status) {
          message.success('提交成功')
        } else {
          message.error('提交失败')
        }
      } catch (e) {
      }
    }
  },

  reducers: {
    saveGoodsList(state, action) {
      return {
        ...state,
        goodsList: action.payload,
      };
    },
  },
};
