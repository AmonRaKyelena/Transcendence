import React, { Component, FC, useEffect } from 'react';

export const Provider: FC<{children: Component}> = ({ children }) => {
	useEffect(() => {
		// checking localStorage
		/// fetch
		/// save data
		// save localStorage
	}, [])



	return (
		<div>
			{children}
		</div>
	);
}






export const Main = () => {
	return (
		<Provider>
			<
		</Provider>
	);
}