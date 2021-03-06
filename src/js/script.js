/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
	;('use strict')

	const select = {
		templateOf: {
		  menuProduct: '#template-menu-product',
		  cartProduct: '#template-cart-product', // CODE ADDED
		},
		containerOf: {
		  menu: '#product-list',
		  cart: '#cart',
		},
		all: {
		  menuProducts: '#product-list > .product',
		  menuProductsActive: '#product-list > .product.active',
		  formInputs: 'input, select',
		},
		menuProduct: {
		  clickable: '.product__header',
		  form: '.product__order',
		  priceElem: '.product__total-price .price',
		  imageWrapper: '.product__images',
		  amountWidget: '.widget-amount',
		  cartButton: '[href="#add-to-cart"]',
		},
		widgets: {
		  amount: {
			input: 'input.amount', // CODE CHANGED
			linkDecrease: 'a[href="#less"]',
			linkIncrease: 'a[href="#more"]',
		  },
		},
		// CODE ADDED START
		cart: {
		  productList: '.cart__order-summary',
		  toggleTrigger: '.cart__summary',
		  totalNumber: `.cart__total-number`,
		  totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
		  subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
		  deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
		  form: '.cart__order',
		  formSubmit: '.cart__order [type="submit"]',
		  phone: '[name="phone"]',
		  address: '[name="address"]',
		},
		cartProduct: {
		  amountWidget: '.widget-amount',
		  price: '.cart__product-price',
		  edit: '[href="#edit"]',
		  remove: '[href="#remove"]',
		},
		// CODE ADDED END
	  };
	  
	  const classNames = {
		menuProduct: {
		  wrapperActive: 'active',
		  imageVisible: 'active',
		},
		// CODE ADDED START
		cart: {
		  wrapperActive: 'active',
		},
		// CODE ADDED END
	  };
	  
	  const settings = {
		amountWidget: {
		  defaultValue: 1,
		  defaultMin: 1,
		  defaultMax: 9,
		}, // CODE CHANGED
		// CODE ADDED START
		cart: {
		  defaultDeliveryFee: 20,
		},
		// CODE ADDED END
	  };
	  
	  const templates = {
		menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
		// CODE ADDED START
		cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
		// CODE ADDED END
	  };

	class Product {
		constructor(id, data) {
			const thisProduct = this
			thisProduct.id = id
			thisProduct.data = data
			thisProduct.renderInMenu()
			thisProduct.getElements()
			thisProduct.initAccordion()
			thisProduct.initOrderForm()
			thisProduct.initAmountWidget()
			thisProduct.processOrder()

			//console.log('new Product: ', thisProduct)
		}
		renderInMenu() {
			const thisProduct = this
			const generatedHTML = templates.menuProduct(thisProduct.data)
			thisProduct.element = utils.createDOMFromHTML(generatedHTML)
			const menuContainer = document.querySelector(select.containerOf.menu)
			menuContainer.appendChild(thisProduct.element)
		}
		getElements(){
			const thisProduct = this;
		  
			thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
			thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
			thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
			thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
			thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
			thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
			thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
		  }
		initAccordion(){
			const thisProduct = this;
			//const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
			
			thisProduct.accordionTrigger.addEventListener('click', function(event) {
				event.preventDefault();
				const activeProduct = document.querySelector(select.all.menuProductsActive);

				if(activeProduct && activeProduct != thisProduct.element){
					activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
				   }
				   thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
			});
		}
		initOrderForm(){
			const thisProduct = this;
			thisProduct.form.addEventListener('submit', function(event){
				event.preventDefault();
				thisProduct.processOrder();
			  });
			  
			  for(let input of thisProduct.formInputs){
				input.addEventListener('change', function(){
				  thisProduct.processOrder();
				});
			  }
			  
			  thisProduct.cartButton.addEventListener('click', function(event){
				event.preventDefault();
				thisProduct.processOrder();
				thisProduct.addToCart();
			  });
			  
			//console.log("Nazwa metody initOrderFrom")
		}
		processOrder(){
			const thisProduct = this;
			const formData = utils.serializeFormToObject(thisProduct.form);
			//console.log('formData', formData);
			//console.log("Nazwa metody processOrder");

			let price = thisProduct.data.price;
  
  			for(let paramId in thisProduct.data.params) {
    
    		const param = thisProduct.data.params[paramId];
    		//console.log(paramId, param);

    
    		for(let optionId in param.options) {
      
      		const option = param.options[optionId];
			  const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
      		//console.log(optionId, option);
			  if(optionSelected) {
				if(!option.default===true) {
				  price+=option.price;
				}
			  } else {
				if(!option.default===false) {
				  price-=option.price;
				}
			  }
			  const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
			  
			  if(optionImage){
				if(optionSelected){
					optionImage.classList.add(classNames.menuProduct.imageVisible)
				} else {
					optionImage.classList.remove(classNames.menuProduct.imageVisible)
				}
			  }
    }
  }
  price *= thisProduct.amountWidget.value;
  thisProduct.priceSingle = price;
  thisProduct.priceElem.innerHTML = price;
		}

		initAmountWidget(){
			const thisProduct = this;

			thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

			thisProduct.amountWidgetElem.addEventListener('updated', function(){
				thisProduct.processOrder();
			});
		}

		addToCart(){
			const thisProduct = this;

			app.cart.add(thisProduct.prepareCartProduct());
		}

		prepareCartProduct(){
			const thisProduct = this;

			const productSummary = {};

			productSummary.id = thisProduct.id;
			productSummary.name = thisProduct.data.name;
			productSummary.amount = thisProduct.amountWidget.value;
			productSummary.priceSingle = thisProduct.priceSingle;
			productSummary.price = productSummary.priceSingle * thisProduct.amountWidget.value;

			productSummary.params = {};
			productSummary.params = thisProduct.prepareCartProductParams();

			return productSummary;
		}

		prepareCartProductParams() {
			const thisProduct = this;
		  
			const formData = utils.serializeFormToObject(thisProduct.form);
			const params = {};
		  
			// for very category (param)
			for(let paramId in thisProduct.data.params) {
			  const param = thisProduct.data.params[paramId];
		  
			  // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
			  params[paramId] = {
				label: param.label,
				options: {}
			  }
		  
			  // for every option in this category
			  for(let optionId in param.options) {
				const option = param.options[optionId];
				const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
		  
				if(optionSelected) {
				  params[paramId].optionId = option.label;
				}
			  }
			  console.log('params: ', params);
			}
		  
			return params;
		  }
	}

	class AmountWidget {
		constructor(element){
			const thisWidget = this;
			thisWidget.getElements(element);
			thisWidget.setValue(thisWidget.input.value);
			thisWidget.initActions();

			console.log('AmountWidget: ', thisWidget)
			console.log('constructor arguments: ', element)
		}
		getElements(element){
			const thisWidget = this;
		  
			thisWidget.element = element;
			thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
			thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
			thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
			thisWidget.value = settings.amountWidget.defaultValue;
		  }
		  setValue(value){
			const thisWidget = this;
			console.log('thisWidget: ',thisWidget);
			const newValue = parseInt(value);
			console.log('newValue: ',newValue);
	  
			/*TODO: Add validation */
			if(thisWidget.value !== newValue && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && settings.amountWidget.defaultMax >= newValue) {
			  thisWidget.value = newValue;
			}
			thisWidget.input.value = thisWidget.value;
			thisWidget.announce();
		  }
		  initActions(){
			  const thisWidget = this;

			  thisWidget.input.addEventListener('change', function(){
				  thisWidget.setValue(thisWidget.input.value);
			  });
			  thisWidget.linkDecrease.addEventListener('click', function(event){
				  event.preventDefault();
				  thisWidget.setValue(thisWidget.value - 1);
			  });
			  thisWidget.linkIncrease.addEventListener('click', function(event){
				event.preventDefault();
				thisWidget.setValue(thisWidget.value + 1);
		  });
	}
	announce(){
		const thisWidget = this;

		const event = new Event('updated');
		thisWidget.element.dispatchEvent(event);
	}

}

	class Cart{
		constructor(element){
			const thisCart = this;

			thisCart.products = [];

			thisCart.getElements(element);
			thisCart.initActions();

			console.log('new Cart', thisCart)
		}

		getElements(element){
			const thisCart = this;

			thisCart.dom = {};

			thisCart.dom.wrapper = element;
			thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
			thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList)
		}
		initActions(){
			const thisCart = this;

			thisCart.dom.toggleTrigger.addEventListener('click', function(event){
				event.preventDefault();
			
				thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
			  });
		}
		add(menuProduct){
			const thisCart = this;
			const generatedHTML = templates.cartProduct(menuProduct);
			const generatedDOM = utils.createDOMFromHTML(generatedHTML);

			thisCart.dom.productList.appendChild(generatedDOM);

			console.log('adding product', menuProduct)
		}
	}

	const app = {
		initMenu: function () {
			const thisApp = this

			//console.log('thisApp.data: ', thisApp.data)

			for (let productData in thisApp.data.products) {
				new Product(productData, thisApp.data.products[productData])
			}
		},

		initData: function () {
			const thisApp = this

			thisApp.data = dataSource
		},

		init: function () {
			const thisApp = this
			/*console.log('*** App starting ***')
			console.log('thisApp:', thisApp)
			console.log('classNames:', classNames)
			console.log('settings:', settings)
			console.log('templates:', templates) */

			thisApp.initData();
			thisApp.initMenu();
			thisApp.initCart();
		},

		initCart: function(){
			const thisApp = this;

			const cartElem = document.querySelector(select.containerOf.cart);
			thisApp.cart = new Cart(cartElem);
		},
	}

	app.init()
}
