import fetch from 'dva/fetch';
import { notification, message } from 'antd';
import { routerRedux } from 'dva/router';
import store from '../index';
import { DOMAIN } from '../constant';
import Cookies from 'js-cookie';


const codeMessage = {
  // 本地后台代码
  100: 'token已过期，请重新登陆',
  101: '记录日志失败',
  102: '用户名密码错误',
  0: '后台网络不通',
  // 通用代码
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}
function checkAgain(responseJson) {
  if (responseJson) {
    const { Message, Result, Status } = responseJson
    if (Status === 1) {
      Cookies.set('token', responseJson.Result.Token || '', { expires: 1, path: '' })
      Cookies.set('sysUserID', responseJson.Result.SysUserID || '', { expires: 1, path: '' })
      return responseJson
    }
    const errortext = codeMessage[Status] || Message;
    notification.error({
      message: `请求错误 ${Status}: ${Message}`,
      description: errortext,
    });
    const error = new Error(errortext);
    error.name = Status;
    error.response = responseJson;
    console.log('error', error)
    throw error;
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
// export default function request(url, options) {
//   const defaultOptions = {
//     credentials: 'include',
//   };
//   const newOptions = { ...defaultOptions, ...options };
//   if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
//     if (!(newOptions.body instanceof FormData)) {
//       newOptions.headers = {
//         Accept: 'application/json',
//         'Content-Type': 'application/json; charset=utf-8',
//         ...newOptions.headers,
//       };
//       newOptions.body = JSON.stringify(newOptions.body);
//     } else {
//       // newOptions.body is FormData
//       newOptions.headers = {
//         Accept: 'application/json',
//         'Content-Type': 'multipart/form-data',
//         ...newOptions.headers,
//       };
//     }
//   }

//   return fetch(url, newOptions)
//     .then(checkStatus)
//     .then((response) => {
//       if (newOptions.method === 'DELETE' || response.status === 204) {
//         return response.text();
//       }
//       return response.json();
//     })
//     .catch((e) => {
//       const { dispatch } = store;
//       const status = e.name;
//       if (status === 401) {
//         dispatch({
//           type: 'login/logout',
//         });
//         return;
//       }
//       if (status === 403) {
//         dispatch(routerRedux.push('/exception/403'));
//         return;
//       }
//       if (status <= 504 && status >= 500) {
//         dispatch(routerRedux.push('/exception/500'));
//         return;
//       }
//       if (status >= 404 && status < 422) {
//         dispatch(routerRedux.push('/exception/404'));
//       }
//     });
// }
export default function request(url, options = {}) {
  if (url.includes(DOMAIN)) {
    const defaultOptions = {
      // credentials: 'include',
    };
    const token = Cookies.get('token') || ''
    const sysUserID = Cookies.get('sysUserID') || ''
    // let initBody = `Token=!QAZ@WSX12345&SysUserID=administrator`
    let initBody = `Token=${token}&SysUserID=${sysUserID}`
    const tempOptions = { ...defaultOptions, ...options };
    const newOptions = {
      ...tempOptions,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      body: encodeURI(`${initBody}&${tempOptions.body || ''}`),
    }

    return fetch(url, newOptions)
      .then(checkStatus)
      .then(response => response.json())
      .then(checkAgain)
      .catch((error) => {
        const { dispatch } = store;
        const status = error.name;
        if (status === 100) {
          dispatch({
            type: 'login/logout',
          });
          return;
        }
        if (status === 101) {
          dispatch({
            type: 'login/logout',
          })
          return;
        }
        if (status === 102) {
          dispatch({
            type: 'login/logoutUnRedirect',
          });
          return;
        }
        if (status === 401) {
          dispatch({
            type: 'login/logout',
          });
          return;
        }
        if (status === 403) {
          dispatch(routerRedux.push('/exception/403'));
          return;
        }
        if (status <= 504 && status >= 500) {
          dispatch(routerRedux.push('/exception/500'));
          return;
        }
        if (status >= 404 && status < 422) {
          dispatch(routerRedux.push('/exception/404'));
        }
        if (error.code) {
          notification.error({
            message: error.name,
            description: error.message,
          });
        }
        if ('stack' in error && 'message' in error) {
          notification.error({
            message: `请求错误: ${url}`,
            description: error.message,
          });
        }
        // return error;
        return
      });
  } else {
    const defaultOptions = {
      credentials: 'include',
    };
    const newOptions = { ...defaultOptions, ...options };

    if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    }

    return fetch(url, newOptions)
      .then(checkStatus)
      .then(response => response.json())
      .catch((error) => {
        if (error.code) {
          notification.error({
            message: error.name,
            description: error.message,
          });
        }
        if ('stack' in error && 'message' in error) {
          notification.error({
            message: `请求错误: ${url}`,
            description: error.message,
          });
        }
        return error;
      });
  }

}
