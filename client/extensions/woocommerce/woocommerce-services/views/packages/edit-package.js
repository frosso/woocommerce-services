/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { omit, trim } from 'lodash';

/**
 * Internal dependencies
 */
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FieldError from '../../components/field-error';
import inputFilters from './input-filters';

const renderDimensionsInput = ( dimensionsName, dimensionsStr, dimensionsUnit, updateField ) => {
	const { length, width, height } = inputFilters.parseDimensions( dimensionsStr );
	const onChange = event => {
		const name = event.target.name;
		const value = event.target.value;
		const allDimensions = [
			'length' === name ? value : length,
			'width' === name ? value : width,
			'height' === name ? value : height,
		];
		updateField( dimensionsName, allDimensions.join( ' x ' ) );
	};

	return (
		<FormDimensionsInput
			dimensionsUnit={ dimensionsUnit }
			dimensions={ { width, height, length } }
			onChange={ onChange }
		/>
	);
};

const EditPackage = props => {
	const {
		siteId,
		form,
		setModalErrors,
		updatePackagesField,
		translate,
	} = props;

	const { mode, modalErrors, dimensionUnit, weightUnit, packageData } = form;

	const {
		name,
		inner_dimensions,
		box_weight,
		is_letter,
	} = packageData;

	const updateField = ( key, value ) => {
		setModalErrors( siteId, omit( modalErrors, key ) );
		updatePackagesField( siteId, { [ key ]: value } );
	};

	const updateTextField = event => {
		const key = event.target.name;
		const value = event.target.value;
		updateField( key, value );
	};

	const fieldInfo = ( field, nonEmptyText ) => {
		const altText = nonEmptyText || translate( 'Invalid value.' );
		const text =
			'' === trim( packageData[ field ] ) ? translate( 'This field is required.' ) : altText;
		return modalErrors[ field ] ? <FieldError text={ text } /> : null;
	};

	const onPackageTypeSelect = event => {
		updatePackagesField( siteId, { is_letter: 'envelope' === event.target.value } );
	};
	const renderTypeSelection = () => {
		return (
			<FormFieldset>
				<FormLabel htmlFor="package_type">{ translate( 'Type of package' ) }</FormLabel>
				<FormSelect
					id="package_type"
					onChange={ onPackageTypeSelect }
					value={ is_letter ? 'envelope' : 'box' }
				>
					<option value="box">{ translate( 'Box' ) }</option>
					<option value="envelope">{ translate( 'Envelope' ) }</option>
				</FormSelect>
			</FormFieldset>
		);
	};

	return (
		<div>
			{ 'add-custom' === mode ? renderTypeSelection() : null }
			<FormFieldset>
				<FormLabel htmlFor="name">{ translate( 'Package name' ) }</FormLabel>
				<FormTextInput
					id="name"
					name="name"
					placeholder={ translate( 'Unique package name' ) }
					value={ name || '' }
					onChange={ updateTextField }
					isError={ modalErrors.name }
				/>
				{ fieldInfo( 'name', translate( 'This field must be unique' ) ) }
			</FormFieldset>
			<FormFieldset className="packages__add-package-weight-group">
				<div className="packages__add-package-weight">
					<FormLabel>
						{ translate( 'Dimensions (L x W x H)' ) }
					</FormLabel>
					{ renderDimensionsInput(
						'inner_dimensions',
						inner_dimensions,
						dimensionUnit,
						updateField
					) }
					{ fieldInfo( 'inner_dimensions' ) }
				</div>
				<div className="packages__add-package-weight">
					<FormLabel htmlFor="box_weight">{ translate( 'Weight of empty package' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="box_weight"
						name="box_weight"
						placeholder={ translate( '0.0' ) }
						value={ box_weight || '' }
						onChange={ updateTextField }
						isError={ modalErrors.box_weight }
						type="number"
						noWrap
						suffix={ weightUnit }
					/>
					{ fieldInfo( 'box_weight' ) }
				</div>
			</FormFieldset>
		</div>
	);
};

EditPackage.propTypes = {
	siteId: PropTypes.number.isRequired,
	form: PropTypes.object.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	packageData: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		inner_dimensions: PropTypes.string.isRequired,
		box_weight: PropTypes.number.isRequired,
		is_user_defined: PropTypes.bool.isRequired,
		is_letter: PropTypes.bool.isRequired,
	} ),
	setModalErrors: PropTypes.func.isRequired,
};

export default localize( EditPackage );
