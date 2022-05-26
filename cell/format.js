import React, { lazy, memo } from 'react';
import Cleave from 'cleave.js/react';

const RenderWithTooltip = lazy(() => import('../renderWithToolTip'));

const Format = ({ format, showTooltip, tooltip, value }) => {
	let blocks = format.map(d => parseInt(d.characterLength)),
		delimiters = format.map(d => d.delimiter);
	delimiters.pop();

	return (
		<RenderWithTooltip show={showTooltip} title={tooltip ? tooltip : value}>
			<Cleave
				disabled={true}
				options={{ delimiters, blocks }}
				value={value}
				style={{ border: 'none', backgroundColor: 'transparent' }}
			/>
		</RenderWithTooltip>
	);
};

export default memo(Format);
