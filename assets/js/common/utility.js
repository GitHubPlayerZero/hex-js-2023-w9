const utility =
{
	processAxiosError: error => {
		console.error(`Axios error ==>`);
		console.error(error);
		console.error(`error message = ${error.message}`);
		console.error(`error response ==>`, error?.response?.data);
		console.error(`response message = ${error?.response?.data?.message}`);
	},
	
	formatCurrency: number => new Intl.NumberFormat().format(number),
};