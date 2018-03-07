import { isUrl } from '../utils/utils';
import Cookies from 'js-cookie';

    Cookies.set('authority', ['pos', 'express'], { expires: 7, path: '' })

const menuData = [{
  name: 'POS系统',
  icon: 'shopping-cart',
  path: 'pos',
  ID: 'pos',
}, {
  name: '快递管理',
  icon: 'rocket',
  path: 'express',
  ID: 'express',
}, {
  name: '日结管理',
  icon: 'line-chart',
  path: 'dailyClosing',
  ID: 'dailyClosing',
  children: [{
    name: '数据统计',
    path: 'statistics',
  }, {
    name: '现金收款复查',
    path: 'cashStatistics',
  },]
}, {
  name: '订货管理',
  icon: 'shop',
  path: 'orderGoods',
  ID: 'orderGoods',
  children: [
    {
      name: '发起订货',
      path: 'placeAnOrder',
    }, {
      name: '订单管理',
      path: 'orderManagement',
    }
  ]
},
{
  name: '历史订单',
  icon: 'exception',
  path: 'historyOrders',
  ID: 'historyOrders',
},
{
  name: '用户管理',
  icon: 'user',
  path: 'userManagement',
  ID: 'userManagement',
  children: [
    {
      name: '账号管理',
      path: 'crud'
    }
  ]
},
{
  name: '销售分析',
  icon: 'area-chart',
  path: 'saleAanalysis',
  ID: 'saleAanalysis',
},
//  {
//   name: 'dashboard',
//   icon: 'dashboard',
//   path: 'dashboard',
//   children: [{
//     name: '分析页',
//     path: 'analysis',
//   }, {
//     name: '监控页',
//     path: 'monitor',
//   }, {
//     name: '工作台',
//     path: 'workplace',
//     authority: 'xxx',
//     // hideInMenu: true,
//   }],
// }, {
//   name: '表单页',
//   icon: 'form',
//   path: 'form',
//   children: [{
//     name: '基础表单',
//     path: 'basic-form',
//   }, {
//     name: '分步表单',
//     path: 'step-form',
//   }, {
//     name: '高级表单',
//     authority: 'admin',
//     path: 'advanced-form',
//   }],
// }, {
//   name: '列表页',
//   icon: 'table',
//   path: 'list',
//   children: [{
//     name: '查询表格',
//     path: 'table-list',
//   }, {
//     name: '标准列表',
//     path: 'basic-list',
//   }, {
//     name: '卡片列表',
//     path: 'card-list',
//   }, {
//     name: '搜索列表',
//     path: 'search',
//     children: [{
//       name: '搜索列表（文章）',
//       path: 'articles',
//     }, {
//       name: '搜索列表（项目）',
//       path: 'projects',
//     }, {
//       name: '搜索列表（应用）',
//       path: 'applications',
//     }],
//   }],
// }, {
//   name: '详情页',
//   icon: 'profile',
//   path: 'profile',
//   children: [{
//     name: '基础详情页',
//     path: 'basic',
//   }, {
//     name: '高级详情页',
//     path: 'advanced',
//     authority: 'admin',
//   }],
// }, {
//   name: '结果页',
//   icon: 'check-circle-o',
//   path: 'result',
//   children: [{
//     name: '成功',
//     path: 'success',
//   }, {
//     name: '失败',
//     path: 'fail',
//   }],
// }, {
//   name: '异常页',
//   icon: 'warning',
//   path: 'exception',
//   children: [{
//     name: '403',
//     path: '403',
//   }, {
//     name: '404',
//     path: '404',
//   }, {
//     name: '500',
//     path: '500',
//   }, {
//     name: '触发异常',
//     path: 'trigger',
//     hideInMenu: true,
//   }],
// }, {
//   name: '账户',
//   icon: 'user',
//   path: 'user',
//   authority: 'guest',
//   children: [{
//     name: '登录',
//     path: 'login',
//   }, {
//     name: '注册',
//     path: 'register',
//   }, {
//     name: '注册结果',
//     path: 'register-result',
//   }],
// }
];

const authority = Cookies.getJSON('authority') || []
console.log('authority', authority)

const newMenuData = menuData.map(item => {
  if (authority.includes(item.ID)) {
    return { ...item, authority: ['admin', 'user']}
  }
  return { ...item, authority: ['admin']}
})
console.log('newMenuData', newMenuData)

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(newMenuData);
