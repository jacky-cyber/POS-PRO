export const GOODS_DISPLAY_TYPE = {
  CARD_LIST: Symbol(),
  TABLE: Symbol(),
};

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
}


// export const DOMAIN = 'http://192.168.1.225:8086';
export const DOMAIN = 'http://testposapi.he2009.nz';

export const POS_PHASE = {
  LIST: 'CHOOSE_LIST',
  TABLE: 'CHOOSE_TABLE',
  PAY: 'PAY',
  CUSTOMER: 'CUSTOMER',
}

export const CUSTOMER_TYPE= [
  {value: 1, label: '普通'},
  {value: 2, label: '白金'},
  {value: 3, label: '钻石'},
  {value: 4, label: 'SVIP'}
]


