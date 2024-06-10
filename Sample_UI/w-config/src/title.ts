(() => {
	const host = window.location.host.split('.');
	let documentTitle = 'WealthVision';

	if (host.length >= 1) {
		const environment = host[0];
		if (environment.length >= 1) {
			documentTitle = `${documentTitle} - ${environment.charAt(0).toUpperCase().concat(environment.substring(1, environment.length))} `;
		}
	}

	document.title = documentTitle;
})();
