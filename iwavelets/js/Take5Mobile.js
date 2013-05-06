(function()
	{
	var root = this;
	var mobile; 
	if (typeof exports !== 'undefined') 
		{
	  	mobile = exports;
		} 
	else 
		{
		mobile = root.Take5Mobile = {};
		};
	var _ = root._;
	if (!_ && (typeof require !== 'undefined')) 
		_ = require('underscore');

	var hideSplash = mobile.hideSplash = function()
		{
        if (T5.mobile.isMobileDevice())
    		navigator.splashscreen.hide();
        $.mobile.loading('show');		
		};
		
	var isMobileDevice = mobile.isMobileDevice = function()
		{
		console.log("t5.mobile.isMobileDevice " + navigator.userAgent.match(/(iPad|iPhone|Android)/));
//		console.log("t5.mobile.isMobileDevice " + navigator.userAgent );
		console.log("w:" + screen.width +"\nh:" + screen.height  );
//        alert("w:" + screen.width +"\nh:" + screen.height );

        if (navigator.userAgent.match(/(iPad|iPhone|Android)/))
        	return true;
		return false;
		};
	var onDeviceReady = mobile.onDeviceReady = function()
		{
		console.log("t5.mobile.onDeviceReady " + T5.mobile.isMobileDevice() );
		var android_version = parseFloat(device.version);
		if (android_version < 4)
			T5.env.defaultTarnsition = "none";
		else
			T5.env.defaultTarnsition = "slide";
        // Hiding splash screen when app is loaded
//        if (T5.mobile.isMobileDevice())
//    		navigator.splashscreen.show();
////            cordova.exec(null, null, 'SplashScreen', 'hide', []);
//
//        // Setting jQM pageContainer to #container div, this solves some jQM flickers & jumps
//        // I covered it here: http://outof.me/fixing-flickers-jumps-of-jquery-mobile-transitions-in-phonegap-apps/
////        $.mobile.pageContainer = $('#container');
//
//        // Setting default transition to slide
////		$.mobile.loading('show');
//		$.mobile.allowCrossDomainPages = true;
//        $.support.cors= true;
////        $.mobile.pageContainer = $('#t5-container');
//        $.mobile.defaultPageTransition = 'slide';
//        $.mobile.defaultDialogTransition = 'none';
//        $.mobile.useFastClick = true;
//        $.mobile.hashListeningEnabled = false	;
////        $.mobile.pushStateEnabled = false;
//        
////        $.mobile.changePage.defaults.reloadPage = false;
////        if (navigator.userAgent.indexOf("Android") != -1)
////            {
////            $.mobile.defaultPageTransition = 'none';
////            $.mobile.defaultDialogTransition = 'none';
////            }
		};
 }).call(this);