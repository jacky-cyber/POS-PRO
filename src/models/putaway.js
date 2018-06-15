import {
  getGoodsForPutawayAPI,
  addOrUpdateGoodsForPutawayAPI,
  deleteGoodsForPutawayAPI,
} from '../services/putaway';

export default {
  namespace: 'putaway',

  state: {
    goodsForPutaway: [],
    pagination: {
      total: null,
      current: 1,
      pageSize: 10,
    },
    searchCondition: '',
  },

  effects: {
    *getGoodsForPutaway({ payload }, { call, put, select }) {
      const { searchCondition } = yield select(state => state.putaway);
      const { value = searchCondition, pagination = { current: 1, pageSize: 10 } } = payload;
      const response = yield call(getGoodsForPutawayAPI, payload);
      if (response) {
        const goodsForPutawayList = response.Result.Data;
        const list = Array.isArray(goodsForPutawayList) ? goodsForPutawayList : [];
        yield put({
          type: 'saveGoodsForPutaway',
          payload: list,
        });
        const total = response.Result.Count;
        yield put({
          type: 'changePagination',
          payload: pagination,
        });
        yield put({
          type: 'changePaginationTotal',
          payload: total,
        });
        yield put({
          type: 'changeSearchCondition',
          payload: value,
        });
      }
    },
    *addOrUpdateGoodsForPutaway({ payload }, { call, put, select }) {
      const putaway = yield select(state => state.putaway);
      const { searchCondition, pagination } = putaway;
      yield call(addOrUpdateGoodsForPutawayAPI, payload);
      yield put({
        type: 'getGoodsForPutaway',
        payload: {
          value: searchCondition,
          pagination,
        },
      });
    },
    *deleteGoodsForPutaway({ payload }, { call, put, select }) {
      const putaway = yield select(state => state.putaway);
      const { searchCondition, pagination } = putaway;
      yield call(deleteGoodsForPutawayAPI, payload);
      yield put({
        type: 'getGoodsForPutaway',
        payload: {
          value: searchCondition,
          pagination,
        },
      });
    },
  },

  reducers: {
    saveGoodsForPutaway(state, action) {
      return {
        ...state,
        goodsForPutaway: action.payload,
      };
    },
    changeSearchCondition(state, action) {
      const { payload: searchCondition } = action;
      return {
        ...state,
        searchCondition,
      };
    },
    changePagination(state, action) {
      const { payload: pagination } = action;
      console.log('pagination', pagination);
      return { ...state, pagination };
    },
    changePaginationTotal(state, action) {
      const { payload: total } = action;
      return {
        ...state,
        pagination: { ...state.pagination, total },
      };
    },
  },
};
