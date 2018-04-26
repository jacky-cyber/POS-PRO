import React, { PureComponent } from 'react';
import { Table, Layout, Icon, Button, InputNumber, Select, Radio } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { connect } from 'dva';
import cls from 'classnames';
import { ChooseCalculator, SelectedGoods } from 'components/PosComponents';
import { TagSelect, HeaderSearch } from 'components/BaseComponents';
import { POS_TAB_TYPE, POS_PHASE, SALE_TYPE } from 'constant';
import styles from './index.less';


const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Sider, Content } = Layout;
const { Option } = Select;

function searchResult(value, count, includedBarcodeCount, includedSkuCount, includedCNCount) {
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
  ];
}


function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleX = (initialClientOffset.x - sourceClientOffset.x) / 2;
  const hoverClientX = clientOffset.x - sourceClientOffset.x;
  if (dragIndex < hoverIndex && hoverClientX > hoverMiddleX) {
    return 'rightward';
  }
  if (dragIndex > hoverIndex && hoverClientX < hoverMiddleX) {
    return 'leftward';
  }
}

let HeaderCell = (props) => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveColumn,
    dragRow,
    clientOffset,
    sourceClientOffset,
    initialClientOffset,
    ...restProps
  } = props;
  const style = { cursor: 'move' };

  let { className } = restProps;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(
      dragRow.index,
      restProps.index,
      initialClientOffset,
      clientOffset,
      sourceClientOffset
    );
    if (direction === 'rightward') {
      className += ' drop-over-rightward';
      // className += styles.dropOverDownward
    }
    if (direction === 'leftward') {
      className += ' drop-over-leftward';
      // className += styles.dropOverUpward
    }
  }
  return connectDragSource(
    connectDropTarget(
      <th
        {...restProps}
        className={className}
        style={style}
      />
    )
  );
};
const columnSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const columnTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveColumn(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};


