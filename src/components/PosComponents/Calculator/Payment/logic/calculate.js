import isNumber from '../../isNumber';

function generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number) {
  return paymentData.map((item, index) => {
    if (index === activePaymentDataIndex) {
      return { ...item, cacheCash: cache, cash: number };
    }
    return item;
  });
}
function numberHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
  let cache;
  if (buttonName.indexOf('+') !== -1) {
    buttonName = buttonName.slice(1, buttonName.length);
    if (oldCache) {
      cache = (oldCache - 0 + (buttonName - 0)).toString();
    } else {
      cache = buttonName;
    }
  } else if (oldCache) {
    cache = oldCache.toString() + buttonName;
  } else {
    cache = buttonName;
  }
  const number = cache - 0;
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}
function clearHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
  if (!oldCache) { return; }
  const cache = null;
  const number = 0;
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}

function dotHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
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
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}

function delHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
  let cache;
  let number;
  if (!oldCache) {
    return;
  } else {
    const length = oldCache.length;
    cache = oldCache.slice(0, length - 1);
    number = cache - 0;
  }
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}

function toggleHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
  let cache;
  let number;
  if (!oldCache) {
    return;
  } else {
    if (oldCache[0] === '-') {
      cache = oldCache.replace('-', '');
    } else {
      cache = `-${oldCache}`;
    }
    number = cache - 0;
  }
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}

function plusHandler(oldCache, buttonName, activePaymentDataIndex, paymentData, dispatch) {
  let cache;
  let number;
  if (!oldCache) {
    return;
  } else {
    cache = `${(oldCache - 0) + (buttonName.replace('plus', '') - 0)}`;
    number = cache - 0;
  }
  const newPaymentData = generateNewPaymentData(paymentData, activePaymentDataIndex, cache, number);
  dispatch({ type: 'commodity/changePaymentDataAndCheck', payload: newPaymentData });
}


function cashHandler(dispatch, buttonName, paymentData, activePaymentDataIndex, paymentDataItem) {
  const oldCacheCash = paymentDataItem.cacheCash;
  let newPaymentDataItem;
  let cacheCash;
  if (isNumber(buttonName)) {
    numberHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
  if (buttonName === 'clear') {
    clearHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
  if (buttonName === '.') {
    dotHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
  if (buttonName === 'del') {
    delHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
  if (buttonName === 'toggle') {
    toggleHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
  if (buttonName.includes('plus')) {
    plusHandler(oldCacheCash, buttonName, activePaymentDataIndex, paymentData, dispatch);
  }
}

export default function calculate(commodity, dispatch, buttonName) {
  const { activeTabKey } = commodity;
  const currentOrder = commodity.orders.filter(item => (item.key === activeTabKey))[0];
  const { paymentData, activePaymentDataIndex } = currentOrder;
  if (!paymentData || (Array.isArray(paymentData) && paymentData.length === 0) || (activePaymentDataIndex === null)) { return; }
  const paymentDataItem = paymentData.filter((item, index) => (index === activePaymentDataIndex))[0];
  cashHandler(dispatch, buttonName, paymentData, activePaymentDataIndex, paymentDataItem);
}
