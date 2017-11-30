
function onAppReady() {
    if( navigator.splashscreen && navigator.splashscreen.hide ) {   // Cordova API detected
        navigator.splashscreen.hide() ;
    }
    if( window.intel && intel.xdk && intel.xdk.device ) {           // Intel XDK device API detected, but...
        if( intel.xdk.device.hideSplashScreen )                     // ...hideSplashScreen() is inside the base plugin
            intel.xdk.device.hideSplashScreen() ;
        
    }
}

//document.addEventListener("app.Ready", onAppReady, false) ;
document.addEventListener("deviceready", onAppReady, false) ;
