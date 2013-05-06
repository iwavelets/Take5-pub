(function()
	{
	var root = this;
	var T5;
	if (typeof exports !== 'undefined') 
		{
	  	T5 = exports;
		} 
	else 
		{
		T5 = root.T5 = {};
		};
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) 
		_ = require('underscore');
	
	var BB = root.Backbone;
	if (!BB && (typeof require !== 'undefined')) 
		BB = require('Backbone');

	var mobile = T5.mobile = root.Take5Mobile;
	if (!mobile && (typeof require !== 'undefined')) 
		mobile = require('Take5Mobile');
	var utils = T5.utils = root.Take5Utils;
	if (!utils && (typeof require !== 'undefined')) 
		utils = require('Take5Utils');

	// env
	var _env = T5.env = 
		{
		defaultTarnsition : "slide",				
		};

	// Events
	var _events = T5.EVENTS =
		{
		ALL: 'all',
		ValidationCompleted : "T5.VIEW."+"ValidationCompleted",
		ResetCompleted 		: "T5.MODEL."+"ResetCompleted",
		};

	var _eventsHandler = T5.EventsHandler = function() 
		{
		this.initialize.apply(this, arguments);		
		};
		
	_.extend(_eventsHandler.prototype, 
		{
		initialize: function(){},
		eventsTable:[],
		addAction: function(eventName,actionName,callback)
			{
			if (!this.eventsTable[eventName])
				this.eventsTable[eventName] = {name:eventName,actions:[]}
			this.eventsTable[eventName].actions.push({name:actionName,action:callback});
			},
		handleEvent: function(eventName,source,info)
			{
			console.log(source.name +":"+eventName);
			if (!this.eventsTable[eventName])
				return;			
			for (var i =0 ; i <this.eventsTable[eventName].actions.length; i++ )
				this.eventsTable[eventName].actions[i].action(eventName,source,info);
			}
		});
		
	_eventsHandler.extend = BB.Model.extend;
	
	
	var _eventsProducer = T5.EventsProducer = function(source) 
		{
	    this.source = source;
		this.initialize.apply(this,arguments);		
		};
		
	_.extend(_eventsProducer.prototype, 
		{
		source: null,
		events : [],
		initialize: function()
			{
			this.events[T5.EVENTS.ALL]= new T5.Event(T5.EVENTS.ALL);
			},
		addListener: function(eventName,callback)
	    	{
	    	if (!this.events[eventName])
	    		this.events[eventName] = new T5.Event(eventName);
	    	this.events[eventName].listeners.push(callback)
	    	},
		fireEventFor: function(eventName,info)
	    	{
	    	if (this.events[eventName])
		    	for (var i = 0; i< this.events[eventName].listeners.length; i++)
		    		this.events[eventName].listeners[i].handleEvent(eventName, this.source, info);
	    	for (var i = 0; i< this.events[T5.EVENTS.ALL].listeners.length; i++)
	    		if (!this.events[eventName])
	    			this.events[T5.EVENTS.ALL].listeners[i].handleEvent(eventName, this.source, info);
	    	},
		});	
	_eventsProducer.extend = BB.Model.extend;
	    	
	var _event = T5.Event = function(name)
	    {
	    this.name = name;
	    this.listeners = [];
	    };
	    			
	//Apps
	var Apps = T5.Apps = {};
    
	
	var createNewApp = T5.createNewApp = function(name,config)
		{
		var a = new _App(name,config);
//		a = _.extend(a,config);
		T5.Apps[name] = a;
		return a;
		};
		
	var go = T5.go =  function()
		{
		T5.setup();
		if (!T5.mobile)
			{
			T5.startAllApps();
			return this;
			};
		if(T5.mobile.isMobileDevice())
			{
			console.log("T5.go: waiting for deviceready....");
            document.addEventListener('deviceready', function()
            		{
        			console.log("T5.go:device is ready....");
        			T5.mobile.onDeviceReady();
        			startAllApps();
            		
            		}
            		, false);
			}
		else
			{
			console.log("T5.go: starting immidiatly....");
			startAllApps();

			}
		};
 
	var setup = T5.setup = function()
		{
        $.ajaxSetup({ cache: true });
		}
		
	var	startAllApps = function()
		{
//		T5.utils.logDeviceInfo();
//		T5.mobile.hideSpalsh();
		_.each(T5.Apps,function(app)
			{
			app.start();
			console.log("starting " + app.name + " " + app.init);
			});
		_.each(T5.Apps,function(app)
			{
			console.log("starting " + app.name + " " + app.main);
			});
		};
		
	var findComponent = T5.findComponent =  function(componentName)
		{
		var parts = componentName.split(".");
		if (parts.length != 3)
			throw new Error("Invalid componentName: expecting appName.[view|model|controller|table}.componentName " + componentName);
		if (T5.Apps[parts[0]] == undefined)
			throw new Error("App not found:  " + componentName);
		var c;
		switch (parts[1])
			{
       		case "view":
   				c = T5.Apps[parts[0]].views.elements[parts[2]];
   				break;
       		case "model":
				c = T5.Apps[parts[0]].models.elements[parts[2]];
				break;
       		case "controller":
				c = T5.Apps[parts[0]].controllers.elements[parts[2]];
				break;
       		case "table":
				c = T5.Apps[parts[0]].tables.elements[parts[2]];
				break;
   			default:
   				throw new Error("Invalid component type:  " + componentName);
			}
		
		if (c == undefined)
			throw new Error("Component not found:  " + componentName);
		return c;
		};


	// App
		
	var _App = T5.App = function(name,config)
		{
		this.name = name;
		this.controllers = new T5.AppComponent(this,config.controllers);
		this.models = new T5.AppComponent(this,config.models);
		this.views = new T5.AppComponent(this,config.views);
		this.tables = new T5.AppComponent(this,config.tables);
		this.initialize.apply(this, arguments);	
		};
		
	_.extend(_App.prototype, BB.Events,
		{
		models : {},
		views  : {},
		controllers : {},
		tables : {},
		
		initialize: function(){},
		start:function()
			{
			_.bindAll(this);
		    $( document ).on( "pageloadfailed",this.pageLoadErrorHandler);
			var c = this.controllers.get("main");
			c.start.apply(c,arguments);
			},
		bind: function(controller,models,views)
			{
			var c = this.controllers.get(controller);
			c.name = controller;
			var model;
			if (models)
				for (var i = 0; i < models.length; i++)
					{
					model = this.models.get(models[i]);
					if (!model)
						throw new Error("Missing Model " + models[i]);
					model.setController(c);
					c.addModel(model);
					};
			var view;
			if (views)
				for (var i = 0; i < views.length; i++)
					{
					view = this.views.get(views[i]);
					if (!view)
						throw new Error("Missing View " + views[i]);
					view.setController(c);
					c.addView(view);
					view.eventsProducer.addListener('all',c);
					};			
			},
		pageLoadErrorHandler: function(event,data)
			{
			console.log(this.name + ".pageLoadErrorHandler:" + event +" " + data.url + "\n" + data.absUrl 
					+ "\n" + data.errorThrown);
			},
			
		// Tables
		addTable: function(tableName,url)
			{
			var table = this.tables.get(tableName);
			if (!table)
				throw new Error("Missing Table " + tableName);

			if (table)
				return this.loadTable(tableName);
			this.tables.push(tableName);
			this.tables[tableName] = url;
			return this.loadTable(tableName);
			},
			
		loadTable: function(tableName,controller)
			{
			var table = this.tables.get(tableName);
			if (controller)
				table.setController(controller);
			table.load();
			},
		handleTableLoadError: function(model, result, xhr)
			{
			console.log(this.name + ".handleTableLoadError " + model._T5model.name + " fetch error " +   result.status +": " + result.statusText);
			},
			
		});
		_App.extend = BB.Model.extend;
	
	// App Component	
	var _AppComponent =  T5.AppComponent = function(app,elementsConfig)
		{
		this.app = app;
		this.config = elementsConfig;
		this.initialize.apply(this, arguments);	
		this.elements = {};
		};
	
	_.extend(_AppComponent.prototype, 
		{
		config: {},
		elements :null,
		initialize: function(){},
		get: function(name)
			{
			if (!this.elements[name] && this.config[name] )
				if (_.isFunction(this.config[name]))
					{
					this.elements[name] = new this.config[name](this);
					this.elements[name].name = name;
					}
				else
					this.elements[name] = this.config[name];
			return this.elements[name];
			}
		});
	_AppComponent.extend = BB.Model.extend;

	// Controller
	var _Controller = T5.Controller = function(component)
		{
		_.bindAll(this);
		this.component = component;
		this.initialize.apply(this, arguments);		
		};
		
	_.extend(_Controller.prototype,T5.EventsHandler.prototype,
		{
		name: null,
		models: {},
		views:{},
		eventsProducer:{},

		initialize: function()
			{
			this.eventsProducer = new T5.EventsProducer(this);
			},
		start: function(){},
		addModel: function(model)
			{
			if (!this.models[model.name])
				this.models[model.name] = model;
			},
		updateModel: function(view,model)
			{
			if (!model)
				model = this.models[0];
			view.updateModel(model);
			},
		addView: function(view)
			{
			if (!this.views[view.name])
				this.views[view.name] = view;
			},
		updateView	: function(view,model)
			{
//			if (!view)
//				view = this.views[0];
			view.updateView(model);
			},
		handleFetchCompleted: function(collection)
			{
			console.log("T5.Controller.handelFetchCompleted "+ " " +  new Date().toTimeString() + " " + collection._T5model.name);
			collection.each(function(model)
				{
				console.log(JSON.stringify(model));		
				});
						

//			this.updateView(null,model);
			},
		handleUpdateModelEvent:function(eventName,source,info)
			{
			console.log("T5.Controller.handleUpdateModelEvent "+ " " +  new Date().toTimeString() + " " + model._T5model.name);
//			this.updateModel(source,null);
			},
		handleFetchError: function(model, result, xhr)
			{
			console.log(this.name + " " + model._T5model.name + " fetch error " +   result.status +": " + result.statusText);
			},

		}); 
	
	_Controller.extend = BB.Model.extend;

	// View
	var _View = T5.View = function(component)
		{
		this.component = component;
//        var self;
		this.initialize.apply(this, arguments);		
		_.bindAll(this);
		};

	_.extend(_View.prototype,  BB.View.prototype,
		{
		controller:null,
		name: null,
		pageId:null,
		formId:null,
		validationRules:{},
		validationMessages:{},
		events:[],
		eventsProducer:{},
		config: {},
		dataGroups:{},
		initialize: function()
			{
//			self = this;
			this.eventsProducer = new T5.EventsProducer(this);
			this.registerEvents();
//	        if  (this.formId)
//	        	this.startValidate(this.validationRules,this.validationMessages);
			},
			
		startValidate: function(rules,messages)
			{
			var self = this;
		    $(this.formId).validate(
		    	{
		    	_view: this,
		    	rules: rules,
		    	messages:messages,
			    errorPlacement: function(error, element) 
			    	{
			    	error.insertBefore(element);
			    	},
			    success: function(label) 
			    	{
			    	label.addClass('valid');
			    	},
				submitHandler:function(form) 
					{
					self.eventsProducer.fireEventFor(T5.EVENTS.ValidationCompleted);
					}

		    	});		
			},
			setController: function(ctl)
				{
				this.controller = ctl;
				},
			registerEvents:function()
				{				
				$(document).on('pageinit', this.pageId, this.initPage);
				},
			initPage	: function(event)
				{
				console.log(JSON.stringify(event));
				var page = $(event.target);
				page.page({ domCache: true })

				},
			defineDataGroup: function(page,groupClass,options)
				{
				this.dataGroups[groupClass] = new T5.DataGroup(page,groupClass,options);
				
				},
			
			setValues: function(model,dd){},
		    getValues: function(model,dd){},
			updateModel	: function(model){},
			updateView	: function(model){},


		});
	_View.extend = BB.Model.extend;

	// DataGroup
	var _dataGroup = T5.DataGroup =  function(page,groupClass,options)
	  	{
		this.initialize.apply(this, [page,groupClass,options]);	
		_.bindAll(this);

		};
	_.extend(_dataGroup.prototype,
		{
		name:"",
		members:[],
		page: null,
		current: null,
		
		initialize: function(page,groupClass,options)
			{
			thisGroup = this;
			this.options = options;
			this.groupName= groupClass;
			this.currentClassName = this.groupName+"_current";
			this.currentName = "";
			this.page = page;
			this.lastEventTimeStamp = -1;
			this.pageId = page.attr('id');
			var m = page.find("."+groupClass);
			if (m.length < 1)
				return;
//			this.current = $(m[0]);
//			this.members[0] = this.members[this.current.attr('id')] = this.current;
//			this.current.addClass(this.currentName);
			if(!options.startWith)
				options.startWith = $(m[i]).attr('id');
			for (var i = 0 ; i <m.length; i++ )
				{
				var e = $(m[i]);
				this.members[i] =this.members[e.attr('id')] = e;
//				if (e.attr('id') == options.startWith)
//					{
//					this.current = $(m[i]);
//					this.current.addClass(this.currentName);
//					}
//				else
					e.hide();
				if (options.swipe)
					{
					e.on('swipeleft',this.pageBack);
					e.on('swipe',function(event){alert(event)});
					e.on('swiperight',function(event){alert(event)});
//					e.on('swiperight',this.pageForward);
					}
				};
			if (options.backCtl)
				{
				$(document).on( "pagebeforechange", this.backHandler);
//						function( event, data )
//					{
//					console.log(event.type  + " " + thisGroup.currentName+" "+ data.toPage + " " + location.hash);
//					if (!($.mobile.activePage.attr('id') ==  thisGroup.pageId))
//						return;
////					if(!location.href.startsWith(thisGroup.options.baseUrl))
////						return;
////					if (event.target && !event.target.baseURI.startsWith(thisGroup.options.baseUrl))
////						return;
//////					if(data.toPage.indexOf("#"+thisGroup.groupName) < 0)
//////						return;
//////					if(!window.history.state ||!window.history.state.page)
////					if(!location.hash ||location.hash.length == 0)
////						return;
//////					if(!window.history.state.page.startsWith("#"+thisGroup.groupName))
////					if(!location.hash.startsWith("#"+thisGroup.groupName))
////						return;
//////					if (window.history.state.page !== thisGroup.currentName)
////					if (location.hash !== thisGroup.currentName)
////						thisGroup.pageBack(event);
////						return;
////					console.log(data.toPage);
//					thisGroup.pageBack(event);
//
//					return;
//					});
				};	
							
			return this;
			},
		backHandler: function( event, data)
			{
			console.log(event.type  + " " + thisGroup.currentName+" "+ data.toPage + " " + data.options.direction);
			if (thisGroup.lastEventTimeStamp == event.timeStamp)
				return;
			thisGroup.lastEventTimeStamp = event.timeStamp;
			if (!($.mobile.activePage.attr('id') ==  thisGroup.pageId))
				return;
			if (data.options.role =="popup")
				thisGroup.popupWarning = true;
			if (data.options.direction !="back")
				return;
			if(thisGroup.popupWarning)
				{
				thisGroup.popupWarning = false;
				return;
				}
//			if (data.options.role =="popup")
//				return;
			thisGroup.pageBack(event);
//			if (data.options.direction =="back")
//				window.history.forward();

			},
		getPrevId: function()
			{
			for (var i = 0; i<this.members.length; i++)
				if (this.current.attr('id') === this.members[i].attr('id'))
					{
					console.log((this.members.length+i-1)%this.members.length);
					return this.members[(this.members.length+i-1)%this.members.length].attr('id');
					}
			},
		pageBack: function(event)
			{
			if ((this.current &&this.current.attr('id') != this.options.startWith) || !this.options.leaveGroupCB)
				{
				window.history.forward();
				this.pageTo(this.getPrevId());
				event.preventDefault();
				event.stopPropagation();
				return false;
				}
			else
				if(this.options.leaveGroupCB)
					{
					this.options.leaveGroupCB();
//					event.preventDefault();
//					event.stopPropagation();
					}
			},
			
		pageForward: function(event)
			{
			alert(event);
			},
			
		pageTo: function(name)
			{
			console.log("DataGroup["+this.groupName +"]:pageTo to:" + name);
			this.members[name].addClass(this.currentClassName);
			if (this.current && this.current.attr('id') == name)
				return;
			if (this.current )
				{
				this.current.removeClass(this.currentClassName);
				var group = this;
				this.current.hide();
				this.members[name].animate({opacity: "show","margin-right": 0,width: "100%"}, "1000", "linear" );
//				this.current.animate({width: "0",opacity: "hide","margin-right": "1000"}, "100")
//					.promise().done(function(source)
//						{
//						group.members[name].animate({opacity: "show","margin-right": 0,width: "100%"}, "1200" );
//						});
				}
			else
				{
//				if(this.options.leaveGroupCB)
//					{
//					url = "#"+this.groupName+"_"+this.options.startWith+"_init";
//					window.history.pushState({page:url},name,url);
//					}
				this.members[name].animate({opacity: "show","margin-right": 0,width: "100%"}, "1000", "linear" );
				}
//			url = "#"+this.groupName+"_"+name;
//			this.currentName = url;
//			console.log("pageTo " + this.currentName+" "+ window.history.state + " " + location.hash);

//			if (!window.history.state || !window.history.state.page ||window.history.state.page !== this.currentName)
//			if (!location.hash || location.hash !== this.currentName)
//				window.history.pushState({page:url},name,url);
//			console.log(window.history.state);
			this.current = this.members[name];
			}
		});
		


	// Models
	var _Model = T5.Model = function(component)
		{
		this.component = component;
		this.initialize.apply(this, arguments);		
		};
	_.extend(_Model.prototype,
		{
		name: null,
		controller:null,
		innerModelTmpl:null,
		innerCollectionTmpl:null,
		_innerModel:null,
		_innerCollection:null,
		start: function(){},
		initialize: function()
			{
			if (this.innerCollectionTmpl)
				{
				this._innerCollection = new this.innerCollectionTmpl();
				this._innerCollection.model = this.innerModelTmpl;
				this._innerCollection._T5model = this;
				this._innerCollection.on('all',this._collectionEvents,this);
				this._innerCollection.setUrl = function(args)
					{
					this.url = this.urlTmpl.format.apply(this.urlTmpl,args)
					console.log(this.name + " setUrl " + this.url);
					};

				}
			else
				if (this.innerModelTmpl)
					{
					this._innerModel = new this.innerModelTmpl();
					this._innerCollection._T5model = this;
					this._innerModel.on('all',this._modelEvents,this);
					}

			},
			
		_modelEvents: function(event,model)
            {
            console.log("T5.Model._modelEvents "+ " " +  new Date().toTimeString() + " " + event);
            },
            
        _collectionEvents: function(event,collection)
            {
            console.log("T5.Model._collectionEvents "+ " " +  new Date().toTimeString() + " " + event);
	       	switch (event)
	       		{
	       		case "sync":
	       			this.controller.handleFetchCompleted(collection);
	       			break;
	       		case "error":
					console.log(this.name + " error " + collection.url);
	       			break;
	       		};
            },
           
		setController: function(ctl)
			{
			this.controller = ctl;
			},
		}); 
	
	_Model.extend = BB.Model.extend;
	
	var staticTable = T5.staticTable =  T5.Model.extend(
			  	{
			  	loaded: false,
			  	idAttribute:null,
			  	url:null,
			  	innerModelTmpl:Backbone.Model.extend(
			  		{
			  		}),
			  	innerCollectionTmpl:Backbone.Collection.extend(
			  		{
			  		model:this.innerModelTmpl,
			  		}),
			  	load: function()
			  		{
			  		if (this.loaded)
			  			{
			  			_collectionEvents("loaded",this);
			  			return this;
			  			};
			  		this._innerCollection.url = this.url;
			  		if (this.idAttribute != null)
			  			this._innerModel.idAttribute = this.idAttribute;
			  		this._innerCollection.fetch({error: this.handleTableLoadError});
			  		},
//			  	_collectionEvents: function(event,collection)
//		            {
//		            console.log("staticTable " + this.name + "._collectionEvents " +  new Date().toTimeString() + " " + event);
//		            },
				handleTableLoadError: function(model, result, xhr)
					{
					console.log("staticTable " + this.name + ".handleTableLoadError " + model._T5model.name + " fetch error " +   result.status +": " + result.statusText);
					},
				

			  	});
				

	
	
	

}).call(this);