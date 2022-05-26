import React, { lazy, memo } from 'react';
import striptags from 'striptags';
import { Typography } from 'antd';

const RenderWithTooltip = lazy(() => import('../renderWithToolTip'));

const Standard = ({ clickable, copyable, finalValue, onCustomClick, original, showTooltip, tooltip, value }) => {
	return (
		<RenderWithTooltip show={showTooltip} title={tooltip ? tooltip : value}>
			<Typography.Paragraph
				ellipsis={{ rows: 2 }}
				style={{ marginBottom: 0, cursor: clickable ? 'pointer' : 'auto' }}
				onClick={() => (clickable ? onCustomClick(original) : null)}
				copyable={copyable ? { onCopy: () => onCopy(striptags(value), original) } : false}>
				{finalValue}
			</Typography.Paragraph>
		</RenderWithTooltip>
	);
};

export default memo(Standard);
