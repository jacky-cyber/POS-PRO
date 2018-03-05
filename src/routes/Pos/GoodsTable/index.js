import React, { PureComponent } from 'react';
import { Table, Card, Collapse, Layout, Icon, Button, InputNumber, Divider } from 'antd'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { connect } from 'dva'
import StandardFormRow from '../../../components/StandardFormRow';
import TagSelect from '../../../components/TagSelect';
import { routerRedux } from 'dva/router';
import classNames from 'classnames'
import ChooseCalculator from '../../../components/Calculator/Choose/'
import SelectedGoods from '../../../components/List/SelectedGoods/'
import HeaderSearch from '../../../components/HeaderSearch';
import styles from './index.less';
import { POS_PHASE } from '../../../constant';


const { Panel } = Collapse
const { Header, Sider, Content } = Layout;
let cx = classNames.bind(styles)


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

  let className = restProps.className;
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
}
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
 }))

class GoodsTable extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      display: false,
      content: [],
      filteredContent: [],
      columns: [
        {
          title: '商品名',
          dataIndex: 'CN',
          key: 'CN',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
        {
          title: '零售价',
          dataIndex: 'RetailPrice',
          key: 'RetailPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
        {
          title: '真实价格',
          dataIndex: 'RealPrice',
          key: 'RealPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
        {
          title: '数量',
          dataIndex: 'Count',
          key: 'Count',
          render: (text, record, index) => {
            return (
                <InputNumber size="small" value={text} min={0} onChange={(value) => this.countChangeHandler(value, record)} />
            )
          }
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
                  onClick={() => props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: record.Key, count: record.Count }})}
                />
            )
          },
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
      ],
      tagList: [
        {
          title: '商品名',
          dataIndex: 'CN',
          key: 'Name',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
        {
          title: '零售价',
          dataIndex: 'RetailPrice',
          key: 'RetailPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
        {
          title: '真实价格',
          dataIndex: 'RealPrice',
          key: 'RealPrice',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
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
               >添加到购物车</Button>
              )
          },
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key)
            return {
              index,
              moveColumn: this.moveColumn,
            }
          },
        },
      ]
    }
  }
  countChangeHandler = (value, record) => {
    const key = record.Key
    const newContent = this.state.content.map(item => {
      if (item.Key === key) {
        return { ...item, Count: value }
      }
      return item
    })
    this.setState({content: newContent})
  }


  componentWillUpdate(nextProps) {
    if (this.state.content.length === 0) {
      console.log(nextProps.commodity.currentOrderGoodsList)
      this.setState({content: nextProps.commodity.currentOrderGoodsList})
    }
  }

  toggleCollapse = () => {
    this.setState({
      display: !this.state.display,
    })
  }


  components = {
    header: {
      cell: HeaderCell
    }
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
  handleTagChange = (tagList) => {
    const newColumns = this.state.tagList.filter(columnItem => {
      return !!tagList.find(tagItem => (tagItem === columnItem.dataIndex))
    })
    this.setState({ columns: newColumns })
  }
  clickTableHandler = (activeTabKey, currentPhase) => {
   if (currentPhase === POS_PHASE.TABLE ) {
     return
   }
   this.props.dispatch({type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.TABLE } })
  }
  clickListHandler = (activeTabKey, currentPhase) => {
   if (currentPhase === POS_PHASE.LIST ) {
     return
   }
   this.props.dispatch({type: 'commodity/changePosPhase', payload: { activeTabKey, lastPhase: currentPhase, targetPhase: POS_PHASE.LIST } })
  }
  render() {
    const { commodity, dispatch, loading } = this.props
    const { currentOrderGoodsList, activeTabKey } = commodity
    const currentOrder = commodity.orders.filter(item => (item.key === commodity.activeTabKey))[0]
    const { targetPhase: currentPhase } = currentOrder
    let displayTable = cx({
      [styles.trigger]: true,
      [styles.activeTrigger]: currentPhase === POS_PHASE.TABLE
    })
    let displayCardList = cx({
      [styles.trigger]: true,
      [styles.activeTrigger]: currentPhase === POS_PHASE.LIST
    })
    const defaultValue = this.state.tagList.map(item => item.dataIndex)
    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    }
    let tagSelectWrapper = cx({
      [styles.tagSelectShow]: this.state.display,
      [styles.tagSelectHide]: !this.state.display,
    })
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
            <Icon
              className={displayTable}
              type="profile"
              onClick={() => this.clickTableHandler(activeTabKey, currentPhase)}
            />
            <Icon
              className={displayCardList}
              type="table"
              onClick={() => this.clickListHandler(activeTabKey, currentPhase)}
            />
            <a style={{ marginLeft: 8 }} onClick={this.toggleCollapse}>
              配置表格 <Icon type={this.state.display ? "up" : "down"} />
            </a>
            <div className={styles.right}>
              <HeaderSearch
                className={`${styles.action} ${styles.search}`}
                placeholder="商品条码搜索"
                dataSource={this.state.filteredContent.map(item => (item.Key))}
                onSearch={(value) => {
                  const filteredContent = this.state.content.filter(item => item.Barcode.includes(value))
                  this.setState({filteredContent})
                }}
                onPressEnter={(value) => {
                  const { filteredContent } = this.state
                  if (filteredContent.length === 1) {
                    const filteredItem = filteredContent[0]
                    dispatch({type: 'commodity/addToSelectedList', payload: { key: filteredItem.Key, count: 1 }})
                  }
                }}
              />
            </div>
          </div>
          <div className={tagSelectWrapper}>
            <TagSelect onChange={this.handleTagChange} defaultValue={defaultValue}>
              {
                this.state.tagList.map(item => (
                  <TagSelect.Option value={item.dataIndex} key={item.key}>{item.title}</TagSelect.Option>
                ))
              }
            </TagSelect>
          </div>
          <div className={styles.tabHeader}>
          </div>
          <div className={styles.commodityListWrapper}>
            <div>可以拖拽表头进行排序</div>
            <Table
              bordered
              dataSource={this.state.content}
              columns={this.state.columns}
              components={this.components}
              rowKey={record => record.Key}
              loading={loading}
              size="small"
              pagination={{
                pageSize: 20,
              }}
            />
          </div>
        </Content>
      </Layout>
    )
  }
}
const Demo = DragDropContext(HTML5Backend)(GoodsTable);
export default Demo
