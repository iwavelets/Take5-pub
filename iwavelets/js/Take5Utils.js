
//String format which allows you to escape braces by doubling them:

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") { return "{"; }
    if (m == "}}") { return "}"; }
    return args[n];
  });
};

// String.startsWith
String.prototype.startsWith = function (str){
	return this.indexOf(str) == 0;
};

//String.endsWith
String.prototype.endsWith = function (str){
	var i = this.indexOf(str);
	return i >=0 && this.indexOf(str) +str.length == this.length;
};

(function()
	{
	var root = this;
	var utils; 
	if (typeof exports !== 'undefined') 
		{
	  	utils = exports;
		} 
	else 
		{
		utils = root.Take5Utils = {};
		};
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) 
		_ = require('underscore');
	
	$(document).on('pagehide',function(event, data)
				{
				console.log(event.type+  " nextPage:" +$(data.nextPage).attr('id'));
				});
	$(document).on('pageshow',function(event, data)
				{
				console.log(event.type + " id:" + $(event.target).attr('id') + " prevPage" + $(data.prevPage).attr('id'));}
				);
	$(document).on('pageload',function(event, data)
				{
				console.log(event.type +  " url:" +data.url + " id:" +$(data.page).attr('id') + " data-url:" + $(data.options.fromPage).attr('data-url')
				+ " role:" + data.options.role
				+" changeHash: " + data.options.changeHash + " fromHashChange: " +data.options.fromHashChange );}
				);
	$(document).on('pagecreate',function(event, data)
				{
				console.log(event.type + " " + $(event.target).attr('data-url'));
				});
	$(document).on('pageremove',function(event, data)
				{
//				event.preventDefault();	
				console.log(event.type + " " + $(event.target).attr('data-url'));
				});
	
	$(document).on('pageinit',function(event, data)
				{
				console.log(event.type + " " +  $(event.target).attr('data-url'));
				});
	
	$(document).on('pagechange',function(event, data)
				{
				console.log(event.type + " toPage: "  +data.toPage.attr('data-url') 
						+ " direction:" + data.options.direction + " fromPage:" 
						+ data.options.fromPage + " role:" + data.options.role
						+" changeHash: " + data.options.changeHash + " fromHashChange: " +data.options.fromHashChange );
				});
	$( document ).on( "pagebeforechange", function( event, data )
				{
				//	console.log(event.type + " " + event.target.id);
				console.log(event.type + " target: "  
						+data.options.target + "  fromPage: "
						+ $(data.options.fromPage).attr('data-url') 
						//			+ "   id: "+ $(data.toPage).attr('id') + 
						+ "  direction:" + data.options.direction + "  role:" + data.options.role
						+" changeHash: " + data.options.changeHash + " fromHashChange: " +data.options.fromHashChange );
				if (!(typeof data.toPage === 'string'))
					console.log("  toPage: " +  $(data.toPage).attr('data-url') )
				else	
					console.log("  toPage: " +data.toPage);
//	  console.log( data );
//	  console.log( data.state.direction )
//	  console.log( data.state.url )
//	  console.log( data.state.hash )
	  if (data.options.direction=="back")
		  data.options.transition="none";
	});
	//templates
	var optionTemplate = utils.optionTemplate =  _.template("<option value=<%= model.get(id) %>><%= model.get(desc) %></option>");
	var listFilterTextTemplate = utils.listFilterTextTemplate = _.template("<li data-filtertext=<%= model.get(desc) %> ><%= model.get(id) %></li>");
	var listTemplate = utils.listTemplate = _.template("<li><%= model.get(id) %></li>");

	var collectionToSelectMenu = utils.collectionToSelectMenu = function(collection,elm,options,callback)
		{
		var id = options.id;
		if (id === undefined)
			id = "id";
		var desc = options.desc;
		if (desc === undefined)
			desc = "desc";
		console.log("T5.utils.collectionToSelectMenu " + id + ":" + desc );
		collection.each(function(model)
			{
			elm.append(T5.utils.optionTemplate({model:model,id:id,desc:desc}));
//			console.log(JSON.stringify(model));		
			},this);
			$(elm).selectmenu('refresh', true);
		};	
	var collectionToListViewWithFilterText = utils.collectionToListViewWithFilterText = function(collection,elm,options,callback)
		{
		var id = options.id;
		if (id === undefined)
			id = "id";
		var desc = options.desc;
		if (desc === undefined)
			desc = "desc";
		console.log("T5.utils.collectionToListViewWithFilterText " + id + ":" + desc  );
		elm.empty();
		collection.each(function(model)
			{
			elm.append(T5.utils.listFilterTextTemplate({model:model,id:desc,desc:id}));
//			console.log(JSON.stringify(model));		
			},this);
		elm.listview('refresh');
		elm.trigger('keyup');

		};	
		
	var collectionToListView = utils.collectionToListView = function(collection,elm,options,callback)
		{
		var id = options.id;
		if (id === undefined)
			id = "id";
		console.log("T5.utils.collectionToListViewWithFilterText " + id  );
		elm.empty();
		collection.each(function(model)
			{
			elm.append(T5.utils.listTemplate({model:model,id:id}));
//			console.log(JSON.stringify(model));		
			},this);
		elm.listview('refresh');
		elm.trigger('keyup');
		if (callback)
			elm.children('li').on('click', callback); 

		};	
		
	//JQM 
		
//		"use strict";
//
//		var $, navigator, window;
		var  logDeviceInfo = utils.logDeviceInfo = function()
			{
			 var sheets = document.styleSheets;
			var info = {};
			info.width320 = window.matchMedia("(max-width: 320px)");
			info.width480 = window.matchMedia("(max-width: 320px)");
			info.portrait = window.matchMedia("(orientation: portrait)");
			info.handheld = window.matchMedia("(orientation: portrait)");
	        for (var i = 0; i < sheets.length; i += 1) 
	        	{
	        	var rules = sheets[i].cssRules;

	        	for (var j = 0; j < rules.length; j += 1) 
	        		{
	        		if (rules[j].constructor === CSSMediaRule) 
	        			{
                  			var mql = window.matchMedia(rules[j].media.mediaText);
                  			console.log(rules[j].media.mediaText + ":" + JSON.stringify(window.matchMedia(rules[j].media.mediaText)));
	        			};
	        		};
	        	  }
//              console.log(JSON.stringify(info));
			};
			
		var getDimensions = utils.getDimensions =  function() {
			// the iphone specific code is kind of kludgy, if you have a better way let me know
			var isIPhone = (/iphone/gi).test(navigator.appVersion),
				iPhoneHeight = (isIPhone ?  60 : 0),
				width = $(window).width(),
				height = $(window).height(),
				// if one of these doesn't exist, assign 0 rather a null or undefined
				hHeight = $('header').outerHeight() || 0,
				fHeight = $('footer').outerHeight() || 0;
			return {
				width: width - 4,
				height: height - hHeight - fHeight - 4 + iPhoneHeight
			};
		}

		var reSizeDiv = utils.reSizeDiv = function reSizeDiv() {
			var dims = getDimensions(),
				$flexDiv = $('#isoMainContent');
			$flexDiv.css({
				width: dims.width,
				height: dims.height
			});
		}

		// we are watching all three of these events, if any occur we re-determine the size
		// and scroll the window back to the top
//		$(window).bind('resize orientationchange pageshow', function (event) {
//			window.scrollTo(1, 0);
//			reSizeDiv();
//		});
		
		
	var loadFooter = utils.loadFooter = function(elm,template)
		{
		$(elm).load(template, function(){$(this).trigger("create")});
		};
		
	// usabilty functions
	var isSet = utils.isSet = function(val)
		{
		if (typeof val === 'undefined' || val == null ||				
			$.trim(val).length == 0)
			return false;
		return true;
		};
		

	}).call(this);