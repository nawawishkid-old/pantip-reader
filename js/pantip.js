// create PANTIP page object
function PANTIP() {
	this.classTopic = '.display-post-wrapper.main-post.type';
	this.classAllComments = '.display-post-wrapper.with-top-border.section-comment:not(.remove-comment):not(.hideid)';
	this.classMainComments = ':not(.sub-comment)';
	this.classSubComments = '.sub-comment';

	// Topic
	this.getTopic = document.querySelector(this.classTopic);

	// Comments
	this.getAllComments = function() {
		return document.querySelectorAll(this.classAllComments);
	};
	this.getMainComments = function() {
		return document.querySelectorAll(this.classAllComments + this.classMainComments);
	};
	this.getSubComments = function() {
		return document.querySelectorAll(this.classAllComments + this.classSubComments);
	};

	// Voted comments
	this.getTopVotedComments = function() {
		return this.setPrototype('VOTED', '.like-score.top-score');
	};
	this.getAllVotedComments = function() {
		return this.setPrototype('VOTED', '.like-score.has-score, .like-score.top-score');
	};
	this.getVotedNotTopComments = function() {
		return this.setPrototype('VOTED', '.like-score.has-score');
	};

	// Emo comments
	this.getEmoComments = function() {
		return this.setPrototype('EMO', '.emotion-score.has-score');
	};


	// general functions
	this.setPrototype = function( prototype, cssSelector ) {
		if ( ! prototype ) {
			return;
		}
		var mc = this.getMainComments(),
				targets = [];
		for ( let i = 0; mc[i]; i++ ) {
			if ( ! mc[i].querySelector(cssSelector) ) {
				continue;
			}
			var elem = mc[i],
					value = mc[i].querySelector(cssSelector).textContent,
					obj;
			if ( prototype === 'VOTED' ) {
				obj = new PANTIPVotedComments();
			} else if ( prototype === 'EMO' ) {
				obj = new PANTIPEmoComments();
			}
			obj.element = elem;
			obj.value = value;
			targets.push(obj);
		}
		return targets;
	};
	this.sorting = function( array, order ) {
		var x = array;
		if ( order === 'ASC' ) {
			return x.sort(function(a, b) {
				return a.value - b.value;
			});
		} else {
			return x.sort(function(a, b) {
				return b.value - a.value;
			});
		}
	};
}

function PANTIPComments( element, value ) {
	this.element = element;
	this.value = value;
}

function PANTIPVotedComments( element, value ) {
	PANTIPComments.call(this, element, value);
}

function PANTIPEmoComments( element, value ) {
	PANTIPComments.call(this, element, value);
}

// I'm not quite understand what I've done here -_-'
PANTIPVotedComments.prototype = Object.create(PANTIPComments.prototype);
PANTIPEmoComments.prototype = Object.create(PANTIPComments.prototype);
PANTIPVotedComments.prototype.constructor = PANTIPVotedComments;
PANTIPEmoComments.prototype.constructor = PANTIPEmoComments;





/*
*
*
***********	REDESIGN FEATURE LOADING AND UNLOADING **********
*********** DON'T USE TOO MUCH CHROME QUERY. IT DELAYS THE PAGE **********
*
*
*/




function uninjected(elemClass) {
	var target = document.querySelectorAll('.' + elemClass);
	for ( let i = 0, t; t = target[i]; i++ ) {
		//t.parentElement.removeChild(t);
		t.style.display = 'none';
	}

	return {success: true};
}


function loadCSS(file, classname) {
	var link = document.createElement('link');

	link.className = classname;
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = chrome.runtime.getURL(file);

	document.body.appendChild(link);
}







function clearText(comment = null) {
	var regex = /<br>/g,
			replacer = '<br><br>';

	// clear single comment
	if ( comment ) {
		var content = comment.querySelector('.display-post-story');
		content.innerHTML = content.innerHTML.replace(regex, replacer);
		return;
	}

	// clear all comments
	var comments = new PANTIP().getAllComments();
	for ( let i = 0; comments[i]; i++ ) {
		var c = comments[i].querySelector('.display-post-story');
		c.innerHTML = c.innerHTML.replace(regex, replacer);
	}
}





