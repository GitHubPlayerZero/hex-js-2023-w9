const dateUtil =
{
	formateDate: (date, separator = "/") => {
		return date.getFullYear() + separator + 
			String(date.getMonth() + 1).padStart(2, "0") + separator + 
			date.getDate().toString().padStart(2, "0");
	},
	
	getDateByTime: (timestamp) => new Date(timestamp),
	
	getDateBySeconds: function (sec) {
		return this.getDateByTime(sec * 1000)
	},
	
	formatDateBySeconds: function (sec) {
		return this.formateDate(this.getDateBySeconds(sec));
	},
};