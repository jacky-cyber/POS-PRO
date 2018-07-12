import moment from 'moment';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { POS_TAB_TYPE, POS_PHASE, SALE_TYPE } from 'constant';
import { submitCustomer, getCustomer, deleteCustomer, updateCustomer, getMilkPowderGoods, addOrUpdateCacheOrder, fetchWaybill, submitOrder, getStoreSaleGoods, getStoreWholesaleGoods, addOrUpdateDailyClosing } from 'services/api';
import { getHistoryOrderDetailsAPI } from 'services/orders';
import { calculateExpressOrShippingCost, getGoodsItemCustomerPrice, keepTwoDecimals, setLocalStorage, getLocalStorage, formatToDecimals } from 'utils/utils';

function getCurrentOrder(state) {
  return state.orders.filter(item => item.key === state.activeTabKey)[0];
}

// 获取每一个订单的商品的逻辑分为：
// 1.获取商品 fetch
// 2.保存该商品
// 3.分页
// 4.保存当前页商品列表 currentGoodsList

export default {
  namespace: 'commodity',

  state: {
    orders: [],
    // operationButton: ['add', 'minus'],
    // activeKey: null,
    activeTabKey: null,
    commonLoading: false,
    newTabIndex: 0,
    customerList: [],
    // storeSaleGoodsList: [],
    // milkPowderGoodsList: [],
    // storeWholesaleGoodsList: [],
    currentOrderGoodsList: [],
    pagination: {
      pagingData: [],
      pageSize: 100,
      total: null,
      current: 1,
    },
  },

  subscriptions: {
  },
  effects: {
    // 获取退换货订单的详情
    *getRefundOrderDetail(action, { call, put }) {
      const { payload } = action;
      const response = yield call(getHistoryOrderDetailsAPI, payload);
      if (response.Status) {
        const orderDetails = response.Result.Data;
        yield put({
          type: 'saveRefundOrderDetail',
          payload: Array.isArray(orderDetails) ? orderDetails : [],
        });
      }
    },
    // 提交日结
    *addOrUpdateDailyClosing(action, { put, call }) {
      const { payload } = action;
      const response = yield call(addOrUpdateDailyClosing, payload);
      if (response.Status) {
        message.success('提交成功');
      } else {
        message.error('提交失败');
      }
    },
    // 改变会员状态及会员价格
    *changeCustomer(action, { put, select }) {
      const { payload } = action;
      yield put({ type: 'saveCurrentCustomer', payload });
      const commodity = yield select(state => state.commodity);
      const { activeTabKey, currentOrderGoodsList } = commodity;
      const currentOrder = getCurrentOrder(commodity);
      const { customer = {}, selectedList, type, saleType } = currentOrder;
      const customerType = customer.memberType;
      const newSelectedList = selectedList.map(item => ({
        ...item,
        CustomerPrice: getGoodsItemCustomerPrice(
          type,
          saleType,
          customerType,
          item.RetailPrice,
          item.PlatinumPrice,
          item.DiamondPrice,
          item.VIPPrice,
          item.SVIPPrice,
          item.WholesalePrice,
          item.secondWholesalePrice,
        ),
      }));
      const newCurrentOrderGoodsList = currentOrderGoodsList.map(item => (
        {
          ...item,
          CustomerPrice: getGoodsItemCustomerPrice(
            type,
            saleType,
            customerType,
            item.RetailPrice,
            item.PlatinumPrice,
            item.DiamondPrice,
            item.VIPPrice,
            item.SVIPPrice,
            item.WholesalePrice,
            item.secondWholesalePrice,
          ),
        }));
      yield put({ type: 'changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
      yield put({ type: 'changeCurrentOrderGoodsList', payload: newCurrentOrderGoodsList });
    },
    // 缓存订单
    *addOrUpdateCacheOrder(action, { put, call, select }) {
      const commodity = yield select(state => state.commodity);
      const { activeTabKey } = commodity;
      const currentOrder = getCurrentOrder(commodity);
      const { currentPhase } = currentOrder;
      const { payload } = action;
      const response = yield call(addOrUpdateCacheOrder, payload);
      if (response) {
        const payload = response.Result.Data;
        yield put({ type: 'changeOrderID', payload });
        yield put({ type: 'changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.PAY } });
      }
    },
    // *goodsListPagingHandler(action, { put, select }) {
    //   const totalData = action.payload;
    //   const length = totalData.length;
    //   yield put({ type: 'changePaginationTotal', payload: length });
    //   const commodity = yield select(state => state.commodity);
    //   const { pagination = {} } = commodity || {};
    //   const { pageSize } = pagination || {};
    //   const pageTotalNumber = Math.ceil(length / pageSize);
    //   const newData = [];
    //   let startNumber = 0;
    //   let endNumber = pageSize;
    //   for (let i = 0; i < pageTotalNumber; i++) {
    //     newData.push(totalData.slice(startNumber, endNumber));
    //     startNumber += pageSize;
    //     endNumber += pageSize;
    //   }
    //   yield put({ type: 'changePaginationPagingData', payload: newData });
    // },

    // 获取奶粉商品列表
    *getMilkPowderGoods(action, { put, call }) {
      const response = yield call(getMilkPowderGoods);
      if (response.Status) {
        const data = response.Result.Data;
        const payload = data.map(item => ({
          ...item,
          Key: item.Sku,
          RetailPrice: formatToDecimals(item.RetailPrice, 2),
          CustomerPrice: formatToDecimals(item.RetailPrice, 2),
          Count: 1,
        }));
        yield put({ type: 'saveMilkPowderGoodsList', payload });
        // yield put({ type: 'goodsListPagingHandler', payload });
        yield put({ type: 'changeCurrentOrderGoodsList', payload });
      } else {
        message.error('获取失败');
      }
    },
    // 获取门店商品列表
    *getStoreSaleGoods(_, { put, call }) {
      const response = yield call(getStoreSaleGoods);
      if (response) {
        const data = response.Result.Data;
        const payload = data.map(item => ({
          ...item,
          Key: item.Sku,
          SaleType: SALE_TYPE.LOCAL,
          RetailPrice: formatToDecimals(item.RetailPrice, 2),
          CustomerPrice: formatToDecimals(item.RetailPrice, 2),
          Count: 1 }));
        yield put({ type: 'saveStoreSaleGoodsList', payload });
        // yield put({ type: 'goodsListPagingHandler', payload })
        yield put({ type: 'changeCurrentOrderGoodsList', payload });
      }
    },
    // 获取门店批发列表
    *getStoreWholesaleGoods(_, { put, call }) {
      const response = yield call(getStoreWholesaleGoods);
      if (response.Status) {
        const data = response.Result.Data;
        const payload = data.map(item => ({
          ...item,
          Key: item.Sku,
          CustomerPrice: formatToDecimals(item.WholesalePrice, 2),
          RetailPrice: formatToDecimals(item.WholesalePrice, 2),
          Count: 1,
        }
        ));
        yield put({ type: 'saveStoreWholesaleGoodsList', payload });
        // yield put({ type: 'goodsListPaginsHandler', payload });
        yield put({ type: 'changeCurrentOrderGoodsList', payload });
      } else {
        message.error('获取失败');
      }
    },
    // 获取所有会员信息
    *getCustomer(action, { put, call }) {
      const { payload } = action;
      const response = yield call(getCustomer, payload);
      if (response.Status) {
        const payload = response.Result.Data;
        yield put({ type: 'saveCustomerList', payload });
      }
    },
    // 提交会员信息
    *submitCustomer(action, { put, call }) {
      const { payload } = action;
      const { values, callback } = payload;
      const response = yield call(submitCustomer, values);
      if (response.Status) {
        const { Result } = response;
        const { Data } = Result;
        message.success('提交成功');
        if (Data) {
          callback(values, Data);
        }
      }
      yield put({ type: 'getCustomer' });
    },
    // 删除会员
    *deleteCustomer(action, { put, call }) {
      const { payload } = action;
      yield put({
        type: 'changeCommonLoading',
        payload: true,
      });
      try {
        const response = yield call(deleteCustomer, payload);
        if (response.Status) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
        yield put({ type: 'getCustomer' });
      } catch (e) {
      }
      yield put({
        type: 'changeCommonLoading',
        payload: false,
      });
    },
    // 更新会员
    *updateCustomer(action, { put, call }) {
      const { payload } = action;
      yield put({
        type: 'changeCommonLoading',
        payload: true,
      });
      try {
        const response = yield call(updateCustomer, payload);
        if (response.Status) {
          message.success('更新成功');
        } else {
          message.error('更新失败');
        }
        yield put({ type: 'getCustomer' });
      } catch (e) {
      }
      yield put({
        type: 'changeCommonLoading',
        payload: false,
      });
    },
    // 获取订单信息
    *fetchWaybill(action, { call, put, select }) {
      const commodity = yield select(state => state.commodity);
      const { activeTabKey } = commodity;
      const currentOrder = getCurrentOrder(commodity);
      const { selectedList } = currentOrder;
      const dataJson = JSON.stringify(selectedList);
      yield put({
        type: 'changeCommonLoading',
        payload: true,
      });
      try {
        const response = yield call(fetchWaybill, dataJson);
        if (response.Status) {
          message.success('抓取成功');
          const latestSelectedList = response.Result.Data;
          const payload = {
            activeTabKey,
            latestSelectedList,
          };
          yield put({
            type: 'changeSelectedList',
            payload,
          });
        } else {
          message.error('抓取失败');
        }
      } catch (e) {
      }
      yield put({
        type: 'changeCommonLoading',
        payload: false,
      });
    },
    // 提交订单
    *submitOrder(action, { call, put, select, take }) {
      const { payload } = action;
      const response = yield call(submitOrder, payload);
      if (response) {
        message.success('订单提交成功');
        const commodity = yield select(state => state.commodity);
        const { activeTabKey } = commodity;
        yield put({ type: 'clickAddTabButton', payload: POS_TAB_TYPE.STORESALE });
        yield take('clickAddTabButton/@@end');
        yield put({ type: 'removeTab', payload: activeTabKey });
      }
    },
    // 更改支付方式
    *changePaymentDataAndCheck(action, { put }) {
      const paymentData = action.payload;
      yield put({ type: 'changePaymentData', payload: paymentData });
      yield put({ type: 'checkPaymentData' });
    },
    *clickGoodsItemTrue(action, { put, select }) {
      const commodity = yield select(state => state.commodity);
      // const currentOrder = getCurrentOrder(commodity);
      // const content = getCurrjentContent(currentOrder, commodity)
      const { pagination = {} } = commodity;
      const { pagingData = [], current = 0 } = pagination;
      const content = pagingData[current - 1];
      const key = action.payload;
      const newContent = content.map((item) => {
        if (item.Key === key) {
          return { ...item, dataClicked: 'true' };
        }
        return item;
      });
      pagingData[current - 1] = newContent;
      yield put({ type: 'changePaginationPagingData', payload: pagingData });
    },
    *clickGoodsItem(action, { put, select }) {
      const commodity = yield select(state => state.commodity);
      const { pagination = {} } = commodity;
      const { pagingData = [], current = 0 } = pagination;
      const content = pagingData[current - 1];
      const key = action.payload;
      const newContent = content.map((item) => {
        if (item.Key === key) {
          return { ...item, dataClicked: null };
        }
        return item;
      });
      pagingData[current - 1] = newContent;
      yield put({ type: 'changePaginationPagingData', payload: pagingData });
      yield put({ type: 'addToSelectedList', payload: { key, count: 1 } });
    },
    *clickPaymentMethodButton(action, { put, select }) {
      const paymentMethod = action.payload;
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
      const { paymentData, paymentDataIndex, totalPrice } = currentOrder;
      const activePaymentDataIndex = paymentData.length;
      yield put({ type: 'changePaymentDataIndex', payload: paymentDataIndex });
      let newPaymentData = [];
      if (Array.isArray(paymentData)) {
        if (activePaymentDataIndex === 0) {
          newPaymentData = [...paymentData, {
            demand: totalPrice,
            cash: totalPrice,
            giveChange: 0,
            method: paymentMethod.name,
            methodEN: paymentMethod.value,
            key: paymentDataIndex,
            cacheCash: `${totalPrice}`,
          }];
        } else {
          newPaymentData = [...paymentData, {
            demand: 0,
            cash: 0,
            giveChange: 0,
            method: paymentMethod.name,
            methodEN: paymentMethod.value,
            key: paymentDataIndex,
            cacheCash: null,
          }];
        }
      }
      yield put({ type: 'changePaymentData', payload: newPaymentData });
      yield put({ type: 'changeActivePaymentDataIndex', payload: activePaymentDataIndex });
      yield put({ type: 'checkPaymentData' });
    },
    *clickRemovePaymentDataItemButton(action, { put, select }) {
      const removeIndex = action.payload;
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
      const { paymentData, activePaymentDataIndex } = currentOrder;
      const newPaymentData = paymentData.filter((item, index) => {
        return index !== removeIndex;
      });
      yield put({ type: 'changePaymentData', payload: newPaymentData });
      yield put({ type: 'changeActivePaymentDataIndex', payload: activePaymentDataIndex });
      yield put({ type: 'checkPaymentData' });
    },
    *checkPaymentData(action, { put, select }) {
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
      const { paymentData, activePaymentDataIndex, totalPrice } = currentOrder;
      const currentItem = paymentData.filter((item, index) => index === activePaymentDataIndex)[0];
      function generateDemand(prevDemand, prevCash) {
        if (prevDemand > prevCash) {
          return keepTwoDecimals(prevDemand - prevCash);
        } else {
          return 0;
        }
      }
      function generateGiveChange(demand, cash) {
        if (cash > demand) {
          return keepTwoDecimals(cash - demand);
        } else {
          return 0;
        }
      }
      let newPaymentData;
      let prevItem;
      if (!currentItem) {
        newPaymentData = [];
      } else {
        newPaymentData = paymentData.map((item, index) => {
          if (index === 0) {
            prevItem = {
              ...item,
              demand: totalPrice,
              giveChange: generateGiveChange(totalPrice, item.cash),
            };
            return prevItem;
          } else {
            const demand = generateDemand(prevItem.demand, prevItem.cash);
            prevItem = {
              ...item,
              demand,
              giveChange: generateGiveChange(demand, item.cash),
            };
            return prevItem;
          }
        });
      }
      yield put({ type: 'changePaymentData', payload: newPaymentData });
      yield put({ type: 'sumChangeMoney', payload: newPaymentData });
      yield put({ type: 'sumReceiveMoney', payload: paymentData });
    },
    *sumChangeMoney(action, { put }) {
      const paymentData = action.payload;
      let changeMoney = 0;
      paymentData.forEach((item) => {
        changeMoney += item.giveChange;
      });
      yield put({ type: 'changeChangeMoney', payload: changeMoney });
    },
    *sumReceiveMoney(action, { put }) {
      const paymentData = action.payload;
      let receiveMoney = 0;
      paymentData.forEach((item) => {
        receiveMoney += item.cash;
      });
      yield put({ type: 'changeReceiveMoney', payload: receiveMoney });
    },
    *addBatchToSelectedList(action, { put, select, take }) {
      const { batchGoodsList } = action.payload;
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
    },
    *addToSelectedList(action, { put, select, take }) {
      const { key: selectedKey, count, refundGoodsItem = {} } = action.payload;
      const commodity = yield select(state => state.commodity);
      const { activeTabKey, pagination, currentOrderGoodsList } = commodity;
      const { pagingData, current } = pagination || {};
      const currentOrder = getCurrentOrder(commodity);
      const { saleType, targetPhase } = currentOrder;
      const currentGoodsList = targetPhase === POS_PHASE.TABLE ?
        currentOrderGoodsList
        :
        pagingData[current - 1];
      const { selectedList } = currentOrder;
      let { avoidDuplicationIndex } = currentOrder;
      // 针对于退换货，如果购物车列表里面有的话也算有该商品
      const selectedItem = currentGoodsList.filter(item => (item.Key === selectedKey))[0]
      || selectedList.filter(item => (item.Key === selectedKey))[0]
      || {};
      let newSelectedList;
      // 添加新商品到购物车
      function addNewToSelectedList(selectedItem, selectedList) {
        const newSelectedItem = {
          ...selectedItem,
          Count: count || 1,
          CalculateType: 'count',
          SaleType: saleType,
          ...refundGoodsItem,
        };
        return [...selectedList, newSelectedItem];
      }
      // 查看购物车里是否有该商品
      const index = selectedList.find(item => item.Key === selectedItem.Key);
      if (!index) {
        // 没有就新添加一个
        newSelectedList = addNewToSelectedList(selectedItem, selectedList);
        yield put({ type: 'changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
      } else {
        // 有的话需要做个判断
        let isLocked = false;
        newSelectedList = selectedList.map((item) => {
          if (item.Key === selectedKey) {
            // 修改过折扣的商品算新的
            if (item.CacheDiscount != null) {
              avoidDuplicationIndex += 1;
              isLocked = true;
              return { ...item, Key: `avoidDuplication-${avoidDuplicationIndex}-${item.Key}` };
            }
            // 修改过单价的商品算新的
            if (item.NewUnitPrice != null) {
              avoidDuplicationIndex += 1;
              isLocked = true;
              return { ...item, Key: `avoidDuplication-${avoidDuplicationIndex}-${item.Key}` };
            }
            return { ...item, Count: item.Count - 0 + (count || 0), CacheCount: null };
          }
          return item;
        });
        if (isLocked) {
          newSelectedList = addNewToSelectedList(selectedItem, newSelectedList);
        }
        yield put({ type: 'changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
      }
      yield take('changeSelectedListAndCheck/@@end');
      yield put({ type: 'changeActiveSelectedKey', payload: selectedKey });
      yield put({ type: 'changeAvoidDuplicationIndex', payload: avoidDuplicationIndex });
    },
    *changeSelectedListAndCheck(action, { put, select }) {
      const { activeTabKey, newSelectedList } = action.payload;
      const { orders } = yield select(state => state.commodity);
      const currentOrder = orders.filter(item => (item.key === activeTabKey))[0];
      const { wholeDiscount } = currentOrder;
      // 商品总价
      let goodsPrice = 0;
      // 商品零售总价
      let originPrice = 0;
      // 商品总重量
      let totalWeight = 0;
      const latestSelectedList = newSelectedList.map((item) => {
        // 单价优先级 => 修改过单价 > 会员价 > 零售价
        const unitPrice = (item.NewUnitPrice !== undefined) ?
          item.NewUnitPrice
          :
          item.CustomerPrice || item.RetailPrice;
        const retailPrice = item.RetailPrice;
        const count = item.Count;
        // 单品折扣
        const discount = item.Discount;
        // 单品重量
        const weight = item.Weight;
        // 单品销售价
        let realPrice = 0;
        if (item.isRefund) {
          realPrice = unitPrice * ((discount || 100) / 100);
        } else {
          realPrice = unitPrice * ((discount || 100) / 100) * ((wholeDiscount || 100) / 100);
        }
        // 单品总价
        const price = realPrice * count;
        goodsPrice += price;
        originPrice += retailPrice * count;
        totalWeight += weight * count;
        return { ...item, RealPrice: realPrice };
      });
      yield put({ type: 'changeSelectedList', payload: { activeTabKey, latestSelectedList } });
      yield put({ type: 'changeGoodsPrice', payload: goodsPrice });
      yield put({ type: 'changeOriginPrice', payload: originPrice });
      yield put({ type: 'changeTotalWeight', payload: totalWeight });
      const { shippingData } = currentOrder;
      const newShippingData = [{ ...(shippingData[0]), Weight: totalWeight }];
      yield put({ type: 'changeShippingDataAndSumCost', payload: newShippingData });
      yield put({ type: 'sumTotalPrice' });
    },
    *clickAddTabButton(action, { put, select }) {
      // 点击挂单按钮
      const tabType = action.payload;
      const commodity = yield select(state => state.commodity);
      const count = commodity.newTabIndex + 1;
      const currentTime = moment().format('HH:mm');
      const createTime = moment().format('YYYY-MM-DD HH:mm');
      // 初始化新单的信息
      yield put({
        type: 'addTab',
        payload: { count, tabType, currentTime, createTime },
      });
      // 根据新挂单的类型去获取对应的商品
      if (tabType === POS_TAB_TYPE.STORESALE) {
        // 本地销售
        yield put({ type: 'getStoreSaleGoods' });
      }
      if (tabType === POS_TAB_TYPE.MILKPOWDER) {
        // 奶粉/生鲜订单
        yield put({ type: 'getMilkPowderGoods' });
      }
      if (tabType === POS_TAB_TYPE.WHOLESALE) {
        // 批发
        yield put({ type: 'getStoreWholesaleGoods' });
      }
    },
    *changeActiveTabKeyAndCheck(action, { put, select }) {
      const activeTabKey = action.payload;
      yield put({ type: 'changeActiveTabKey', payload: activeTabKey });
      const commodity = yield select(state => state.commodity);
      const storeSaleGoodsList = getLocalStorage('storeSaleGoodsList') || [];
      const milkPowderGoodsList = getLocalStorage('milkPowderGoodsList') || [];
      const storeWholesaleGoodsList = getLocalStorage('storeWholesaleGoodsList') || [];
      // const { milkPowderGoodsList, storeWholesaleGoodsList } = commodity;
      const currentOrder = getCurrentOrder(commodity);
      const { type } = currentOrder;
      let currentOrderGoodsList = [];
      switch (type) {
        case POS_TAB_TYPE.STORESALE: {
          currentOrderGoodsList = storeSaleGoodsList;
          break;
        }
        case POS_TAB_TYPE.MILKPOWDER: {
          currentOrderGoodsList = milkPowderGoodsList;
          break;
        }
        case POS_TAB_TYPE.WHOLESALE: {
          currentOrderGoodsList = storeWholesaleGoodsList;
          break;
        }
        default: {
          currentOrderGoodsList = [];
        }
      }
      // yield put({ type: 'goodsListPagingHandler', payload: currentOrderGoodsList })
      yield put({ type: 'changeCurrentOrderGoodsList', payload: currentOrderGoodsList });
    },
    *clickTab(action, { put, select }) {
      const activeTabKey = action.payload;
      yield put({ type: 'changeActiveTabKeyAndCheck', payload: activeTabKey });
    },
    *clickRemoveButton(action, { put, select }) {
      const currentIndex = action.payload;
      const commodity = yield select(state => state.commodity);
      const removeKey = commodity.activeTabKey;
      const currentOrder = getCurrentOrder(commodity);
      const { orders } = commodity;
      let activeTabKey;
      yield put({ type: 'removeTab', payload: removeKey });
      // case1: panes 数量大于 1 且 activeOrders 不是最后一个
      if (orders.length > 1 && currentIndex !== orders.length - 1) {
        activeTabKey = orders[currentIndex + 1].key;
      }
      // case2: panes 数量大于 1 且 activeOrders 是最后一个
      if (orders.length > 1 && currentIndex === orders.length - 1) {
        activeTabKey = orders[currentIndex - 1].key;
      }
      // case3: panes 数量等于1, 确保始终有一个 TabPane
      if (orders.length === 1) {
        activeTabKey = orders[currentIndex].key;
      }
      yield put({ type: 'changeActiveTabKeyAndCheck', payload: activeTabKey });
    },
    *clickChangeSaleTypeButton(action, { put, select }) {
      const saleType = action.payload;
      if (saleType === SALE_TYPE.LOCAL) {
        yield put({ type: 'changeExpressDataAndSumCost', payload: [] });
        yield put({ type: 'changeShippingDataAndSumCost', payload: [] });
      }
      if (saleType === SALE_TYPE.EXPRESS) {
        yield put({ type: 'changeShippingDataAndSumCost', payload: [] });
      }
      if (saleType === SALE_TYPE.SHIPPING) {
        yield put({ type: 'changeExpressDataAndSumCost', payload: [] });
        yield put({ type: 'changeShippingDataAndSumCost', payload: [{ Name: { Name: '', ID: '' }, Weight: 0, WeightedWeight: 0.3, UnitPrice: 0, RealPrice: 0, InvoiceNo: '', ID: 0 }] });
      }
      const { orders, activeTabKey, currentOrderGoodsList } = yield select(state => state.commodity);
      const currentOrder = orders.filter(item => (item.key === activeTabKey))[0];
      const { selectedList, type, customer } = currentOrder;
      const customerType = customer.memberType;
      const newSelectedList = selectedList.map(item => ({
        ...item,
        SaleType: saleType,
        CustomerPrice: getGoodsItemCustomerPrice(
          type,
          saleType,
          customerType,
          item.RetailPrice,
          item.PlatinumPrice,
          item.DiamondPrice,
          item.VIPPrice,
          item.SVIPPrice
        ),
      }));
      const newCurrentOrderGoodsList = currentOrderGoodsList.map(item => ({
        ...item, CustomerPrice: getGoodsItemCustomerPrice(type, saleType, customerType, item.RetailPrice, item.PlatinumPrice, item.DiamondPrice, item.VIPPrice, item.SVIPPrice),
      }));
      yield put({ type: 'changeCurrentOrderGoodsList', payload: newCurrentOrderGoodsList });
      yield put({ type: 'changeSaleType', payload: saleType });
      yield put({ type: 'changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
    },
    *changeWholeDiscountInput(action, { put, select }) {
      const wholeDiscount = action.payload;
      if (typeof wholeDiscount !== 'number' || wholeDiscount > 100 || wholeDiscount < 0) { return; }
      const commodity = yield select(state => state.commodity);
      const { activeTabKey } = commodity;
      const currentOrder = getCurrentOrder(commodity);
      const { selectedList } = currentOrder;
      const newSelectedList = selectedList.map(item => ({
        ...item,
        WholeDiscount: wholeDiscount,
      }));
      yield put({ type: 'changeWholeDiscount', payload: wholeDiscount });
      yield put({ type: 'changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
    },
    *clickAddBoxButton(action, { put, select }) {
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
      const { expressData, expressDataIndex } = currentOrder;
      const newMember = {
        ID: `NEW_BOX_ID_${expressDataIndex}`,
        Name: { Name: '', ID: '' },
        Weight: 0,
        WeightedWeight: 0.3,
        UnitPrice: 0,
        RealPrice: 0,
        InvoiceNo: '',
      };
      const newExpressData = [...expressData, newMember];
      yield put({ type: 'changeExpressData', payload: newExpressData });
      yield put({ type: 'changeExpressDataIndex', payload: expressDataIndex });
    },
    *changeExpressDataAndSumCost(action, { put }) {
      const expressData = action.payload;
      yield put({ type: 'changeExpressData', payload: expressData });
      yield put({ type: 'sumExpressCost', payload: expressData });
    },
    *changeShippingDataAndSumCost(action, { put }) {
      const shippingData = action.payload;
      yield put({ type: 'changeShippingData', payload: shippingData });
      yield put({ type: 'sumShippingCost', payload: shippingData });
    },
    *sumExpressCost(action, { put }) {
      const expressData = action.payload;
      let expressCost = 0;
      expressData.forEach((item) => {
        item.UnitPrice && (expressCost += calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight));
      });
      yield put({ type: 'changeExpressCost', payload: expressCost });
      yield put({ type: 'sumTotalPrice' });
    },
    *sumShippingCost(action, { put }) {
      const shippingData = action.payload;
      let shippingCost = 0;
      shippingData.forEach((item) => {
        item.UnitPrice && (shippingCost += calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight));
      });
      yield put({ type: 'changeShippingCost', payload: shippingCost });
      yield put({ type: 'sumTotalPrice' });
    },
    *sumTotalPrice(action, { put, select }) {
      const commodity = yield select(state => state.commodity);
      const currentOrder = getCurrentOrder(commodity);
      const { goodsPrice, expressCost, shippingCost } = currentOrder;
      const totalPrice = goodsPrice + expressCost + shippingCost;
      yield put({ type: 'changeTotalPrice', payload: totalPrice });
      yield put({ type: 'checkPaymentData' });
    },
  },

  reducers: {
    addTab(state, action) {
      const { count, tabType, currentTime, createTime } = action.payload;
      const goodsOrders = state.orders;
      const currentUser = Cookies.getJSON('currentUser');
      const { DepartmentID, ShopName } = currentUser;
      const orders = [
        ...goodsOrders,
        {
          title: count,
          key: `orders-${count}`,
          selectedList: [],
          activeSelectedKey: null,
          paymentDataIndex: 0,
          paymentData: [],
          activePaymentDataIndex: null,
          originPrice: 0,
          goodsPrice: 0,
          expressDataIndex: 0,
          expressData: [],
          shippingData: [{ Name: { Name: '', ID: '' }, Weight: 0, WeightedWeight: 0.3, UnitPrice: 0, RealPrice: 0, InvoiceNo: '', ID: 0 }],
          expressCost: 0,
          shippingCost: 0,
          totalPrice: 0,
          receiveMoney: 0,
          changeMoney: 0,
          type: tabType,
          currentTime,
          createTime,
          saleType: tabType === POS_TAB_TYPE.STORESALE ? SALE_TYPE.LOCAL : null,
          customer: {
            memberID: '',
            memberName: '',
            memberAddress: '',
            memberEmail: '',
            memberPhone: '',
            memberType: '',
            memberScore: '',
            memberCardNumber: '',
            memberDiscount: '',
          },
          shop: {
            departmentID: DepartmentID,
            shopName: ShopName,
          },
          avoidDuplicationIndex: 0,
          targetPhase: POS_PHASE.TABLE,
          lastPhase: POS_PHASE.TABLE,
          totalWeight: 0,
          wholeDiscount: 100,
          chooseCalculatorButton: {},
          // hasFetchMilkPowderWaybill: false,
          SenderName: '',
          SenderPhoneNumber: '',
          ReceiverName: '',
          ReceiverPhoneNumber: '',
          ReceiverIDNumber: '',
          ReceiverAddress: {
            ID: [],
            Province: '',
            City: '',
            District: '',
          },
          ReceiverDetailedAddress: '',
        },
      ];
      const activeTabKey = `orders-${count}`;
      return { ...state, orders, activeTabKey, newTabIndex: count };
    },
    removeTab(state, action) {
      const activeTabKey = action.payload;
      const orders = state.orders.filter(item => item.key !== activeTabKey);
      if (orders.length > 0) {
        return { ...state, orders };
      }
      return state;
    },
    changeActiveTabKey(state, action) {
      const activeTabKey = action.payload;
      return { ...state, activeTabKey };
    },
    changeCommodityContent(state, action) {
      const { activeTabKey } = state;
      const currentOrder = state.orders.filter(item => (item.key === activeTabKey))[0];
      const { type } = currentOrder;
      const content = action.payload || [];
      switch (type) {
        case POS_TAB_TYPE.MILKPOWDER: {
          return { ...state, milkPowderGoodsList: content };
        }
        default: {
          return state;
        }
      }
    },
    toggleSelectedGoods(state, action) {
      const activeSelectedKey = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, activeSelectedKey };
        } return item;
      });
      return { ...state, orders: newOrders };
    },
    changeGoodsPrice(state, action) {
      const goodsPrice = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, goodsPrice };
        } return item;
      });
      return { ...state, orders: newOrders };
    },
    changeOriginPrice(state, action) {
      const originPrice = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, originPrice };
        } return item;
      });
      return { ...state, orders: newOrders };
    },
    changeTotalWeight(state, action) {
      const totalWeight = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, totalWeight };
        } return item;
      });
      return { ...state, orders: newOrders };
    },
    changeCalculateType(state, action) {
      const calculateType = action.payload;
      const { activeTabKey } = state;
      const currentOrder = state.orders.filter(item => (item.key === activeTabKey))[0];
      const selectedList = currentOrder.selectedList;
      const { activeSelectedKey } = currentOrder;
      const newSelectedList = selectedList.map((item) => {
        if (item.Key === activeSelectedKey) {
          // return { ...item, CalculateType: calculateType, CacheCount: null, CacheDiscount: null, CacheUnitPrice: null };
          return { ...item, CalculateType: calculateType };
        }
        return item;
      });
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, selectedList: newSelectedList };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeSelectedList(state, action) {
      const { activeTabKey, latestSelectedList } = action.payload;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, selectedList: latestSelectedList };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeActiveSelectedKey(state, action) {
      const activeSelectedKey = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, activeSelectedKey };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeAvoidDuplicationIndex(state, action) {
      const avoidDuplicationIndex = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, avoidDuplicationIndex };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changePosPhase(state, action) {
      const { activeTabKey, lastPhase, targetPhase } = action.payload;
      const newOrders = state.orders.map((item) => {
        if (item.key && item.key === activeTabKey) {
          return { ...item, lastPhase, targetPhase };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeSaleType(state, action) {
      const saleType = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, saleType };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changePaymentData(state, action) {
      const paymentData = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, paymentData };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changePaymentDataIndex(state, action) {
      let paymentDataIndex = action.payload;
      const { activeTabKey } = state;
      paymentDataIndex += 1;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, paymentDataIndex };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeExpressDataIndex(state, action) {
      let expressDataIndex = action.payload;
      const { activeTabKey } = state;
      expressDataIndex += 1;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, expressDataIndex };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeExpressData(state, action) {
      const expressData = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, expressData };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeExpressCost(state, action) {
      const expressCost = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, expressCost };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeShippingCost(state, action) {
      const shippingCost = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, shippingCost };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeShippingData(state, action) {
      const shippingData = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, shippingData };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeTotalPrice(state, action) {
      const totalPrice = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, totalPrice };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeChangeMoney(state, action) {
      const changeMoney = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, changeMoney };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeReceiveMoney(state, action) {
      const receiveMoney = keepTwoDecimals(action.payload);
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, receiveMoney };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeActivePaymentDataIndex(state, action) {
      let activePaymentDataIndex = action.payload;
      const { activeTabKey } = state;
      const currentOrder = getCurrentOrder(state);
      const { paymentData } = currentOrder;
      if (paymentData.length === 0) {
        activePaymentDataIndex = null;
      } else if (!paymentData[activePaymentDataIndex]) {
        activePaymentDataIndex = 0;
      }
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, activePaymentDataIndex };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeCommonLoading(state, action) {
      const commonLoading = action.payload;
      return { ...state, commonLoading };
    },
    saveCustomerList(state, action) {
      const customerList = action.payload;
      return { ...state, customerList };
    },
    changeCurrentOrderGoodsList(state, action) {
      const currentOrderGoodsList = action.payload;
      return { ...state, currentOrderGoodsList };
    },
    saveMilkPowderGoodsList(state, action) {
      const milkPowderGoodsList = action.payload;
      setLocalStorage('milkPowderGoodsList', milkPowderGoodsList);
      // return { ...state, milkPowderGoodsList };
      return state;
    },
    saveStoreSaleGoodsList(state, action) {
      const storeSaleGoodsList = action.payload;
      setLocalStorage('storeSaleGoodsList', storeSaleGoodsList);
      // return { ...state, storeSaleGoodsList };
      return state;
    },
    saveStoreWholesaleGoodsList(state, action) {
      const storeWholesaleGoodsList = action.payload;
      setLocalStorage('storeWholesaleGoodsList', storeWholesaleGoodsList);
      // return { ...state, storeWholesaleGoodsList };
      return state;
    },
    changeOrderID(state, action) {
      const ID = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, ID };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changePaginationTotal(state, action) {
      const { pagination } = state;
      const total = action.payload;
      const newPagination = { ...pagination, total };
      return { ...state, pagination: newPagination };
    },
    changePaginationPagingData(state, action) {
      const { pagination } = state;
      const pagingData = action.payload;
      const newPagination = { ...pagination, pagingData };
      return { ...state, pagination: newPagination };
    },
    changePaginationCurrent(state, action) {
      const { pagination } = state;
      const current = action.payload;
      const newPagination = { ...pagination, current };
      return { ...state, pagination: newPagination };
    },
    saveCurrentCustomer(state, action) {
      const customer = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, customer };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeWholeDiscount(state, action) {
      const wholeDiscount = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, wholeDiscount };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    saveRefundOrderDetail(state, action) {
      const refundOrderDetail = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, refundOrderDetail };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    changeReceiverAddress(state, action) {
      const address = action.payload;
      const { activeTabKey } = state;
      const newOrders = state.orders.map((item) => {
        if (item.key === activeTabKey) {
          return { ...item, ...address };
        }
        return item;
      });
      return { ...state, orders: newOrders };
    },
    // changeHasFetchMilkPowderWaybill(state, _) {
    //   const { activeTabKey } = state;
    //   const newOrders = state.orders.map((item) => {
    //     if (item.key === activeTabKey) {
    //       return { ...item, hasFetchMilkPowderWaybill: true };
    //     }
    //     return item;
    //   });
    //   return { ...state, orders: newOrders };
    // },
  },
};
