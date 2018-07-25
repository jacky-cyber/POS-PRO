import React, { PureComponent } from 'react';
import { Table, Layout, Icon, Button, InputNumber, Select, Radio, Modal, Input } from 'antd';
import { connect } from 'dva';
import cls from 'classnames';
import { ChooseCalculator, SelectedGoods } from 'components/PosComponents';
import { HeaderSearch } from 'components/BaseComponents';
import { POS_TAB_TYPE, SALE_TYPE } from 'constant';
import styles from './index.less';


const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Sider, Content } = Layout;
const { Option } = Select;
const { Search } = Input;


const originalColumns = [
  {
    title: '商品名',
    dataIndex: 'EN',
    render: (text, record) => (`[${record.Sku}] ${text}`),
  },
  {
    title: '零售价',
    dataIndex: 'RetailPrice',
    align: 'center',
  },
  {
    title: '白金价',
    dataIndex: 'PlatinumPrice',
    align: 'center',
  },
  {
    title: '钻石价',
    dataIndex: 'DiamondPrice',
    align: 'center',
  },
  {
    title: 'VIP价',
    dataIndex: 'VIPPrice',
    align: 'center',
  },
  {
    title: 'SVIP价',
    dataIndex: 'SVIPPrice',
    align: 'center',
  },
  {
    title: '会员价格',
    dataIndex: 'CustomerPrice',
    align: 'center',
  },
];

const wholesaleColumns = [
  {
    title: '中文名',
    dataIndex: 'CN',
  },
  {
    title: '英文名',
    dataIndex: 'EN',
  },
  {
    title: '一级批发价',
    dataIndex: 'WholesalePrice',
    align: 'center',
  },
  {
    title: '二级批发价',
    dataIndex: 'SecondWholesalePrice',
    align: 'center',
  },
];


function searchResult(
  value,
  count,
  includedBarcodeCount,
  includedSkuCount,
  includedCNCount,
  includedENCount) {
  return [
    <Option key={`${value}1`} value="" text={`${value}`}>
              条码等于 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{count}</span> 个
    </Option>,
    <Option key={`${value}2`} value="barcode" text="">
              条码包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedBarcodeCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="sku" text="">
              SKU 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedSkuCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="CN" text="">
      中文名 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedCNCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="EN" text="">
              英文名 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedENCount}</span> 个
    </Option>,
  ];
}


          @connect(state => ({
            currentOrderGoodsList: state.commodity.currentOrderGoodsList,
            loading: state.loading.effects['commodity/getStoreSaleGoods'] || state.loading.effects['commodity/getMilkPowderGoods'] || state.loading.effects['commodity/getStoreSaleGoods'],
            order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
            activeTabKey: state.commodity.activeTabKey,
          }))

