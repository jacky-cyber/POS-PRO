import request from 'utils/request';
import { generateParameterInUrl } from 'utils/utils';
import { DOMAIN } from 'constant';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

// 用户账号管理-查询
export async function getUserAPI() {
  const options = {};
  return request(`${DOMAIN}/SysUser/GetAll`, options);
}
// 用户账号管理-添加
export async function addOrUpdateUserAPI(payload) {
  const parameterString = generateParameterInUrl(payload);
  const options = {
    body: `${parameterString}`,
  };
  return request(`${DOMAIN}/SysUser/AddOrUpdate`, options);
}
// 用户账号管理-添加部门
export async function addDepartmentAPI(payload) {
  const parameterString = generateParameterInUrl(payload);
  const options = {
    body: `${parameterString}`,
  };
  return request(`${DOMAIN}/SysUser/AddDepartment`, options);
}
// 用户账号管理-查询部门
export async function getDepartmentAPI(payload) {
  const parameterString = generateParameterInUrl(payload);
  const options = {
    body: `${parameterString}`,
  };
  return request(`${DOMAIN}/SysUser/getDepartment`, options);
}
