export const GOODS_DISPLAY_TYPE = {
  CARD_LIST: Symbol(),
  TABLE: Symbol(),
};

export const PRODUCT_LEVEL_SELECT = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'X', label: 'X' },
];

export const POS_TAB_TYPE = {
  STORESALE: 1,
  MILKPOWDER: 2,
  WHOLESALE: 3,
  ALLOCATEANDTRANSFER: 'ALLOCATEANDTRANSFER',
  RETURNSALE: 'RETURNSALE',
};

export const SALE_TYPE = {
  LOCAL: 1,
  EXPRESS: 2,
  SHIPPING: 3,
};

export const SALE_TYPE_MAPPING = [
  { value: 1, labelCN: '本地' },
  { value: 2, labelCN: '邮寄' },
  { value: 3, labelCN: '代发' },
];


// export const DOMAIN = 'http://192.168.1.18:8086';
export const DOMAIN = 'http://posapi.he2009.nz';
// export const DOMAIN = 'http://testposapi.he2009.nz';

export const POS_PHASE = {
  LIST: 'CHOOSE_LIST',
  TABLE: 'CHOOSE_TABLE',
  PAY: 'PAY',
  CUSTOMER: 'CUSTOMER',
};

export const CUSTOMER_TYPE = [
  { value: 1, label: '普通' },
  { value: 2, label: '白金' },
  { value: 3, label: '钻石' },
  { value: 4, label: 'SVIP' },
];

export const DEPARTMENT = [
  { value: 0, label: '测试店铺' },
  { value: 2, label: '办公室' },
  { value: 3, label: '采购' },
  { value: 5, label: '仓库' },
  { value: 6, label: '实体店' },
  { value: 7, label: 'Default' },
  { value: 8, label: 'Admin' },
  { value: 9, label: '会计' },
  { value: 10, label: '直营店' },
  { value: 12, label: 'City店' },
  { value: 13, label: 'Glenfield店' },
  { value: 14, label: 'NewLynn店' },
  { value: 15, label: 'Northcote店' },
  { value: 19, label: '青岛澳西卡' },
  { value: 20, label: '一千零一夜' },
  { value: 21, label: '加盟店' },
  { value: 22, label: 'Top International' },
  { value: 23, label: 'DeKang' },
  { value: 24, label: 'New NZ' },
  { value: 25, label: 'New Zealand healthcare 2014' },
  { value: 26, label: 'Health Forever' },
  { value: 27, label: 'Health Wealth' },
  { value: 28, label: 'Health Element Albany' },
  { value: 29, label: 'Ana 1984' },
  { value: 30, label: 'WCCK' },
  { value: 31, label: '大客户' },
  { value: 32, label: 'HuaYang' },
  { value: 33, label: 'TY Health Ormiston Phamacy' },
  { value: 34, label: 'Carrier Ltd' },
  { value: 35, label: '国内' },
  { value: 36, label: '淘宝' },
  { value: 37, label: '天猫旗舰' },
  { value: 38, label: '洋码头' },
  { value: 39, label: '其他' },
  { value: 40, label: '阿拉丁' },
  { value: 41, label: '中国采购' },
  { value: 42, label: '新西兰总部' },
  { value: 43, label: 'HE官网' },
  { value: 44, label: 'Healthelement海外旗舰店-保健品' },
  { value: 45, label: 'Healthelement海外旗舰店-美妆' },
  { value: 46, label: 'Healthelement海外旗舰店-食品' },
  { value: 47, label: '纽澳康源海外专营店' },
  { value: 48, label: '纽澳康源淘宝店' },
  { value: 49, label: '纽澳康源洋码头' },
  { value: 50, label: 'Vogels海外旗舰店' },
  { value: 51, label: 'lindenleaves海外旗舰店' },
  { value: 52, label: 'Merino海外旗舰店' },
  { value: 53, label: '贺寿利' },
  { value: 54, label: '2B业务点' },
  { value: 55, label: 'Tariff-free-NBBL' },
  { value: 56, label: 'Tariff-free-NBCX' },
  { value: 57, label: 'Tariff-free-HZSC' },
  { value: 58, label: 'Tariff-free-HZBL' },
  { value: 59, label: 'Tariff-free-CQXY' },
  { value: 60, label: '天猫' },
  { value: 61, label: '人人店' },
  { value: 62, label: 'Tariff-free-MRNO' },
  { value: 63, label: 'Tariff-free-TMQJ' },
  { value: 64, label: 'Tariff-free-TMZY' },
  { value: 65, label: 'Tariff-free-VGLS' },
  { value: 66, label: 'MtEden店' },
  { value: 67, label: 'Tariff-free-LDLV' },
  { value: 68, label: 'Meadowland店' },
  { value: 69, label: 'GFC-LDLV' },
  { value: 70, label: 'GFC-MRNO' },
  { value: 71, label: 'GFC-TMQJ' },
  { value: 72, label: 'GFC-TMZY' },
  { value: 73, label: 'GFC-VGLS' },
  { value: 74, label: '网易考拉' },
  { value: 75, label: '京东' },
];

export const TAX_RATE = 0.15;
