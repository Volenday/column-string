import React, { memo, useEffect, useState, useCallback } from 'react';
import { Button, Checkbox, Divider, Input, Popover, Spin } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import striptags from 'striptags';
import { FixedSizeList } from 'react-window';
import { isEqual } from 'lodash';

const Filter = ({ column, id, list, setFilter, loading = false }) => {
	const [selected, setSelected] = useState(['(Blank)', ...list]);
	const [newOptions, setNewOptions] = useState(['(Blank)', ...list]);
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);
	const [sort, setSort] = useState('');
	const [selectedAll, setSelectedtAll] = useState(false);

	const listCount = newOptions.length;
	const withFilterValue = column.filterValue ? (column.filterValue.length !== 0 ? true : false) : false;

	useEffect(() => {
		if (!!column.filterValue)
			setSelected(prev =>
				column.filterValue.length === 0 ? prev : column.filterValue.map(d => (d === '' ? '(Blank)' : d))
			),
				setSelectedtAll(column.filterValue.length === list.length + 1 ? true : false);
	}, [JSON.stringify(column.filterValue)]);

	useEffect(() => {
		setSort(column.isSorted ? (column.isSortedDesc ? 'DESC' : 'ASC') : '');
	}, [column.isSorted, column.isSortedDesc]);

	useEffect(() => {
		setSelectedtAll(selected.length === list.length + 1 ? true : false);
	}, [selected.length]);

	const selectItem = value => {
		if (selected.includes(value)) setSelected(selected.filter(d => d !== value));
		else setSelected([...selected, value]);
	};

	const Row = useCallback(
		({ index, style }) => {
			const item = newOptions[index];
			const text = striptags(item);

			const finalValue =
				text.length >= 50 ? (
					<div style={{ display: 'flex' }}>
						<span>{text.substr(0, 50).trim()}...</span>
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
						checked={selected.includes(item)}
						onChange={() => selectItem(item)}
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
		if (value === '') return setNewOptions(list);
		setNewOptions(list.filter(d => d.match(new RegExp(value, 'i'))));
	};

	const onOk = () => {
		setFilter(
			id,
			selectedAll
				? isEqual(
						newOptions.filter(d => d !== '(Blank)'),
						list
				  )
					? []
					: newOptions
				: selected.map(d => (d === '(Blank)' ? '' : d))
		);

		if (sort) column.toggleSortBy(sort === 'ASC' ? false : sort === 'DESC' ? true : '');
		else column.clearSortBy();
	};

	const onSelectAll = () => {
		if (selectedAll) return onClearAll();
		setSelected(['(Blank)', ...list]);
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