export default class GoodsTable extends PureComponent {
            constructor(props) {
              super(props);
              this.state = {
                originalContent: props.currentOrderGoodsList,
                content: props.currentOrderGoodsList,
                dataSource: [],
                filteredContent: [],
                includedBarcodeContent: [],
                includedSkuContent: [],
                includedCNContent: [],
                includedENContent: [],
                isRefundModalVisible: false,
                columns: [],
                commonColumns: [
                  {
                    title: '数量',
                    dataIndex: 'Count',
                    key: 'Count',
                    align: 'center',
                    render: (text, record) => {
                      return (
                        <InputNumber
                          style={{ width: 50 }}
                          size="small"
                          value={text}
                          min={0}
                          onChange={value => this.countChangeHandler(value, record)}
                        />
                      );
                    },
                  },
                  {
                    title: '库存',
                    dataIndex: 'Stock',
                    key: 'Stock',
                    align: 'center',
                  },
                  {
                    title: '操作',
                    dataIndex: 'Add',
                    key: 'Add',
                    align: 'center',
                    render: (text, record, index) => {
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className={styles.addButton}
                          icon="shopping-cart"
                          shape="circle"
                          onClick={() => props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: record.Key, count: record.Count } })}
                        />
                      );
                    },
                  },
                ],
                refundColumns: [
                  {
                    title: '商品名',
                    dataIndex: 'ProductName',
                  },
                  {
                    title: 'Sku',
                    dataIndex: 'Sku',
                  },
                  {
                    title: '成交价',
                    dataIndex: 'RealPrice',
                    align: 'center',
                  },
                  {
                    title: '数量',
                    dataIndex: 'CountQuantity',
                    align: 'center',
                  },
                  {
                    title: '操作',
                    dataIndex: 'action',
                    align: 'center',
                    render: (text, record) => {
                      return (
                        <Button
                          type="danger"
                          shape="circle"
                          icon="rollback"
                          onClick={() => props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: record.Key, count: -1, refundGoodsItem: record } })}
                        />
                      );
                    },
                  },
                ],
              };
            }

            componentDidMount() {
              const { order } = this.props;
              const { type } = order;
              this.updateColumns(type);
            }

            componentWillReceiveProps(nextProps) {
              const { currentOrderGoodsList, order } = nextProps;
              const { type } = order;
              const { activeTabKey: oldActiveTabKey } = this.props;
              const { activeTabKey: newActiveTabKey } = nextProps;
              // if (oldActiveTabKey !== newActiveTabKey) {
              this.setState({
                content: currentOrderGoodsList,
                originalContent: currentOrderGoodsList,
              });
              this.updateColumns(type);
              // }
            }

            countChangeHandler = (value, record) => {
              const key = record.Key;
              const newContent = this.state.content.map((item) => {
                if (item.Key === key) {
                  return { ...item, Count: value };
                }
                return item;
              });
              this.setState({ content: newContent });
            }

            selectHandler = (value) => {
              if (value === '') {
                this.pressEnterHandler(value);
              } else if (value === 'barcode') {
                this.setState({ content: this.state.includedBarcodeContent });
              } else if (value === 'sku') {
                this.setState({ content: this.state.includedSkuContent });
              } else if (value === 'CN') {
                this.setState({ content: this.state.includedCNContent });
              } else if (value === 'EN') {
                this.setState({ content: this.state.includedENContent });
              }
            }
            searchHandler = (value) => {
              const processedValue = value.trim().toLowerCase();
              // 等于一品多码中的一个
              const filteredContent = this.state.originalContent.filter(item => item.Barcode.split(',').map(item => item.toLowerCase()).includes(processedValue));
              // 包含条码
              const includedBarcodeContent = this.state.originalContent.filter(item => (
                item.Barcode.toLowerCase().includes(processedValue)
              ));
              // 包含 sku
              const includedSkuContent = this.state.originalContent.filter(
                item => (
                  item.Sku.toLowerCase().includes(processedValue))
              );
              // 品名
              const strArray = value ?
                value.split(' ').filter(item => item !== '').map(item => item.toLowerCase())
                : [];
              const includedCNContent = this.state.originalContent.filter(item => (strArray.reduce((a, b) => {
                const s = item.CN.toLowerCase() || '';
                const b1 = typeof a === 'boolean' ? a : s.includes(a);
                const b2 = s.includes(b);
                return b1 && b2;
              }, true)));
              const includedENContent = this.state.originalContent.filter(item => (strArray.reduce((a, b) => {
                const s = item.EN.toLowerCase() || '';
                const b1 = typeof a === 'boolean' ? a : s.includes(a);
                const b2 = s.includes(b);
                return b1 && b2;
              }, true)));
              this.setState({
                dataSource: value ?
                  searchResult(
                    value,
                    filteredContent.length,
                    includedBarcodeContent.length,
                    includedSkuContent.length,
                    includedCNContent.length,
                    includedENContent.length
                  )
                  : [],
                filteredContent,
                includedBarcodeContent,
                includedSkuContent,
                includedCNContent,
                includedENContent,
              });
            }
            clearSearchHandler = () => {
              this.setState({ content: this.props.currentOrderGoodsList });
            }
            pressEnterHandler = () => {
              this.setState({
                dataSource: [],
              });
              const { filteredContent } = this.state;
              if (filteredContent.length === 1) {
                const filteredItem = filteredContent[0];
                this.props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: filteredItem.Key, count: 1 } });
              }
            }
            showRefundModalHandler = () => {
              this.setState({ isRefundModalVisible: true });
            }
            closeRefundModalHandler = () => {
              this.setState({ isRefundModalVisible: false });
            }
            getRefundOrderDetail = () => {
              const { order = {} } = this.props;
              const { refundOrderDetail } = order;
              if (Array.isArray(refundOrderDetail) && refundOrderDetail.length > 0) {
                return this.formatRefundOrderDetail(refundOrderDetail);
              } else {
                return false;
              }
            }

            updateColumns = (type) => {
              if (type === 3) {
                this.setState({
                  columns: [...wholesaleColumns, ...this.state.commonColumns],
                });
              } else {
                this.setState({
                  columns: [...originalColumns, ...this.state.commonColumns],
                });
              }
            }
            formatRefundOrderDetail = (refundOrderDetail) => {
              return refundOrderDetail.map(item => ({
                ...item,
                Key: `refund-${item.Sku}`,
                EN: item.ProductName,
                CN: item.ProductName,
                Stock: item.CountQuantity,
                RetailPrice: item.RealPrice,
                isRefund: true,
                Weight: 0,
              }));
            }
            searchOrderIDHandler = (value) => {
              this.props.dispatch({
                type: 'commodity/getRefundOrderDetail',
                payload: value,
              }).then(() => {
                if (this.getRefundOrderDetail()) {
                  this.closeRefundModalHandler();
                }
              });
            }
            render() {
              const { order, dispatch, loading, activeTabKey } = this.props;
              const { dataSource, content, isRefundModalVisible, refundColumns } = this.state;
              const drawableContent = content.map(item => ({
                ...item,
              }));
              const { saleType, type, refundOrderDetail } = order;
              const typeSelectRender = (
                type === POS_TAB_TYPE.STORESALE && (
                  <RadioGroup
                    value={saleType}
                    onChange={e => dispatch({ type: 'commodity/clickChangeSaleTypeButton', payload: e.target.value })}
                    style={{ marginLeft: 24 }}
                    disabled={loading}
                  >
                    <RadioButton value={SALE_TYPE.LOCAL}>本地</RadioButton>
                    <RadioButton value={SALE_TYPE.EXPRESS}>邮寄</RadioButton>
                    <RadioButton value={SALE_TYPE.SHIPPING}>代发</RadioButton>
                  </RadioGroup>
                )
              );
              const refundModal = (
                <Modal
                  title="请输入需要退货的订单号"
                  visible={isRefundModalVisible}
                  footer={null}
                  onCancel={this.closeRefundModalHandler}
                >
                  <Search
                    onSearch={value => this.searchOrderIDHandler(value)}
                    enterButton="确定"
                  />
                </Modal>
              );
              const tabHeaderRender = (
                <div>
                  <HeaderSearch
                    className={`${styles.action} ${styles.search}`}
                    placeholder="商品条码搜索-此状态下可使用扫码枪"
                    dataSource={dataSource}
                    optionLabelProp="text"
                    onSelect={this.selectHandler}
                    onSearch={this.searchHandler}
                    onPressEnter={this.pressEnterHandler}
                    activeTabKey={activeTabKey}
                  />
                  <a onClick={() => this.clearSearchHandler()}>清除搜索</a>
                </div>
              );
              const refundOrderInfo = (
                <div>
                  <h3 className={styles.refundOrderInfo}>正在退货的订单号：{this.getRefundOrderDetail() && refundOrderDetail[0].OrderID}</h3>
                  <Table
                    bordered
                    dataSource={this.getRefundOrderDetail() || []}
                    columns={refundColumns}
                    rowKey={record => record.ID}
                    loading={loading}
                    size="small"
                    pagination={false}
                  />
                </div>
              );
              return (
                <Layout>
                  {/* 左边栏 */}
                  <Sider
                    width={440}
                    className={styles.sider}
                  >
                    <Content
                      className={styles.leftContent}
                    >
                      <SelectedGoods />
                    </Content>
                    <div
                      className={styles.calculator}
                    >
                      <ChooseCalculator />
                    </div>
                  </Sider>
                  {/* 商品挑选内容区 */}
                  <Content className={styles.rightContent}>
                    { refundModal }
                    <div className={styles.header}>
                      { typeSelectRender }
                      <Button onClick={this.showRefundModalHandler}>退货</Button>
                    </div>
                    <div className={styles.tabHeader}>
                      { tabHeaderRender }
                    </div>
                    <div className={styles.tabContent}>
                      <div className={styles.normalOrder}>
                        <Table
                          bordered
                          dataSource={drawableContent}
                          columns={this.state.columns}
                          rowKey={record => record.Key}
                          loading={loading}
                          size="small"
                          pagination={{
                            pageSize: 15,
                          }}
                        />
                      </div>
                      <div className={styles.refundOrder}>
                        { this.getRefundOrderDetail() && refundOrderInfo }
                      </div>
                    </div>
                  </Content>
                </Layout>
              );
            }
          }
