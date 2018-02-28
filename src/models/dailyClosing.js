import { addOrUpdateDailyClosing, getDailyClosing } from '../services/api';
import { message } from 'antd'

export default {
  namespace: 'dailyClosing',

  state: {
    dailyClosingResult: {}
  },

  effects: {
    *addOrUpdateDailyClosing(action, { put, call }) {
      const { payload } = action
      const response = yield call(addOrUpdateDailyClosing, payload)
      if (response.Status) {
        message.success('提交成功')
      } else {
        message.error('提交失败')
      }
    },
    *getDailyClosing(action, { put, call }) {
      const { payload } = action
      const { dtTurnoverDate, setFieldsValueCallback } = payload
      const response = yield call(getDailyClosing, dtTurnoverDate)
      if (response.Status) {
        console.log('response', response)
      const dailyClosingResult = response.Result.Data
      const payload = dailyClosingResult || {}
      setFieldsValueCallback({
             Cash100: payload.i100D,
            Cash50: payload.i50D,
            Cash20: payload.i20D,
            Cash10: payload.i10D,
            Cash5: payload.i5D,
            Cash2: payload.i2D,
            Cash1: payload.i1D,
            Cash0Dot5: payload.i50C,
            Cash0Dot2: payload.i20C,
            Cash0Dot1: payload.i10C,
            UnionPay: payload.fUniPay,
            // fUnipayFee: unionPayServiceCharge,
            CreditCard: payload.fCredit,
            // fCreditFee: creditCardServiceCharge,
            AliPay: payload.fAliPay,
            // fAliPayFee: aliPayServiceCharge,
            WeChatPay: payload.fWeChat,
            // fWeChatFee: weChatPayServiceCharge,
            CashOpening: payload.fCashOpening,
            // fCashClosing: payload.CashClosing,
            EftopsIncome: payload.fEftpos,
            // fTransfer: payload.TransferIncome,
            LatiPayIncome: payload.fZFBWC,
            // iDepartmentID: 2,
            FrontEndIncome: payload.fFrontSale,
            BackEndIncome: payload.fBackSale,
            ShopAssistant: typeof payload.sSaleName === 'string' ? payload.sSaleName.split(',') : [],
            Operator: payload.sOperator,
            ExportRecord: typeof payload.fFreight === 'string' ? payload.fFreight.split(',') : [],
      })
      yield put({
        type: 'saveDailyClosingResult',
        payload,
      });
      } else {
        message.error('获取失败')
      }
    }
  },

  reducers: {
    saveDailyClosingResult(state, action) {
      return {
        ...state,
        dailyClosingResult: action.payload,
      };
    }
  },
};
