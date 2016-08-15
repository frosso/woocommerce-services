import React, { PropTypes } from 'react';
import Dropdown from 'components/dropdown';

const CountryDropdown = ( props ) => {
	const valuesMap = {};
	Object.keys( props.countriesData ).forEach( ( countryCode ) => {
		valuesMap[ countryCode ] = props.countriesData[ countryCode ].name;
	} );
	return (
		<Dropdown
			{ ...props }
			valuesMap={ valuesMap }
			/>
	);
};

CountryDropdown.propTypes = {
	id: PropTypes.string.isRequired,
	countriesData: PropTypes.object.isRequired,
	valuesMap: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.string.isRequired,
	updateValue: PropTypes.func.isRequired,
	error: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.bool,
	] ),
};

export default CountryDropdown;
