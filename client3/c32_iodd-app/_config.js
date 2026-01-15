var _FVARS =
{ "PROJECT_VERSION":"2.13"
, "CLIENT_PATH":    "https://iodd.com"
, "SERVER_API_URL": "http://localhost:54382/api2"
, "LOCAL_API_URL":  "http://localhost:54382/api2"
, "LOCAL_PATH":     "http://localhost:54332/client3/c32_iodd-app"
//"REMOTE_API_URL": "https://92.112.184.206:54382/api2"
, "REMOTE_API_URL": "https://iodd.com/api2"
, "SERVER_LOCATION":"Local"

//, "SECURE_APP_KEY": "JRvaCBEJcy7CDlHxMDyZ"
, "SECURE_APP_KEY": "ehYzQWxtl62vuPbUjDYU"
, "SECURE_PATH":    "https://secureaccess247.com"
, "SECURE_API_URL": "https://secureaccess247.com/api"
//, "LOGIN_PAGE":     "https://secureaccess247.com/index.html"
//, "LOGIN_PAGE":    "http://127.0.0.1:54333/client/c01_client-first-app/index.html"
, "LOGIN_PAGE":     "http://127.0.0.1:54332/credentials.html"
, "LOGIN_SUCCESS":  "https://iodd.com/member-profile.html"
, "LOGIN_FAILURE":  "https://iodd.com/index.html"
  }
  if (typeof(window)  != 'undefined') {  window.fvaRs  = _FVARS; var aGlobal = "window"  }
  if (typeof(process) != 'undefined') {  process.fvaRs = _FVARS; var aGlobal = "process" }

      console.log( `${aGlobal}.fvaRs:`, fmtFVARS( JSON.stringify( _FVARS, "", 2 ).split("\n") ).join("\n") )
      function fmtFVARS( mFVars ) { return mFVars.map( a => a.replace( /: "/g, `:${''.padEnd( 20 - (a.indexOf(":")) )} "` ) ) }
