import React from 'react';
import { Button } from 'antd';

export default ({ name, value, clickHandler, ...otherProps }) => {
  return (
    <Button
      onClick={() => clickHandler({ name, value })}
      {...otherProps}
    >
      {name}
    </Button>
  );
};