/*
*
*********** RESPONSE FEATURE OBJECT **********
*
*/
function ResponseFeature() {
	PANTIP.call(this);
	this.filterAllVotedComments = function( order ) {
		var x = this.sorting(this.getAllVotedComments(), order);
		return this.insertSortedComments(x, 'filterAllVotedComments');
	};
	this.filterTopVotedComments = function( order ) {
		var x = this.sorting(this.getTopVotedComments(), order);
		return this.insertSortedComments(x, 'filterTopVotedComments');
	};
	this.filterVotedNotTopComments = function( order ) {
		var x = this.sorting(this.getVotedNotTopComments(), order);
		return this.insertSortedComments(x, 'filterVotedNotTopComments');
	};
	this.filterEmoComments = function( order ) {
		var x = this.sorting(this.getEmoComments(), order);
		return this.insertSortedComments(x, 'filterEmoComments');
	};
}

ResponseFeature.prototype = Object.create(PANTIP.prototype);
ResponseFeature.prototype.constructor = ResponseFeature;

// ----- RESPONSIVE -----
ResponseFeature.prototype.responsive = function() {
 	// check if feature exists
 	if ( document.querySelector('.rakkid-responsive') ) {
 		return {success: true};
 	}
	var viewport = document.createElement('meta');
	viewport.className = 'rakkid-responsive';
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1.0';
	document.head.insertBefore(viewport, document.head.firstElementChild);

	loadCSS('css/responsive.css', 'rakkid-responsive');
	loadCSS('css/cleanly.css', 'rakkid-responsive');

	return {success: true};
}

// ------ COMMENT SORTING -----
 ResponseFeature.prototype.insertSortedComments = function( commentsArray, classname ) {
 	// check if element exists
 	if ( document.querySelector('.rakkid' + classname) ) {
 		return {success: true};
 	}
	var div = document.createElement('div');
	div.className = 'rakkid-' + classname + ' filterComments-wrapper ' + classname + '-wrapper _active';

	// insert sorted elements to new div
	for ( let i = 0; commentsArray[i]; i++ ) {
		var t = commentsArray[i].element;
		var clone = t.cloneNode(true);
		clone.classList.add('cloned-comment');
		div.appendChild(clone);
		clone.addEventListener('click', clearText.bind(this, clone));
	}

	// insert new div next to topic post
	var topic = document.querySelector('.display-post-wrapper.main-post.type');
	topic.parentElement.insertBefore(div, topic.nextElementSibling);


	loadCSS('css/filter-comments.css', 'rakkid-' + classname);

	return {success: true};
}

// ----- TEXT CLEARER BUTTON -----
ResponseFeature.prototype.textClearer = function() {
 	// check if element exists
	if ( document.querySelector('.rakkid-textClearer') ) {
		console.log('textClearer already exists.');
		return {success: true};
	}

	loadCSS('css/text-clearer.css', 'rakkid-textClearer');

	// create btn
	function textClearerBtn( post ) {
		var btn = document.createElement('button');
		btn.className = 'rakkid-textClearer';
		btn.innerHTML = 'ไม่อยากตาลาย คลิก!';
		btn.style.display = 'none';	// only visible when css is loaded
		btn.addEventListener('click', clearText.bind(this, post));
		return btn;
	}

	var topic = this.getTopic,
			btnTarget = topic.querySelector('.display-post-story-wrapper'),
			comments = this.getAllComments();

	// add btn to topic
	btnTarget.insertBefore(textClearerBtn(topic), btnTarget.firstElementChild);

	// add btn to all comments
	for ( let i = 0, c; c = comments[i]; i++ ) {
		var cNOElem = c.querySelector('.display-post-number');
		cNOElem.parentElement.insertBefore(textClearerBtn(c), cNOElem.nextElementSibling);
	}

	return {success: true};
}







window.addEventListener('load', function() {
	console.log('This is Rakkid!');

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(request);
			var givenFeature = Object.keys(request)[0],
					RF = new ResponseFeature();

			if ( request[givenFeature] ) {
				if ( request.hasOwnProperty('sorting') ) {
					sendResponse(RF[givenFeature](request.sorting));
					return;
				}
				sendResponse(RF[givenFeature]());
			} else {
				sendResponse(uninjected('rakkid-' + givenFeature));
			}
		});

});