import request from 'utils/request';
import { DOMAIN } from 'constant';
import { generateParameterInUrl } from 'utils/utils';

// 查询历史订单
export async function getHistoryOrdersAPI(payload) {
  const { value, pagination } = payload;
  const options = {
    body: `PayTime=${value}&PageSize=${pagination.pageSize}&PageNum=${pagination.current}`,
  };
  return request(`${DOMAIN}/Order/getOrder`, options);
}

// 查询订单详情
export async function getHistoryOrderDetailsAPI(ID) {
  const options = {
    body: `ID=${ID}`,
  };
  return request(`${DOMAIN}/Order/getOrderDetail`, options);
}

// 查询订单小票必须参数
export async function getHistoryOrderReceiptAPI(ID) {
  const options = {
    body: `OrderID=${ID}`,
  };
  return request(`${DOMAIN}/Order/getPrint`, options);
}

// 查询每日销售数据
export async function getDailyOrdersAPI(payload) {
  const { value } = payload;
  const options = {
    body: `${generateParameterInUrl(value)}`,
  };
  return request(`${DOMAIN}/Order/getOrderByTime`, options);
}

// 推送奶粉订单
export async function pushMilkPowderOrderAPI(payload) {
  const { value } = payload;
  const options = {
    body: `${generateParameterInUrl(value)}`,
  };
  return request(`${DOMAIN}/Order/PushMilkOrder`, options);
}
