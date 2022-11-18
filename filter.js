import React, { memo, useEffect, useState, useCallback } from 'react';
import { Button, Checkbox, Divider, Input, Popover, Spin } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import striptags from 'striptags';
import { FixedSizeList } from 'react-window';
import { isEqual } from 'lodash';

const Filter = ({ column, id, list, listObject, setFilter, disableSortBy, loading = false, useListObject }) => {
	const [selected, setSelected] = useListObject
		? useState(['(Blank)', ...listObject])
		: useState(['(Blank)', ...list]);
	const [newOptions, setNewOptions] = useListObject
		? useState(['(Blank)', ...listObject])
		: useState(['(Blank)', ...list]);
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);
	const [sort, setSort] = useState('');
	const [selectedAll, setSelectedtAll] = useState(false);

	const listCount = newOptions.length;
	const withFilterValue = column.filterValue ? (column.filterValue.length !== 0 ? true : false) : false;

	useEffect(() => {
		if (!!column.filterValue) {
			setSelected(prev => {
				return column.filterValue.length === 0
					? prev
					: column.filterValue.map(d =>
							d === '' ? '(Blank)' : useListObject ? newOptions.find(e => e.originalData === d) : d
					  );
			});

			if (useListObject) setSelectedtAll(selected.length === listObject.length + 1 ? true : false);
			else setSelectedtAll(selected.length === list.length + 1 ? true : false);
		}
	}, [JSON.stringify(column.filterValue), useListObject, newOptions]);

	useEffect(() => {
		setSort(column.isSorted ? (column.isSortedDesc ? 'DESC' : 'ASC') : '');
	}, [column.isSorted, column.isSortedDesc]);

	useEffect(() => {
		if (useListObject) setSelectedtAll(selected.length === listObject.length + 1 ? true : false);
		else setSelectedtAll(selected.length === list.length + 1 ? true : false);
	}, [selected.length, useListObject]);

	const selectItem = value => {
		if (selected.includes(value)) setSelected(selected.filter(d => d !== value));
		else setSelected([...selected, value]);
	};

	const Row = useCallback(
		({ index, style }) => {
			const item = newOptions[index];
			const text = striptags(typeof item === 'string' ? item : typeof item === 'object' ? item.cleanedData : '');

			const finalValue =
				text.length >= 55 ? (
					<div style={{ display: 'flex' }}>
						<span
							style={{
								width: '370px',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis'
							}}
							dangerouslySetInnerHTML={{ __html: text }}
						/>
						<Popover
							content={
								<>
									<div dangerouslySetInnerHTML={{ __html: text }} />
									<br />
								</>
							}
							trigger="hover"
							placement="top"
							style={{ width: 350 }}>
							<Button
								type="link"
								onClick={e => e.stopPropagation()}
								size="small"
								style={{ lineHeight: 0.5, marginLeft: 10, padding: 0, height: 'auto' }}>
								<span style={{ color: '#1890ff' }}>show more</span>
							</Button>
						</Popover>
					</div>
				) : (
					text
				);

			return (
				<div style={{ ...style, cursor: 'pointer', padding: '5px 0px', borderBottom: '1px solid #f0f0f0' }}>
					<Checkbox
						checked={selected.includes(typeof item === 'string' || typeof item === 'object' ? item : '')}
						onChange={() => selectItem(typeof item === 'string' || typeof item === 'object' ? item : '')}
						style={{ textAlign: 'justify' }}>
						{finalValue}
					</Checkbox>
				</div>
			);
		},
		[newOptions, selected]
	);

	const renderCount = () => {
		if (!column.filterValue) return null;
		if (!Array.isArray(column.filterValue)) return null;
		if (column.filterValue.length === 0) return null;
		return <span>({column.filterValue.length})</span>;
	};

	const handleSearch = value => {
		if (value === '') {
			if (!useListObject) return setNewOptions(list);
			else return setNewOptions(listObject);
		}

		// Replace parentheses with escaped parentheses so that regex don't read it as a group
		value = value.replace(/\(/gi, '\\(');
		value = value.replace(/\)/gi, '\\)');

		let foundData = [];

		if (!useListObject) foundData = list.filter(d => d.match(new RegExp(value, 'gi')));
		else foundData = listObject.filter(d => d.cleanedData.match(new RegExp(value, 'gi')));

		setNewOptions(foundData);
	};

	const onOk = () => {
		setFilter(
			id,
			selectedAll
				? isEqual(
						newOptions.filter(d => d !== '(Blank)'),
						!useListObject ? list : listObject
				  )
					? []
					: newOptions
				: selected.map(d =>
						d === '(Blank)' ? '' : typeof d === 'string' ? d : typeof d === 'object' ? d.originalData : ''
				  )
		);

		if (sort) column.toggleSortBy(sort === 'ASC' ? false : sort === 'DESC' ? true : '');
		else if (column.clearSortBy) column.clearSortBy();
	};

	const onSelectAll = () => {
		if (selectedAll) return onClearAll();
		useListObject ? setSelected(['(Blank)', ...listObject]) : setSelected(['(Blank)', ...list]);
		setSelectedtAll(true);
	};

	const onClearAll = () => {
		setSelected([]);
		setSelectedtAll(false);
	};

	const renderPopoverContent = () => {
		const a2zType = sort === 'ASC' ? 'primary' : 'default',
			z2aType = sort === 'DESC' ? 'primary' : 'default';
		return (
			<>
				{!disableSortBy && (
					<>
						<div>
							<h4>Sort</h4>
							<Button
								onClick={() => (sort !== 'ASC' ? setSort('ASC') : setSort(''))}
								type={a2zType}
								style={{ width: '49%' }}>
								A to Z
							</Button>
							<Button
								onClick={() => (sort !== 'DESC' ? setSort('DESC') : setSort(''))}
								type={z2aType}
								style={{ marginLeft: '2%', width: '49%' }}>
								Z to A
							</Button>
						</div>
						<Divider style={{ margin: '10px 0px' }} />
					</>
				)}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<h4>Filter {renderCount()}</h4>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Checkbox checked={selectedAll} onClick={() => onSelectAll()} style={{ fontSize: '15px' }}>
								Select All
							</Checkbox>
							<Button onClick={() => onClearAll()} size="small" type="link" danger>
								Clear All
							</Button>
						</div>
					</div>
					<Input.Search
						allowClear
						disabled={loading}
						onKeyUp={e => handleSearch(e.target.value)}
						onSearch={handleSearch}
						placeholder="Search"
					/>
					{loading ? (
						<div style={{ display: 'flex', justifyContent: 'center', margin: '15px' }}>
							<Spin
								tip="Please wait, while options are loading."
								size="small"
								style={{ fontSize: '10pt' }}
							/>
						</div>
					) : (
						<FixedSizeList height={150} itemCount={listCount} itemSize={30} width={500}>
							{Row}
						</FixedSizeList>
					)}
				</div>
				<Divider style={{ margin: '10px 0px' }} />
				<div>
					<h4>Column Settings</h4>
					<Checkbox {...column.getToggleHiddenProps()}>Visible</Checkbox>
				</div>
				<Divider style={{ margin: '10px 0px' }} />
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '50%'
						}}>
						<Button onClick={closePopover} type="default">
							Cancel
						</Button>
						<Button disabled={selected.length === 0} onClick={onOk} type="primary">
							OK
						</Button>
					</div>
				</div>
			</>
		);
	};

	const openPopover = () => setIsPopoverVisible(true);
	const closePopover = () => setIsPopoverVisible(false);

	return (
		<Popover
			content={renderPopoverContent}
			trigger="click"
			visible={isPopoverVisible}
			onVisibleChange={e => setIsPopoverVisible(e)}>
			{withFilterValue ? (
				<FilterFilled onClick={openPopover} style={{ cursor: 'pointer' }} />
			) : (
				<FilterOutlined onClick={openPopover} style={{ cursor: 'pointer' }} />
			)}
		</Popover>
	);
};

export default memo(Filter);
