import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';


// getFieldDecorator 不能用于装饰纯函数组件。

export default class SwitchableFormItemToSpanInForm extends PureComponent {
  static propTypes = {
    FormItemElement: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
  }
  render() {
    const { editable, value, FormItemElement, onChange, unit, ...otherProps } = this.props;
    let label;
    let newValue;
    if (typeof value === 'object') {
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
          editable
            ? <FormItemElement value={newValue} onChange={onChange} {...otherProps} />
                  : (
                    <span>
                      {
                      label ?
                        (
                          unit ?
                             `${label} ${unit}`
                          :
                          label
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

// SwitchableFormItemToSpanInForm.propTypes = {
//     FormItemElement: PropTypes.func.isRequired,
//     editable: PropTypes.bool,
//     onChange: PropTypes.func,
//     value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
// }
