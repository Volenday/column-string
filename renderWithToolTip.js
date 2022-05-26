import React from 'react';
import { Tooltip } from 'antd';

const RenderWithTooltip = ({ children, show, title }) => {
	if (!show) return children;
	return (
		<Tooltip placement="right" show={show} title={title}>
			{children}
		</Tooltip>
	);
};

export default RenderWithTooltip;
