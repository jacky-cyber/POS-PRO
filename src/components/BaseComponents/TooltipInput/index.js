import React, { PureComponent } from 'react';
import { Tooltip, Input } from 'antd';

export default class TooltipInput extends PureComponent {
  render() {
    const { tooltipProps, inputProps, value, onChange } = this.props;
    const title = value || '请输入';
    return (
      <Tooltip
        trigger={['focus']}
        title={title}
        placement="topLeft"
      >
        <Input
          value={value}
          onChange={onChange}
        />
      </Tooltip>
    );
  }
}
