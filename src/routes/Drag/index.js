import { Table } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import styles from './index.less';

function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

function dragDirectionX(
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

let BodyRow = (props) => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveRow,
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
    if (direction === 'downward') {
      className += ' drop-over-downward';
    }
    if (direction === 'upward') {
      className += ' drop-over-upward';
    }
  }

  return connectDragSource(
    connectDropTarget(
          <tr
              {...restProps}
              className={className}
              style={style}
            />
    )
  );
};
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
    const direction = dragDirectionX(
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

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
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

BodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);
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


class DragSortingTable extends React.Component {
    state = {
      data: [{
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
      }, {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
      }, {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      }],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        }, {
          title: 'Age',
          dataIndex: 'age',
          key: 'age',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        }, {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
          onHeaderCell: (columns) => {
            const index = this.state.columns.findIndex(item => item.key === columns.key);
            return {
              index,
              moveColumn: this.moveColumn,
            };
          },
        },
      ],
    }

    components = {
      header: {
        cell: HeaderCell,
      },
      body: {
        row: BodyRow,
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

    moveRow = (dragIndex, hoverIndex) => {
      const { data } = this.state;
      const dragRow = data[dragIndex];

      this.setState(
        update(this.state, {
          data: {
            $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
          },
        }),
      );
    }

    render() {
      return (
          <Table
              bordered
              columns={this.state.columns}
              dataSource={this.state.data}
              components={this.components}
              onRow={(record, index) => ({
                    index,
                    moveRow: this.moveRow,
                })}
            />
      );
    }
}

const Demo = DragDropContext(HTML5Backend)(DragSortingTable);
export default Demo;
