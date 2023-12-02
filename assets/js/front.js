const apiBaseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/zhu001`;

const elmtProductArea = document.querySelector(".productWrap");
const elmtCartBody = document.querySelector(".shoppingCart-body");
const elmtBtnDeleteAll = document.querySelector(".discardAllBtn");
const elmtOrderForm = document.querySelector(".orderInfo-form");
const elmtBtnSaveOrder = document.querySelector(".orderInfo-btn");

let products;


/* 商品 */
function processProductArea()
{
	const url = `${apiBaseUrl}/products`;
	
	axios.get(url)
		.then(function (res) {
			products = res.data.products;
			renderProductArea(products);
		})
		.catch(utility.processAxiosError);
}

function renderProductArea(list)
{
	let html = ``;
	
	try {
		list.forEach((item) => {
			html += getHtmlProductCard(item);
		});
		elmtProductArea.innerHTML = html;
	}
	catch (err) {
		console.error(err);
	}
}

function getHtmlProductCard (item)
{
	let html = '';
	
	html += `<li class="productCard">`;
	html += `<h4 class="productType">新品</h4>`;
	html += `<img src="${item.images}" alt="${item.title}">`;
	html += `<a href="#" role="button" class="addCardBtn" data-product-id="${item.id}">加入購物車</a>`;
	html += `<h3>${item.title}</h3>`;
	html += `<del class="originPrice">NT$${utility.formatCurrency(item.origin_price)}</del>`;
	html += `<p class="nowPrice">NT$${utility.formatCurrency(item.price)}</p>`;
	html += `</li>`;
	
	return html;
}


// 篩選商品
function filterProduct(category)
{
	let filterDatas = products;
	
	if (category) {
		filterDatas = products.filter(function (item) {
			return item.category == category;
		});
	}
	
	renderProductArea(filterDatas);
}


/* 購物車 */
function processCartArea()
{
	const url = `${apiBaseUrl}/carts`;
	
	axios.get(url)
		.then(function (res) {
			renderCartArea(res.data);
		})
		.catch(utility.processAxiosError);
}

function renderCartArea(cartData)
{
	try
	{
		// 購物車項目
		let html = '';
		cartData.carts.forEach(function (item) {
			html += getHtmlCart(item);
		});
		elmtCartBody.innerHTML = html;
		
		// 顯示 / 隱藏 刪除按鈕
		if (html.length) {
			elmtBtnDeleteAll.classList.remove("d-none");
			elmtBtnSaveOrder.classList.remove("d-none");
		}
		else {
			elmtBtnDeleteAll.classList.add("d-none");
			elmtBtnSaveOrder.classList.add("d-none");
		}
		
		// 總金額
		document.querySelector("#total").textContent = utility.formatCurrency(cartData.finalTotal);
	}
	catch (err) {
		console.error(err);
	}
}

function getHtmlCart(item)
{
	const cartId = item.id;
	const productId = item.product.id;
	const title = item.product.title;
	const price = item.product.price;
	const quantity = item.quantity;
	
	let html = '';
	
	html += `<tr data-cart-id="${cartId}" data-product-id="${productId}" data-quantity="${quantity}">`;
	
	// 品項
	html += `<td>`;
	html += `<div class="cardItem-title">`;
	html += `<img src="${item.product.images}" alt="${title}">`;
	html += `<p>${title}</p>`;
	html += `</div>`;
	html += `</td>`;
	
	// 單價
	html += `<td>NT$${utility.formatCurrency(price)}</td>`;
	
	// 數量
	html += `<td>${quantity}</td>`;
	
	// 金額
	html += `<td>NT$${utility.countSubtotal(price, quantity)}</td>`;
	
	// button : 刪除
	html += `<td class="discardBtn">`;
	html += `<a href="#" role="button" class="material-icons" data-cart-id="${cartId}">clear</a>`;
	html += `</td>`;
	
	html += `</tr>`;
	
	return html;
}


// 加入 / 修改購物車
function addModifyCart(elmt)
{
	const url = `${apiBaseUrl}/carts`;
	const productId = elmt.dataset.productId;
	const elmtCart = elmtCartBody.querySelector(`[data-product-id='${productId}']`);
	
	const axiosConfig = {
		url: url,
	};
	
	// 資料已存在 : modify
	if (elmtCart)
	{
		axiosConfig.method = "patch";
		axiosConfig.data = {
			"data": {
				"id": elmtCart.dataset.cartId,
				"quantity": ++ elmtCart.dataset.quantity
			}
		};
	}
	// 資料不存在 : add
	else
	{
		axiosConfig.method = "post";
		axiosConfig.data = {
			"data": {
				"productId": productId,
				"quantity": 1
			}
		};
	}
	
	axios(axiosConfig)
		.then(function (res) {
			renderCartArea(res.data);
		})
		.catch(utility.processAxiosError);
}


// 刪除購物車
function deleteCart(id)
{
	let url = `${apiBaseUrl}/carts`;
	
	if (id) {
		url += `/${id}`;
	}
	
	axios.delete(url)
		.then(function (res) {
			renderCartArea(res.data);
		})
		.catch(utility.processAxiosError);
}


// 送出訂單
function saveOrder()
{
	const url = `${apiBaseUrl}/orders`;
	
	const data = {
		"data": {
			"user": {
				"name": document.querySelector("#customerName").value,
				"tel": document.querySelector("#customerPhone").value,
				"email": document.querySelector("#customerPhone").value,
				"address": document.querySelector("#customerAddress").value,
				"payment": document.querySelector("#tradeWay").value
			}
		}
	};
	
	axios.post(url, data)
		.then(function (res) {
			alert("訂購成功！｡:.ﾟヽ(*´∀`)ﾉﾟ.:｡");
			elmtOrderForm.reset();
			processCartArea();
		})
		.catch(utility.processAxiosError);
}


function init()
{
	// 商品篩選下拉選單
	document.querySelector(".productSelect").addEventListener("change", function (e) {
		filterProduct(e.target.value);
	});
	
	// 商品卡片區
	elmtProductArea.addEventListener("click", function (e) {
		const elmt = e.target;
		
		// button : 加入購物車
		if (elmt.getAttribute("role") === "button") {
			e.preventDefault();
			addModifyCart(elmt);
		}
	});
	
	// 購物車項目區
	elmtCartBody.addEventListener("click", function (e) {
		const elmt = e.target;
		
		// button : 刪除單筆
		if (elmt.getAttribute("role") === "button") {
			e.preventDefault();
			deleteCart(elmt.dataset.cartId);
		}
	});
	
	// 刪除所有品項
	elmtBtnDeleteAll.addEventListener("click", function (e) {
		e.preventDefault();
		if (confirm ("確定要清空購物車？༼ಢ_ಢ༽")) {
			deleteCart();
		}
	});
	
	// 預訂表單
	elmtOrderForm.addEventListener("submit", function (e) {
		e.preventDefault();
		saveOrder();
	});
	
	processProductArea();
	processCartArea();
}
init();