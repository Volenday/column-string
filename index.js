import React, { memo, Suspense, useRef, useState } from 'react';
import { Button, Popover, Skeleton, Tooltip, Typography } from 'antd';
import striptags from 'striptags';
import reactStringReplace from 'react-string-replace';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

import Filter from './filter';

const ColumnString = props => {
	const {
		copyable = false,
		clickable = false,
		format = [],
		id,
		keywords = '',
		list = [],
		loading = false,
		onCopy = () => {},
		onCustomClick = () => {},
		poppable = false,
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
							format,
							keywords,
							onCopy,
							onCustomClick,
							poppable,
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

const removeHTMLEntities = text => {
	const span = document.createElement('span');
	return text.replace(/&[#A-Za-z0-9]+;/gi, entity => {
		span.innerHTML = entity;
		return span.innerText;
	});
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert) => {
	const strip = stripHTMLTags
		? removeHTMLEntities(striptags(typeof toConvert === 'string' ? toConvert : ''))
		: toConvert;
	const replaceText = reactStringReplace(strip, new RegExp('(' + keywords + ')', 'gi'), (match, index) => {
		return (
			<span key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
				{match}
			</span>
		);
	});

	return replaceText;
};

const Cell = memo(
	({
		row: { original },
		other: {
			copyable,
			clickable,
			format,
			keywords,
			onCopy,
			onCustomClick,
			poppable,
			stripHTMLTags,
			showTooltip,
			tooltip
		},
		value
	}) => {
		if (typeof value === 'undefined') return null;

		const [visible, setVisible] = useState(false);

		const RenderWithTooltip = ({ children }) => {
			if (!showTooltip) return children;
			return (
				<Tooltip placement="right" title={tooltip ? tooltip : value}>
					{children}
				</Tooltip>
			);
		};

		if (format.length !== 0) {
			const Cleave = require('cleave.js/react');

			let blocks = format.map(d => parseInt(d.characterLength)),
				delimiters = format.map(d => d.delimiter);
			delimiters.pop();

			return (
				<RenderWithTooltip>
					<Cleave
						disabled={true}
						options={{ delimiters, blocks }}
						value={value}
						style={{ border: 'none', backgroundColor: 'transparent' }}
					/>
				</RenderWithTooltip>
			);
		}

		const finalValue = stripHTMLTags
			? highlightsKeywords(keywords, (stripHTMLTags = true), value)
			: highlightsKeywords(keywords, (stripHTMLTags = false), value);

		return poppable ? (
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
					<RenderWithTooltip>{finalValue}</RenderWithTooltip>
				</Typography.Paragraph>
			</Popover>
		) : (
			<RenderWithTooltip>
				<Typography.Paragraph
					ellipsis={{ rows: 2 }}
					style={{ marginBottom: 0, cursor: clickable ? 'pointer' : 'auto' }}
					onClick={() => (clickable ? onCustomClick(original) : null)}
					copyable={
						copyable
							? {
									onCopy: () => onCopy(striptags(typeof value === 'string' ? value : ''), original)
							  }
							: false
					}>
					{finalValue}
				</Typography.Paragraph>
			</RenderWithTooltip>
		);
	}
);

export default ColumnString;
