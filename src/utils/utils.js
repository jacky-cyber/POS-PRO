import moment from 'moment';
import { POS_TAB_TYPE, SALE_TYPE } from '../constant';

export function isValueValid(value) {
  // 处理 null 和 undefined
  if (value == null) { return false; }
  // 数组
  if (value.constructor.name === 'Array') { return value.length > 0; }
  // 字符串
  if (value.constructor.name === 'String') { return !!value; }
  // 对象
  if (value.constructor.name === 'Object') {
    return Object.keys(value).length > 0;
  }
  // 数值
  if (value.constructor.name === 'Number') {
    return !!value || value === 0;
  }
  // 函数和布尔值
  return !!value;
}

export function generateParameterInUrl(payload) {
  if (!payload) {
    return '';
  }
  const array = Object.keys(payload);
  const newArray = array.map(
    item => (
      `${item}=${payload[item] === undefined ? '' : payload[item]}`
    )
  );
  return newArray.join('&');
}

export function formatToDecimals(val, count = 0) {
  const value = parseFloat(val);
  if (value === 0) return 0;
  const isNumber = isNaN(value);
  if (isNumber) {
    return '/';
  } else {
    return value.toFixed(count) - 0;
  }
}

export function formatToPercentage(val, count = 0) {
  const value = parseFloat(val);
  let newValue;
  if (value === 0) return '0%';
  const isNumber = isNaN(value);
  if (isNumber) {
    return '/';
  } else {
    newValue = value * 100;
  }
  const result = formatToDecimals(newValue, count);
  return `${result}%`;
}

export function setLocalStorage(key, value) {
  if (value === null) return;
  if (typeof value === 'undefined') return;
  if (typeof value === 'function') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

export function keepTwoDecimals(val) {
  if (val === 0) return 0;
  if (!val) return;
  return parseFloat(val).toFixed(2) - 0;
}

export function getGoodsItemCustomerPrice(
  type,
  saleType,
  customerType,
  retailPrice,
  platinumPrice,
  diamondPrice,
  VIPPrice,
  SVIPPrice,
  wholesalePrice,
  secondWholesalePrice
) {
  let customerPrice = 0;
  // 批发价暂时只有一个一级批发价
  if (type === POS_TAB_TYPE.WHOLESALE) {
    return formatToDecimals(wholesalePrice, 2);
  }
  // 奶粉生鲜只有一个价格体系，先用 VIP 如果 VIP 没有就用零售价
  if (type === POS_TAB_TYPE.MILKPOWDER) {
    if (VIPPrice) {
      return formatToDecimals(VIPPrice, 2);
    } else {
      return formatToDecimals(retailPrice, 2);
    }
  }
  // 门店销售分为本地拿走/直邮/代发
  if (type === POS_TAB_TYPE.STORESALE) {
    // 本地拿走销售
    if (saleType === SALE_TYPE.LOCAL) {
      // 本地拿走销售没有会员就是零售价
      if (!customerType) {
        return formatToDecimals(retailPrice, 2);
      }
      // 本地销售的会员价格体系
      switch (customerType) {
        case 1:
          customerPrice = retailPrice;
          break;
        case 2:
          customerPrice = platinumPrice;
          break;
        case 3:
          customerPrice = diamondPrice;
          break;
        case 4:
          customerPrice = SVIPPrice;
          break;
        default:
          customerPrice = retailPrice;
          break;
      }
    }
    // 直邮和代发走一个价格体系
    if (saleType === SALE_TYPE.EXPRESS || saleType === SALE_TYPE.SHIPPING) {
      switch (customerType) {
        case 4:
          customerPrice = SVIPPrice;
          break;
        default:
          customerPrice = VIPPrice;
          break;
      }
    }
  }
  return formatToDecimals(customerPrice, 2);
}
// 分界线
// if (type === POS_TAB_TYPE.STORESALE || type === POS_TAB_TYPE.MILKPOWDER) {
//   if (saleType === SALE_TYPE.LOCAL) {
//     switch (customerType) {
//       case 1:
//         customerPrice = retailPrice;
//         break;
//       case 2:
//         customerPrice = platinumPrice;
//         break;
//       case 3:
//         customerPrice = diamondPrice;
//         break;
//       case 4:
//         customerPrice = diamondPrice;
//         break;
//       default:
//         customerPrice = retailPrice;
//         break;
//     }
//   } else if (saleType === SALE_TYPE.EXPRESS || saleType === SALE_TYPE.SHIPPING) {
//     switch (customerType) {
//       case 1:
//         customerPrice = retailPrice;
//         break;
//       case 2:
//         customerPrice = platinumPrice;
//         break;
//       case 3:
//         customerPrice = VIPPrice;
//         break;
//       case 4:
//         customerPrice = SVIPPrice;
//         break;
//       default:
//         customerPrice = retailPrice;
//         break;
//     }
//   } else if (!saleType) {
//     customerPrice = retailPrice;
//   }
// }

export function calculateExpressOrShippingCost(unitPrice, weight, weightedWeight) {
  const totalWeight = weight + weightedWeight;
  if (!unitPrice) { return 0; }
  if (totalWeight <= 0) {
    return 0;
  } else if (totalWeight <= 1) {
    return unitPrice;
  } else if (totalWeight >= 1) {}
  return unitPrice * totalWeight;
}


export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}


function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!');  // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(routePath =>
    routePath.indexOf(path) === 0 && routePath !== path);
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}


/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}
