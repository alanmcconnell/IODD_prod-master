var _FVARS =
{ "PROJECT_VERSION":"2.13"
//, "CLIENT_PATH":    "https://iodd.com"
, "CLIENT_PATH":    "http://localhost:54132/client3/c32_iodd-app"
, "SERVER_API_URL": "http://localhost:54182/api2"
, "LOCAL_API_URL":  "http://localhost:54182/api2"
, "LOCAL_PATH":     "http://localhost:54132/client3/c32_iodd-app"
//"REMOTE_API_URL": "https://92.112.184.206:54182/api2"
, "REMOTE_API_URL": "https://iodd.com/api2"
, "SERVER_LOCATION":"Local"

//, "SECURE_APP_KEY": "JRvaCBEJcy7CDlHxMDyZ"
, "SECURE_APP_KEY": "ehYzQWxtl62vuPbUjDYU"
, "SECURE_PATH":    "http://127.0.0.1:55301/client/c01_client-first-app/index.html"
, "SECURE_API_URL": "https://secureaccess247.com/api"
, "LOGIN_PAGE":     "http://127.0.0.1:55301/client/c01_client-first-app/index.html"
, "LOGIN_SUCCESS":  "https://iodd.com/member-profile.html"
, "LOGIN_FAILURE":  "https://iodd.com/index.html"
  }
  if (typeof(window)  != 'undefined') {  window.FVARS  = _FVARS; var aGlobal = "window"  }
  if (typeof(process) != 'undefined') {  process.FVARS = _FVARS; var aGlobal = "process" }

      console.log( `${aGlobal}.FVARS:`, fmtFVARS( JSON.stringify( _FVARS, "", 2 ).split("\n") ).join("\n") )
      function fmtFVARS( mFVars ) { return mFVars.map( a => a.replace( /: "/g, `:${''.padEnd( 20 - (a.indexOf(":")) )} "` ) ) }
