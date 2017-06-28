window.addEventListener('DOMContentLoaded', function() {
	console.log('--- CONTENT LOADED! ---');

	// clear storage
	/*
	chrome.storage.sync.clear(function() {
		console.log('Storage cleared!');
	});
	*/




	/*
	*
	*
	*********** EXTENSION PAGE OBJECT **********
	*
	*
	*/
	var Extension = {
		selectorGenBtn: 'button.__general',
		selectorFilterBtn: 'button.__filter',
		selectorSortBtn: '.sort-icon.__sort',
	}

	/*
	****** EXTENSION METHOD *****
	*/
	Extension.allBtn = function() {
		// all btn except sortBtn
		return document.querySelectorAll(Extension.selectorGenBtn + ', ' + Extension.selectorFilterBtn);
	}
	Extension.filterBtn = function() {
		return document.querySelectorAll(Extension.selectorFilterBtn);
	}
	Extension.genBtn = function() {
		return document.querySelectorAll(Extension.selectorGenBtn);
	}
	Extension.sortBtn = function() {
		return document.querySelector(Extension.selectorSortBtn);
	}

	Extension.setStorages = function( data, func ) {
		chrome.storage.sync.set(data, func);
		chrome.storage.local.set(data, func);
	}
	Extension.setButtonSetting = function() {
		console.log('--- setButtonSetting ---');
		chrome.storage.sync.get(null, function(items) {
			if ( ! Object.keys(items)[0] ) {return;}
			console.log('loadSetting: ', items);
			var allBtn = Extension.allBtn();
			// set sortBtn sorting value
			Extension.sortBtn().dataset.sorting = items.sortComments;
			// trigger __filter feature
			sortBtnClickHandler(false);
			// activate button by adding class
			for ( let i = 0, x; x = allBtn[i]; i++ ) {
				if ( x.dataset.sorting ) {
					x.dataset.sorting = items.sortComments;
				}
				if ( items[x.dataset.feature] === true ) {
					x.click();
				}
			}
		});
	}
	// save setting to storage
	Extension.saveSetting = function( feature, status ) {
		var ActiveButton = {};
		ActiveButton[feature] = status;
		console.log('saveSetting: ', ActiveButton);
		Extension.setStorages(ActiveButton, function() {
			chrome.storage.sync.get(null, function(items) {
				console.log('settingOnSave: ', items);
			});
		});
	}



	/*
	*********** GENERAL FUNCTIONS **********
	*/
	function chromeQuery( obj, func = null ) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, obj, func);
		});
	}

	function undoFeatureButton( buttonArray ) {
		console.log('undoBtnList: ', buttonArray);
		for ( let i = 0, x; x = buttonArray[i]; i++ ) {
			var obj = {};
			obj[x.dataset.feature] = false;
			chromeQuery(obj, function(response) {
				if ( response.success === true ) {
					x.classList.toggle('_active');
				}
			});
		}
	}

	/*
	*********** EVENT HANDLER FUNCTIONS **********
	*/
	function sortBtnClickHandler( isToggle = true ) {
		var sortBtn = Extension.sortBtn(),
				sorting = sortBtn.dataset.sorting,
				icon = sortBtn.firstElementChild;

		if ( isToggle ) {
			// toggle sorting value
			if ( sorting === 'ASC' ) {
				sortBtn.dataset.sorting = 'DESC';
			} else {
				sortBtn.dataset.sorting = 'ASC';
			}
			// update filterBtn sorting value
			var filterBtn = Extension.filterBtn(),
					sorting = sortBtn.dataset.sorting,
					Obj = {};
			for ( let i = 0, fb; fb = filterBtn[i]; i++ ) {
				fb.dataset.sorting = sorting;
				if ( fb.classList.contains('_active') ) {
					// remove current cloned element
					Obj[fb.dataset.feature] = false;
					chromeQuery(Obj);
					// add a new one
					Obj[fb.dataset.feature] = true;
					Obj.sorting = sorting;
					chromeQuery(Obj);
				}
			}
		}
		sorting = sortBtn.dataset.sorting;
		// switch font-awesome
		icon.className = icon.className.replace(/desc|asc/g, sorting.toLowerCase());

		Extension.saveSetting(sortBtn.dataset.feature, sorting)
	}

	function allBtnClickHandler() {
		var btn = this,
				feature = btn.dataset.feature,
				sorting = btn.dataset.sorting,
				status,
				msgObj = {};
				
		console.log('--- ' + feature + ' clicked ---');
		console.log('this.className: ', btn.className);

		if ( btn.classList.contains('_active') ) {
			status = false;
		} else {
			status = true;
		}

		msgObj[feature] = status;
		if ( sorting ) {
			msgObj.sorting = sorting;
			// undo other sorting button
			var otherBtn = document.querySelectorAll(Extension.selectorFilterBtn + '._active:not([data-feature=' + feature + '])');
			undoFeatureButton(otherBtn);
		}

		chromeQuery(msgObj, function(response) {
			console.log('allBtnResponse: ', response);
			if ( response.success !== true ) {
				// if failed, toggle btn back
				btn.classList.toggle('_active');
			}
		});

		btn.classList.toggle('_active');

		Extension.saveSetting(feature, status);
	}

	function filterMenuClickHandler() {
		var panel = menu.parentElement.nextElementSibling,
				scrlH = panel.scrollHeight;

		if ( this.classList.contains('_active') &&
					scrlH > 0) {
			panel.style.maxHeight = 0;
		} else {
			panel.style.maxHeight = (scrlH + 20) + 'px';
		}
		panel.classList.toggle('_active');
		this.classList.toggle('_active');
	}







	/*
	*
	*
	*********** ADD LISTENER **********
	*
	*
	*/
	// ----- CONTROLLER BUTTON CLICK HANDLER -----
	var allBtn = Extension.allBtn();
	for ( let i = 0; allBtn[i]; i++ ) {
		allBtn[i].addEventListener('click', allBtnClickHandler);
	}
	// ----- TOGGLE FILTER PANEL -----
	var menu = document.querySelector('.filter-comment-menu > div:first-child');
	menu.addEventListener('click', filterMenuClickHandler);
	// ----- SET SORTING TYPE -----
	var sortBtn = Extension.sortBtn();
	sortBtn.addEventListener('click', sortBtnClickHandler);


	// GET RECENT SETTING
	Extension.setButtonSetting();










}); // DOMContentLoaded