HeaderCell = DropTarget('column', columnTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('column', columnSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(HeaderCell)
);
@connect(state => ({
  commodity: state.commodity,
  loading: state.loading.effects['commodity/getStoreSaleGoods'] || state.loading.effects['commodity/getMilkPowderGoods'] || state.loading.effects['commodity/getStoreSaleGoods'],
  order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
}))

class GoodsTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      originalContent: props.commodity.currentOrderGoodsList,
      content: props.commodity.currentOrderGoodsList,
      dataSource: [],
      filteredContent: [],
      includedBarcodeContent: [],
      includedSkuContent: [],
      includedCNContent: [],
      includedENContent: [],
      columns: [
        {
          title: '商品名',
          dataIndex: 'CN',
          key: 'CN',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
        {
          title: '零售价',
          dataIndex: 'RetailPrice',
          key: 'RetailPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
        {
          title: '真实价格',
          dataIndex: 'CustomerPrice',
          key: 'CustomerPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
        {
          title: '数量',
          dataIndex: 'Count',
          key: 'Count',
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
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
        {
          title: '操作',
          dataIndex: 'Add',
          key: 'Add',
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
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
      ],
      tagList: [
        {
          title: '商品名',
          dataIndex: 'CN',
          key: 'Name',
        },
        {
          title: '零售价',
          dataIndex: 'RetailPrice',
          key: 'RetailPrice',
        },
        {
          title: '销售价',
          dataIndex: 'RealPrice',
          key: 'RealPrice',
        },
        {
          title: '操作',
          dataIndex: 'Add',
          key: 'Add',
        },
      ],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { commodity } = nextProps;
    const { currentOrderGoodsList = [] } = commodity;
    this.setState({
      content: currentOrderGoodsList,
      originalContent: currentOrderGoodsList,
    });
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

  toggleCollapse = () => {
    this.setState({
      display: !this.state.display,
    });
  }


  components = {
    header: {
      cell: HeaderCell,
    },
  }
  moveColumn = (dragIndex, hoverIndex) => {
    const { columns } = this.state;
    const dragRow = columns[dragIndex];

    this.setState(
      update(this.state, {
        columns: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    );
  }
  tagChangeHandler = (tagList) => {
    const newColumns = this.state.tagList.filter((columnItem) => {
      return !!tagList.find(tagItem => (tagItem === columnItem.dataIndex));
    });
    this.setState({ columns: newColumns });
  }
  clickTableHandler = (activeTabKey, currentPhase) => {
    if (currentPhase === POS_PHASE.TABLE) {
      return;
    }
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.TABLE } });
  }
  clickListHandler = (activeTabKey, currentPhase) => {
    if (currentPhase === POS_PHASE.LIST) {
      return;
    }
    this.props.dispatch({ type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.LIST } });
  }
  selectHandler = (value) => {
    if (value === '') {
      this.pressEnterHandler(value);
    } else if (value === 'barcode') {
      this.setState({ content: this.state.includedBarcodeContent });
    } else if (value === 'sku') {
      this.setState({ content: this.state.includedSkuContent });
    }
  }
  searchHandler = (value) => {
    console.log('value', value)
    const filteredContent = this.state.originalContent.filter(item => item.Barcode === value);
    const includedBarcodeContent = this.state.originalContent.filter(item => item.Barcode.includes(value));
    const includedSkuContent = this.state.originalContent.filter(item => item.Sku.includes(value));
    const includedCNContent = this.state.originalContent.filter(item => (item.CN.includes(value)));
    this.setState({
      dataSource: value ? searchResult(value, filteredContent.length, includedBarcodeContent.length, includedSkuContent.length, includedCNContent.length) : [],
      filteredContent,
      includedBarcodeContent,
      includedSkuContent,
      includedCNContent,
    });
  }
  clearSearchHandler = () => {
    this.setState({ content: this.props.commodity.currentOrderGoodsList });
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
  render() {
    const { commodity, dispatch, loading } = this.props;
    const { dataSource, content } = this.state;
    console.log('content', content)
    const currentOrder = commodity.orders.filter(item => (item.key === commodity.activeTabKey))[0];
    const { saleType, type } = currentOrder;
    const defaultValue = this.state.tagList.map(item => item.dataIndex);
    const tagSelectWrapper = cls({
      [styles.tagSelectShow]: this.state.display,
      [styles.tagSelectHide]: !this.state.display,
    });
    const typeSelectRender = (
      type === POS_TAB_TYPE.STORESALE && (
      <RadioGroup
        value={saleType}
        onChange={e => dispatch({ type: 'commodity/clickChangeSaleTypeButton', payload: e.target.value })}
        style={{ marginLeft: 24 }}
      >
        <RadioButton value={SALE_TYPE.LOCAL}>本地</RadioButton>
        <RadioButton value={SALE_TYPE.EXPRESS}>邮寄</RadioButton>
        <RadioButton value={SALE_TYPE.SHIPPING}>代发</RadioButton>
      </RadioGroup>
      )
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
        />
        <a onClick={() => this.clearSearchHandler()}>清除搜索</a>
      </div>
    );
    return (
      <Layout>
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
        <Content className={styles.rightContent}>
          <div className={styles.header}>
            <div>
              <a style={{ marginLeft: 8 }} onClick={this.toggleCollapse}>
              配置表格 <Icon type={this.state.display ? 'up' : 'down'} />
              </a>
            </div>
            { typeSelectRender }
          </div>
          <div className={tagSelectWrapper}>
            <TagSelect onChange={this.tagChangeHandler} defaultValue={defaultValue}>
              {
                this.state.tagList.map(item => (
                  <TagSelect.Option value={item.dataIndex} key={item.key}>{item.title}</TagSelect.Option>
                ))
              }
            </TagSelect>
          </div>
          <div className={styles.tabHeader}>
            { tabHeaderRender }
          </div>
          <div className={styles.commodityListWrapper}>
            <div>可以拖拽表头进行排序</div>
            <Table
              bordered
              dataSource={content}
              columns={this.state.columns}
              components={this.components}
              rowKey={record => record.Key}
              loading={loading}
              size="small"
              pagination={{
                pageSize: 15,
              }}
            />
          </div>
        </Content>
      </Layout>
    );
  }
}
const Demo = DragDropContext(HTML5Backend)(GoodsTable);
export default Demo;
