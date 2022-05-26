import React, { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

const Cell = lazy(() => import('./cell'));
const Filter = lazy(() => import('./filter'));

const ColumnString = props => {
	const {
		editable = false,
		copyable = false,
		clickable = false,
		format = [],
		id,
		keywords = '',
		list = [],
		loading = false,
		multiple = false,
		onChange,
		onCopy = () => {},
		onCustomClick = () => {},
		poppable = false,
		richText,
		stripHTMLTags = false,
		showTooltip = false,
		tooltip = '',
		...defaultProps
	} = props;

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell
						{...props}
						other={{
							copyable,
							clickable,
							editable,
							format,
							id,
							keywords,
							multiple,
							onChange,
							onCopy,
							onCustomClick,
							poppable,
							richText,
							stripHTMLTags,
							showTooltip,
							tooltip
						}}
					/>
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} id={id} list={list} loading={loading} />
				</Suspense>
			) : null
	};
};

export default ColumnString;
