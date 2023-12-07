const myUrl = new URL(location.href);
const apiPath = myUrl.searchParams.get("apiPath");
const auth = myUrl.searchParams.get("auth");

const apiBaseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}`;
const apiOrders = `${apiBaseUrl}/orders`;

const config = {
	headers: {
		authorization: auth
	}
};

const elmtOrderList = document.querySelector("#orderList");


/* 訂單 */
function processOrder()
{
	axios.get(apiOrders, config)
		.then (function (res) {
			renderOrder(res.data.orders);
		})
		.catch (utility.processAxiosError);
}

function renderOrder(orders)
{
	try {
		renderOrderTable(orders);
		processChart(orders);
	}
	catch (err) {
		console.error(err);
	}
}

function renderOrderTable(orders)
{
	let html = "";
	
	orders.forEach(function (item) {
		html += getHtmlOrder(item);
	});
	
	elmtOrderList.innerHTML = html;
}

// 單筆訂單
function getHtmlOrder(item)
{
	try
	{
		const orderId = item.id;
	
		let html = `<tr>`;
		html += `<td>${orderId}</td>`;	// 訂單編號
		
		// 聯絡人
		html += `<td>`;
		html += `<p>${item.user.name}</p>`;	// 姓名
		html += `<p>${item.user.tel}</p>`;	// 電話
		html += `</td>`;
		
		html += `<td>${item.user.address}</td>`;	// 	聯絡地址
		html += `<td>${item.user.email}</td>`;	// 電子郵件
		
		
		// 訂單品項
		const products = item.products.map(function (item) {
			return item.title;
		}).join("<br>");
		
		html += `<td>`;
		html += `<p>${products}</p>`;
		html += `</td>`;
		
		
		// 訂單日期
		html += `<td>${dateUtil.formatDateBySeconds(item.createdAt)}</td>`;
		
		// 訂單狀態
		const paid = Number(item.paid);
		html += `<td class="orderStatus">`;
		html += `<a href="#" data-id="${orderId}" data-paid="${paid}">${paid? "已處理" : "未處理"}</a>`;
		html += `</td>`;
		
		// 刪除
		html += `<td>`;
		html += `<input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${orderId}">`;
		html += `</td>`;
		
		html += `</tr>`;
		
		return html;
	}
	catch (err) {
		console.error(err);
	}
}


function processChart(orders)
{
	// 統計資料
	let categoryData = {};
	let productData = {};
	
	orders.forEach(function (item)
	{
		const products = item.products;
		
		products.forEach(function (item)
		{
			const category = item.category;
			const product = item.title;
			const quantity = item.quantity;
			
			// 按 categry 統計
			if (categoryData[category]) {
				categoryData[category] += quantity;
			} else {
				categoryData[category] = quantity;
			}
			
			// 按 product 統計
			if (productData[product]) {
				productData[product] += quantity;
			} else {
				productData[product] = quantity;
			}
		});
	});
	
	processChartCategory(categoryData);
	processChartProduct(productData);
}


function processChartCategory(categoryData)
{
	const categoryCountList = Object.entries(categoryData);
	
	// 按 categry 名稱排序
	categoryCountList.sort(function (item1, item2) {
		const a = item1[0];
		const b = item2[0];
		return (a < b) ? -1 : (a > b) ? 1 : 0;
	});
	
	renderChartCategory(categoryCountList);
}

// 圖表 - 全產品類別營收比重
function renderChartCategory(chartData)
{
	let chart = c3.generate({
		bindto: '#chartCategory',
		data: {
			type: "pie",
			columns: chartData,
			colors: {
				"床架": "#DACBFF",
				"收納": "#9D7FEA",
				"窗簾": "#5434A7",
			}
		},
	});
}


function processChartProduct(productData)
{
	const productCountList = Object.entries(productData);
	
	// 按 product 數量排序
	productCountList.sort(function (item1, item2) {
		const a = item1[1];
		const b = item2[1];
		return (a > b) ? -1 : (a < b) ? 1 : 0;
	});
	
	// 整理圖表資料
	const productChartDatas = [];
	const productNum = 3;	// 列出的產品數
	let otherCount = 0;
	
	productCountList.forEach(function (item, index) {
		if (index < productNum) {
			productChartDatas.push(item);
			return;
		}
		otherCount += item[1];
	});
	
	productChartDatas.reverse();
	productChartDatas.push(["其他", otherCount]);
	
	renderChartProduct(productChartDatas);
}

// 圖表 - 全品項營收比重
function renderChartProduct(chartData)
{
	let chart = c3.generate({
		bindto: '#chartProduct',
		data: {
			type: "pie",
			columns: chartData,
		},
		color: {
			pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
		},
	});
}


// 改變訂單狀態
function changeOrderStatus(elmt)
{
	const data = {
		"data": {
			"id": elmt.dataset.id,
			"paid": !Boolean(+elmt.dataset.paid)
		}
	};
	
	axios.put(apiOrders, data, config)
		.then (function (res) {
			renderOrder(res.data.orders);
		})
		.catch (utility.processAxiosError);
}


// 刪除訂單
function deleteOrder(orderId)
{
	let url = apiOrders;
	
	if (orderId) {
		url += `/${orderId}`;
	}
	
	axios.delete(url, config)
		.then (function (res) {
			renderOrder(res.data.orders);
		})
		.catch (utility.processAxiosError);
}


function init()
{
	document.querySelector(".discardAllBtn").addEventListener("click", function (e) {
		e.preventDefault();
		if (confirm("確定要清除全部訂單？")) {
			deleteOrder();
		}
	});
	
	// 訂單 list
	elmtOrderList.addEventListener("click", function (e) {
		const elmt = e.target;
		
		// 訂單狀態
		if (elmt.dataset.paid) {
			e.preventDefault();
			changeOrderStatus(elmt);
		}
		
		// button - 刪除
		if (elmt.type == "button") {
			deleteOrder(elmt.dataset.id);
		}
	});
	
	processOrder();
}
init();