var _FVARS = 
{ "IODD_VERSION":   "2.13" 
, "CLIENT_PATH":    "http://localhost:54332/client3/c32_iodd-app"
, "SERVER_API_URL": "http://localhost:54382/api2"
, "LOCAL_API_URL":  "http://localhost:54382/api2"                                        
, "LOCAL_PATH":     "http://localhost:54332/client3/c32_iodd-app"
//"REMOTE_API_URL": "https://92.112.184.206:54382/api2"                             
, "REMOTE_API_URL": "https://iodd.com/api2"                                        
, "SERVER_LOCATION":"Local"

, "SECURE_PATH":    "http://localhost:55301"
, "SECURE_API_URL": "http://localhost:55351/api"
, "SECURE_APP_KEY": "JRvaCBEJcy7CDlHxMDyZ"
, "LOGIN_PAGE":     "http://localhost:55301/client/c01_client-first-app/login_client.html"      
, "LOGIN_SUCCESS":  "http://localhost:54332/member-profile.html"
, "LOGIN_FAILURE":  "http://localhost:54332/index.html"
  }
  if (typeof(window)  != 'undefined') {  window.fvaRs  = _FVARS; var aGlobal = "window"  }
  if (typeof(process) != 'undefined') {  process.fvaRs = _FVARS; var aGlobal = "process" }
   
      console.log( `${aGlobal}.fvaRs:`, fmtFVARS( JSON.stringify( _FVARS, "", 2 ).split("\n") ).join("\n") )
      function fmtFVARS( mFVars ) { return mFVars.map( a => a.replace( /: "/g, `:${''.padEnd( 20 - (a.indexOf(":")) )} "` ) ) }
