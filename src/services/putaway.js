import request from 'utils/request';
import { DOMAIN } from 'constant';
import { generateParameterInUrl } from 'utils/utils';

// 查询上架商品
export async function getGoodsForPutawayAPI(payload) {
  const { value = '', pagination = {} } = payload;
  const { current = 1, pageSize = 10 } = pagination;
  const options = {
    body: `Name=${value}&PageSize=${pageSize}&PageNum=${current}`,
  };
  return request(`${DOMAIN}/Product/GetAll`, options);
}

// 删除上架商品
export async function deleteGoodsForPutawayAPI(payload) {
  const options = {
    body: `ID=${payload}`,
  };
  return request(`${DOMAIN}/Product/Delete`, options);
}

// 提交或更新订单详情
export async function addOrUpdateGoodsForPutawayAPI(payload) {
  const options = {
    body: `${generateParameterInUrl(payload)}`,
  };
  return request(`${DOMAIN}/Product/AddOrUpdate`, options);
}
