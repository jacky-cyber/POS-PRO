import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';


// getFieldDecorator 不能用于装饰纯函数组件。

export default class SwitchableFormItem extends PureComponent {
  static propTypes = {
    // 可编辑状态下的组件
    formItemElement: PropTypes.func.isRequired,
    formItemElementProps: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object, PropTypes.array, PropTypes.bool]),
    isEditing: PropTypes.bool,
    onChange: PropTypes.func,
    // 不可编辑状态下的格式化
    format: PropTypes.func,
  }
  static defaultProps = {
    formItemElementProps: {},
    isEditing: false,
    onChange: val => val,
    format: val => val,
    // value: undefined,
  }
  render() {
    const {
      isEditing,
      value,
      formItemElement: FormItemElement,
      formItemElementProps,
      onChange,
      unit,
      format,
    } = this.props;
    let label;
    let newValue;
    if (value && value.constructor.name === 'Object') {
      // 处理 key-value 形式的数值
      label = value[Object.keys(value)[0]];
      newValue = value[Object.keys(value)[1]];
    } else {
      label = value;
      newValue = value;
    }
    const noDataNode = <span title="暂无数据">暂无数据</span>;
    return (
      <div>
        {
          isEditing
            ? <FormItemElement value={newValue} onChange={onChange} {...formItemElementProps} />
            : (
              <span>
                {
                  (label !== undefined || label !== null) ?
                    (
                      unit ?
                             `${format(label)} ${unit}`
                      :
                             `${format(label)}`
                    )
                  :
                noDataNode }
              </span>
            )
        }
      </div>
    );
  }
}
