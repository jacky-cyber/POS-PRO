import request from '../utils/request';
import { DOMAIN } from '../constant';

// 一间生成订单

export async function orderGenerateAPI(_) {
  return request(`${DOMAIN}/Cargo/generate`);
}
