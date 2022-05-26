import React, { lazy, memo, Suspense, useMemo } from 'react';
import striptags from 'striptags';
import { Skeleton } from 'antd';
import reactStringReplace from 'react-string-replace';

const removeHTMLEntities = text => {
	const span = document.createElement('span');
	return text.replace(/&[#A-Za-z0-9]+;/gi, entity => {
		span.innerHTML = entity;
		return span.innerText;
	});
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert) => {
	const strip = stripHTMLTags ? removeHTMLEntities(striptags(toConvert)) : toConvert;
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
		},
		value
	}) => {
		if (typeof value === 'undefined') return null;

		if (editable && !multiple && !richText) {
			const Editable = lazy(() => import('./editable'));
			return (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Editable
						format={format}
						id={id}
						onChange={onChange}
						original={original}
						showTooltip={showTooltip}
						tooltip={tooltip}
						value={value}
					/>
				</Suspense>
			);
		}

		if (format.length !== 0) {
			const Format = lazy(() => import('./format'));
			return (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Format format={format} showTooltip={showTooltip} tooltip={tooltip} value={value} />
				</Suspense>
			);
		}

		const finalValue = useMemo(
			() =>
				stripHTMLTags
					? highlightsKeywords(keywords, (stripHTMLTags = true), value)
					: highlightsKeywords(keywords, (stripHTMLTags = false), value),
			[stripHTMLTags, keywords, value]
		);

		if (poppable) {
			const Poppable = lazy(() => import('./poppable'));
			return (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Poppable
						copyable={copyable}
						finalValue={finalValue}
						keywords={keywords}
						onCopy={onCopy}
						original={original}
						showTooltip={showTooltip}
						tooltip={tooltip}
						value={value}
					/>
				</Suspense>
			);
		}

		const Standard = lazy(() => import('./standard'));
		return (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Standard
					clickable={clickable}
					copyable={copyable}
					finalValue={finalValue}
					onCopy={onCopy}
					onCustomClick={onCustomClick}
					original={original}
					showTooltip={showTooltip}
					tooltip={tooltip}
					value={value}
				/>
			</Suspense>
		);
	}
);

export default Cell;
