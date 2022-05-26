import React, { lazy, memo, useRef } from 'react';
import InputText from '@volenday/input-text';
import { Controller, useForm } from 'react-hook-form';

const RenderWithTooltip = lazy(() => import('../renderWithToolTip'));

const Editable = ({ format, id, onChange, original, showTooltip, tooltip, value }) => {
	const formRef = useRef();

	const originalValue = value;
	const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
	const onSubmit = values => onChange({ ...values, Id: original.Id });

	return (
		<RenderWithTooltip show={showTooltip} title={tooltip ? tooltip : value}>
			<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
				<Controller
					control={control}
					name={id}
					render={({ onChange, value, name }) => (
						<InputText
							format={format}
							id={name}
							onBlur={() =>
								originalValue !== value &&
								formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))
							}
							onChange={e => onChange(e.target.value)}
							onPressEnter={e => e.target.blur()}
							withLabel={false}
							value={value}
						/>
					)}
				/>
			</form>
		</RenderWithTooltip>
	);
};

export default memo(Editable);
