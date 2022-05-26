import React, { lazy, memo, useState } from 'react';
import { Button, Popover, Typography } from 'antd';

const RenderWithTooltip = lazy(() => import('../renderWithToolTip'));

const Poppable = ({ copyable, finalValue, keywords, onCopy, original, showTooltip, tooltip, value }) => {
	const [visible, setVisible] = useState(false);

	return (
		<Popover
			content={
				<>
					<div
						dangerouslySetInnerHTML={{
							__html:
								keywords.length === 0
									? value
									: value.replace(
											new RegExp(keywords, 'g'),
											`<span key='${keywords}-${keywords.length}' style='background-color: yellow; font-weight: bold;'>${keywords}</span>`
									  )
						}}
					/>
					<br />
					<Button onClick={() => setVisible(false)} type="Link">
						Close
					</Button>
				</>
			}
			trigger="click"
			visible={visible}
			zIndex={99999}
			onVisibleChange={() => setVisible(true)}
			placement="top"
			style={{ width: 350 }}>
			<Typography.Paragraph
				ellipsis={{ rows: 2 }}
				style={{ cursor: 'pointer', marginBottom: 0 }}
				copyable={copyable ? { onCopy: () => onCopy(finalValue, original) } : false}>
				<RenderWithTooltip show={showTooltip} title={tooltip ? tooltip : value}>
					{finalValue}
				</RenderWithTooltip>
			</Typography.Paragraph>
		</Popover>
	);
};

export default memo(Poppable);
