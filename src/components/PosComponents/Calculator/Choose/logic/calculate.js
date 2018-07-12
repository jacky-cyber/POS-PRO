import { POS_PHASE } from 'constant';
import isNumber from '../../isNumber';

function generateNewSelectedList(activeSelectedKey, selectedList, cache, number, type) {
  return selectedList.map((item) => {
    if (item.Key === activeSelectedKey) {
      switch (type) {
        case 'count':
        // 退货的话数量是负数
          return { ...item, CacheCount: cache, Count: item.isRefund ? -number : number };
        case 'discount':
          return { ...item, CacheDiscount: cache, Discount: number };
        case 'unitPrice':
          return { ...item, CacheUnitPrice: cache, NewUnitPrice: number };
        default:
          return item;
      }
    }
    return item;
  });
}

function numberHandler(oldCache, buttonName, activeTabKey, selectedList, activeSelectedKey, type, dispatch) {
  let cache;
  if (oldCache) {
    cache = oldCache.toString() + buttonName;
  } else {
    cache = buttonName;
  }
  const number = cache - 0;
  const newSelectedList = generateNewSelectedList(activeSelectedKey, selectedList, cache, number, type);
  dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
}

function clearHandler(oldCache, activeTabKey, selectedList, activeSelectedKey, type, dispatch) {
  if (!oldCache) { return; }
  const cache = null;
  let number = 0;
  if (type === 'unitPrice') { number = null; }
  const newSelectedList = generateNewSelectedList(activeSelectedKey, selectedList, cache, number, type);
  dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
}

function dotHandler(oldCache, buttonName, activeTabKey, selectedList, activeSelectedKey, type, dispatch) {
  let cache;
  let number;
  if (!oldCache) {
    cache = '0.';
    number = 0;
  } else {
    if (oldCache.indexOf('.') !== -1) { return; }
    cache = oldCache.toString() + buttonName;
    number = cache - 0;
  }
  const newSelectedList = generateNewSelectedList(activeSelectedKey, selectedList, cache, number, type);
  dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
}

function delHandler(oldCache, buttonName, activeTabKey, selectedList, activeSelectedKey, type, dispatch) {
  let cache;
  let number;
  if (!oldCache) {
    return;
  } else {
    const length = oldCache.length;
    cache = oldCache.slice(0, length - 1);
    number = cache - 0;
  }
  const newSelectedList = generateNewSelectedList(activeSelectedKey, selectedList, cache, number, type);
  dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
}

function countHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey) {
  const oldCacheCount = selectedItem.CacheCount;
  let newSelectedList;
  let CacheCount;
  if (isNumber(buttonName)) {
    numberHandler(oldCacheCount, buttonName, activeTabKey, selectedList, activeSelectedKey, 'count', dispatch);
    return;
  }
  if (buttonName === 'clear') {
    let filterIndex;
    let tempActiveKey;
    newSelectedList = selectedList.filter((item, index) => {
      if (item.Key === selectedItem.Key) {
        filterIndex = index;
      }
      return (item.Key !== selectedItem.Key);
    }).map((item, index) => {
      if (filterIndex === 0) {
        if (index === 0) {
          tempActiveKey = item.Key;
        }
        return item;
      } else {
        if (index === filterIndex - 1) {
          tempActiveKey = item.Key;
        }
        return item;
      }
    });
    dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList, activeSelectedKey } });
    if (tempActiveKey !== undefined) {
      dispatch({ type: 'commodity/changeActiveSelectedKey', payload: tempActiveKey });
    }
  }
  if (buttonName === '.') {
    return;
    dotHandler(oldCacheCount, buttonName, activeTabKey, selectedList, activeSelectedKey, 'count', dispatch);
  }
  if (buttonName === 'del') {
    delHandler(oldCacheCount, buttonName, activeTabKey, selectedList, activeSelectedKey, 'count', dispatch);
  }
}
function discountHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey) {
  const oldCacheDiscount = selectedItem.CacheDiscount;
  let newSelectedList;
  let CacheDiscount;
  if (isNumber(buttonName)) {
    if (oldCacheDiscount) {
      CacheDiscount = oldCacheDiscount.toString() + buttonName;
    } else {
      CacheDiscount = buttonName;
    }
    let Discount = CacheDiscount - 0;
    if (Discount > 100) {
      Discount = 100;
      CacheDiscount = '100';
    }
    newSelectedList = selectedList.map((item) => {
      if (item.Key === activeSelectedKey) {
        return { ...item, CacheDiscount, Discount };
      }
      return item;
    });
    dispatch({ type: 'commodity/changeSelectedListAndCheck', payload: { activeTabKey, newSelectedList } });
  }
  if (buttonName === 'clear') {
    clearHandler(oldCacheDiscount, activeTabKey, selectedList, activeSelectedKey, 'discount', dispatch);
  }
  if (buttonName === 'del') {
    delHandler(oldCacheDiscount, buttonName, activeTabKey, selectedList, activeSelectedKey, 'discount', dispatch);
  }
}

function unitPriceHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey) {
  const oldCacheUnitPrice = selectedItem.CacheUnitPrice;
  if (isNumber(buttonName)) {
    numberHandler(oldCacheUnitPrice, buttonName, activeTabKey, selectedList, activeSelectedKey, 'unitPrice', dispatch);
  }
  if (buttonName === 'clear') {
    clearHandler(oldCacheUnitPrice, activeTabKey, selectedList, activeSelectedKey, 'unitPrice', dispatch);
  }
  if (buttonName === '.') {
    dotHandler(oldCacheUnitPrice, buttonName, activeTabKey, selectedList, activeSelectedKey, 'unitPrice', dispatch);
  }
  if (buttonName === 'del') {
    delHandler(oldCacheUnitPrice, buttonName, activeTabKey, selectedList, activeSelectedKey, 'unitPrice', dispatch);
  }
}

export default function calculate(commodity, dispatch, buttonName) {
  const { activeTabKey } = commodity;
  const currentOrder = commodity.orders.filter(item => (item.key === activeTabKey))[0];
  const { selectedList, targetPhase: currentPhase } = currentOrder;
  // 跳转到选择客户界面
  if (buttonName === 'customer') {
    dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.CUSTOMER } });
    return;
  }
  // 如果购物车里面没东西，直接 return
  if (!selectedList || (Array.isArray(selectedList) && selectedList.length === 0)) { return; }
  const { activeSelectedKey } = currentOrder;
  const selectedItem = currentOrder.selectedList.filter(item => (item.Key === activeSelectedKey))[0];
  const calculateType = selectedItem.CalculateType;
  // 切换不同的计算状态
  if (buttonName === 'count' || buttonName === 'discount' || buttonName === 'unitPrice') {
    if (selectedItem.CalculateType === buttonName) { return; }
    dispatch({ type: 'commodity/changeCalculateType', payload: buttonName });
    return;
  }
  if (buttonName === 'warehouse') {
    return;
  }
  if (buttonName === 'allocateAndTransfer') {
    return;
  }
  if (buttonName === 'payment') {
    const { ID = '' } = currentOrder;
    const { chooseCalculatorButton, ...newCurrentOrder } = currentOrder;
    const currentOrderJson = JSON.stringify(newCurrentOrder);
    dispatch({ type: 'commodity/addOrUpdateCacheOrder', payload: { ID, order: currentOrderJson } });
    // const targetPhase = POS_PHASE.PAY;
    // dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase } });
    return;
  }
  // 数量计算逻辑
  if (calculateType === 'count') {
    countHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey);
    return;
  }
  // 折扣计算逻辑
  if (calculateType === 'discount') {
    discountHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey);
    return;
  }
  // 单价计算逻辑
  if (calculateType === 'unitPrice') {
    unitPriceHandler(dispatch, buttonName, activeTabKey, selectedList, selectedItem, activeSelectedKey);
  }
}
