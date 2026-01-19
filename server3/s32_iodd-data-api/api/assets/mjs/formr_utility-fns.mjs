/*\
##=========+====================+================================================+
##RD      formr_utility-fns.mjs | Utility fns script
##RFILE    +====================+=======+===============+======+=================+
##FD formr_utility-fns_u1.04.mjs|   9077|  4/10/23  8:24|   121| u1-04.30410.0815
##FD formr_utility-fns_u1.06.mjs|  10088|  4/12/23 16:35|   145| u1-06.30412.1630
##FD formr_utility-fns_u1.06.mjs|  13261|  4/17/23 14:10|   171| u1-06.30417.1410
##FD formr_utility-fns_u1.06.mjs|  15757|  5/27/23 14:55|   204| u1-06.30527.1455
##FD formr_utility-fns_u1.06.mjs|  15970|  5/28/23 13:30|   206| u1-06.30528.1330
##DESC     .--------------------+-------+---------------+------+-----------------+
#           This Javascript file
##LIC      .--------------------+----------------------------------------------+
#           Copyright (c) 2023 8020Data-formR * Released under
#           MIT License: http://www.opensource.org/licenses/mit-license.php
##FNCS     .--------------------+----------------------------------------------+
#           setAPI_URL          |
#           getEnv              |                                                       // .(30222.01.0)
#           fmtEnv              |
#           sayEnvErr           |
#           setHTML             |
#                               |
##CHGS     .--------------------+----------------------------------------------+
# .(30320.04  3/20/23 RAM 12:47p|  Don't reurn existing values
# .(30320.05  3/20/23 RAM  1:15p|  No Quotes or spaces in getEnv
# .(30222.01  3/22/23 RAM 12:55p|  Write getEnv
# .(30328.01  3/28/23 RAM  8:30p|  Write seperate function for sayEnvErr
# .(30410.02  4/10/23 RAM  8:15a|  Breakout formr_utility-fns_u1.06.mjs
# .(30410.03  4/12/23 RAM  1:30p|  Write setAPI_URL
# .(30412.01  4/12/23 RAM  2:30p|  Create getEnv_sync
# .(30412.03  4/12/23 RAM  4:17p|  Remove trailing #s from .Env
# .(30416.02  4/16/23 RAM 11:00a|  Write tractR
# .(30416.03  4/16/23 RAM  1:45p|  Create __appDir
# .(30417.02  4/17/23 RAM 10:20a|  Add bLog_HTML and bLog_Styles
# .(30417.03  4/17/23 RAM  1:15p|  Move sayErr to formr_utility-fns.mjs
# .(30417.04  4/17/23 RAM  1:55p|  Add _env on server warning
# .(30417.05  4/17/23 RAM  2:10p|  Check pEnv.Host_Location
# .(30526.03  5/26/23 RAM  1:25p|  No blank line in sayErr on leading space
# .(30527.04  5/27/23 RAM  2:55p|  Define aLogNo for sayErr
# .(30528.02  5/28/23 RAM  1:30p|  Initialize aLogNo with trailing space
# .(51123.02 11/23/25 RAM  4:00p|  Copy .env file if it doesn't exist
                                |
##SRCE     +====================+===============================================+
#*/
//  --------------------------  =   -------------------------------- ------------------ ------------------+ --------------------------

//      import  fs           from  'fs'                                                                     //#.(30412.01.7)

       var  inspect         =  function( pObj ) { return String( pObj ) }                                   // .(30416.02.x )

        if (typeof(process)!= 'undefined') {

       var  inspect         = (await import( 'util' )).inspect                                              // .(30416.02.x RAM no workie)
       var  path            =  await import( 'path' )                                                       // .(51123.02.1)
       var  pFS             =  await import( 'fs' )                                                         // .(30412.01.7 RAM Get pFS here  so getEnv_sync   doesn't have to be a async function)
//     var  pFS             =  await import( 'fs/promises' ) { .. }                                         //#.(30412.01.2 RAM Get pFS above so this function doesn't have to be a async function)
            global.aLogNo   = '00000 '                                                                      // .(30528.02.1).(30527.04.1)
        } else {
            window.aLogNo   = '00000 '                                                                      // .(30528.02.2).(30527.04.2)
            }                                                                                               // .(30507.03.1 RAM Clearer)

//     var  pUtil           =  await import( 'util' ), inspect = pUtil.inspect                              // .(30416.02.x RAM no workie)

//     var  pMeta           =  import.meta.resolve()
       var  aURI            =  import.meta.url; // console.log( "aURI", aURI ); process.exit()
       var  aOS             = (typeof(process) != 'undefined' ) ? (process.platform === 'win32' ? 'windows' : (process.platform === 'darwin' ? 'darwin' : 'linux')) : 'browser'
       var  __filename      =  aURI.replace( /^.+\//, "" )
       var  __dirname       =  aURI.replace( `/${__filename}`, '' ).replace( 'file:///', (aOS == 'linux' || aOS == 'darwin') ? '/' : '')  // .(30322.05.1 RAM Put '/' back in for Linux and macOS)
       var  __appDir        =  __dirname.replace( /\/assets\/mjs\/*/, "" );  // ${__dirname}/../../`                 // .(30416.03.1 RAM Create __appDir)
//          }
//          traceR(  __filename,   "Loaded", 1 )                                                          */

// ------  ---- -----------------------------------------------------------------------------------------

async function  setAPI_URL( pEnv,  aNum ) {                                                                 // .(30410.03.1 RAM Beg Write it).(30410.04.9 RAM Add pEnv arg)
//          console.log( `module ${aNum} aAPI_URL: '${ typeof(aAPI_URL) !='undefined' ? aAPI_URL : 'undefined' }'` )
//          console.log( `setAPI_URL[1]  await getEnv()` )

       if (!pEnv) {                                                                                         // .(30412.01.1)
       var  pEnv     =  await  getEnv(); if (!pEnv) { return }  // this await causes Page Reload error
            }                                                                                               // .(30412.01.1)
        if (pEnv.Host_Location) {                                                                           // .(30417.05.1 RAM Check pEnv.Host_Location)
//     var  aAPI_URL = `${pEnv.Local_Host}:${pEnv.Server_Port}`

       var  aAPI_URL = `${pEnv.Host_Location == 'remote'
                     ?    pEnv.API_URL
                     : `${pEnv.Local_Host}:${pEnv.Server_Port}` }`

        if (typeof(window) != 'undefined') {
            window.aAPI_URL = aAPI_URL
            window.setHTML  = setHTML
        } else {
            global.aAPI_URL = aAPI_URL
            global.setHTML  = setHTML
        }   }                                                                                              // .(30417.05.2)
//          console.log( `module ${aNum} aAPI_URL: '${ typeof(aAPI_URL) !='undefined' ? aAPI_URL : 'undefined' }'` )
            console.log( `setAPI_URL[3]  aAPI_URL: '${ typeof(aAPI_URL) !='undefined' ? aAPI_URL : 'undefined' }'` )
         }; // eof setAPI_URL                                                                              // .(30410.03.1 RAM End)
//--------  ------  =  -----------------------------------------------------

//       function getEnv( aFile, bNewOnly ) {
  async  function getEnv( aFile, bNewOnly ) {                                                               // .(30222.01.3 RAM Beg Write getEnv).(30320.04.2 RAM Don't reurn existing values)

       var  aPath   = `${__appDir}/` // `${__dirname}/../../`                                               // .(30416.03.5 RAM Will this work?)
        if (typeof(window) != 'undefined') {
//     var  aPath   =  window.location.href.replace( /[^/]+$/, '')  // has trailing /
       var  aFile   = `${ aPath }_env`
            console.log( `getEnv[1]             Fetching remote file, '${aFile}'` )
//     var  aFile   = '../_env'    // ``${ aPath }_env`
       try {
       var  pRes    =  await fetch(  aFile );                                                               // .(30222.01.4 This await causes Page Reload error when error occurs in another fetch)
       if (!pRes.ok) { sayEnvErr(    aFile ) }                                                              // .(30222.01.5 Handle error)
       var  pEnv    =  fmtEnv( await pRes.text() )
       } catch( e ) {  sayEnvErr(    aFile ); return null  }
       } else {
//     var  pFS     =  await import( 'fs' )                                                                 //#.(30412.01.2)
       var  pFS     =  await import( 'fs/promises' )                                                        // .(30412.01.2 RAM Should work, but use getEnv_sync instead)
       var  aFile   = `${ aPath }.env`
//          console.log( `getEnv[2]             Reading local file, '${aFile}'` )
       if (!pFS.existsSync( aFile )) { sayEnvErr( aFile );
    return  process.env }                                                                                   // .(30319.01.1 RAM Do nothing if .env not found).(30322.03.6 RAM Display error)
       var  pEnv    =  fmtEnv(  pFS.readFileSync( aFile, 'ASCII' ) )
            pEnv    =  bNewOnly ? pVars : { ...process.env,  ...pEnv }
            }
    return  pEnv
         };
//     ---  ------- =  ---------------------------------------------

  function  getEnv_sync( aFile, bNewOnly ) {                                                                // .(30412.01.2 RAM Beg Write getEnv_sync)

       var  aPath   = `${__appDir}/` // `${__dirname}/../../`                                               // .(30416.03.6 RAM Will this work?)
        if (typeof(window) != 'undefined') {
                       sayEnvErr( aFile ); return null                                                      // .(30412.01.3)
        } else {
//     var  pFS     =  await import( 'fs' )                                                                 //#.(30412.01.4)
       if (!aFile) { aFile = `${ aPath }.env` }  // Use provided file path or construct default
       // aFile is now set - use it as is
//     var  pFS     =  await import( 'fs/promises' )                                                        // .(30412.01.2 RAM Get pFS above so this function doesn't have to be a async function)
//         console.log( `getEnv_sync[2]        Reading local file, '${aFile}'` )
       if (!pFS.default.existsSync( aFile )) {                                                              // .(51123.02.2 Check .env-local.env or remote file Beg)
        var aRemote = `${process.env.THE_SERVER}`.match( /formr/i ) ? 'remote' : 'local'
            aRemote =   (process.FVARS.SERVER_LOCATION || '').toLowerCase()=='remote' ? 'remote' : aRemote  // .(51124.05.1 RAM Another override)
        var aFile2  = path.join( aFile.replace( /\.env/, '' ), `api/.env-${aRemote}.env` )
        if (pFS.default.existsSync( aFile2 )) {                                                            
            pFS.default.copyFileSync( aFile2, aFile )                                                       // .(51123.02.2 RAM Copy .env-local.env or .env-remote.env to .env)
               console.log( ` * Copied: '${aFile2}'\n       to: '${aFile}'` )
            }  }
       if (!pFS.default.existsSync( aFile )) { sayEnvErr( aFile );                                         
    return  process.env }                                                                                   // .(30319.01.1 RAM Do nothing if .env not found).(30322.03.6 RAM Display error)
       var  pEnv    =  fmtEnv(  pFS.default.readFileSync( aFile, 'ASCII' ) )
            pEnv    =  bNewOnly ? pVars : { ...process.env,  ...pEnv }
            }
    return  pEnv
         }; // eof getEnv_sync                                                                              // .(30412.01.2 RAM End)
//     ---  ------- =  ---------------------------------------------

  function  fmtEnv( aEnvText ) {                                                                            // .(30222.01.3 RAM Beg Write getEnv)).(30320.04.2 RAM Don't reurn existing values)

       var  mVars   =  aEnvText.split(/[\r\n]/), pVars = { }
            mVars.forEach( aVar => { if (aVar.replace( /^ +/, "" ) > "" && aVar.match( /^ *#/ ) == null ) {
       var  aKey    =  aVar.replace( /=.*/,    '' ).replace( /[ '"]/g,  '' );                               // .(30320.05.1 RAM No Quotes or spaces)
       var  aVal    =  aVar.replace( /.+?=/,   '' ).replace( /^[ '"]*/, '' ).replace( /[ '"]*$/, '' );      // .(30320.05.1 RAM No leading Quotes or spaces)
            aVal    =  aVal.replace( / *#.*$/, '' ).replace( /'$/, '' )                                     // .(30412.03.1 RAM Remove trailing #s)
       var  bNum    =  aVal.match( /^ *([0-9]+|true|false|null|undefined) *$/i ) != null                    // .(30322.06.3 RAM Add null and undefined)
            pVars[aKey] = bNum ? (aVal.match(  /false|null|undefined/i ) ? false : (aVal.match( /true/i ) ? true : aVal * 1 )) : aVal } } )   // .(30322.06.4)
     return pVars
            } // eof fmtEnv
//     ---  ------  =  ---------------------------------------------

  function  sayEnvErr( aFile ) {                                                                            // .(30328.01.1 Beg Write seperate function)

       var  aEnv =  aFile.match( /_env/ ) ? '_env' : '.env', aFill = `\n`.padEnd(22)
       var  aMsg = `\n*** The ${aEnv} file does NOT EXIST!${aFill} '${aFile}'\n`
        if (aFile.match(/server/) && aEnv == '_env') {                                                      // .(30417.04.3 RAM Add warning)
            aMsg += `${aFill.substring(1)}* Are you running a server file in Live Server??`                 // .(30417.04.4)
            }                                                                                               // .(30417.04.5)
            sayErr( aMsg )
        if (typeof( process ) != 'undefined') {                                                             // .(30411.01.1 RAM )
                    process.exit()
        } else {    // in browser
                    alert( aMsg.replace( new RegExp(aFill, 'g'), "\n    " ) ) // window.stop( )             // .(30417.04.6)
            }
          } // eof sayEnvErr                                                                                // .(30328.01.1 End)
//     ---  ------  =  ---------------------------------------------
//       }; // eof sayEnvErr                                                                                //#.(30222.01.3 RAM End).(30412.01.5)
//--------  ------  =  -----------------------------------------------------

  function  sayErr( aMsg ) {                                                                                // .(30417.03.1 RAM Move to here)
       var  aTS  = (new Date).toISOString().replace( /[Z:-]/g, '' ).replace( /T/, '.' )
            aTS  =`${aLogNo.substring( 0, 5 )}*${ aTS.substring(9) }`                                       // .(30528.02.3 RAM Add '*' aLogNo).(30527.04.3)

//     var  aCR  =  aMsg.match( /^[ \n]+/ ) ? "\n" : ""; aMsg = aMsg.replace( /^[\n]+/, "" )                //#.(30416.01.1).(30526.03.1 RAM sayErr No blank line on leading space)
       var  aCR  =  aMsg.match( /^[\n]+/  ) ? "\n" : ""; aMsg = aMsg.replace( /^[\n]+/, "" )                // .(30416.01.1).(30526.01.23 RAM Don't check for leading sp)
            console.log( `${aCR}${aTS}  ${aMsg}` )
//          console.trace()                                                                                 // .(30416.01.2)
      }; // eof sayErr
//--------  ------  =  -----------------------------------------------------

  function  traceR( aFLNo, aMsg, nSay, pObj ) {                                                             // .(30416.02.1 RAM Beg Write traceR)
            aMsg  = typeof(aMsg) == 'object' ?        inspect( aMsg, { depth: 99 } ) : String( aMsg )
            aMsg += typeof(pObj) == 'object' ? `:\n${ inspect( pObj, { depth: 99 } ) }` : ''
            aMsg += typeof(pObj) == 'string' ? `:\n'${ pObj }'` : ( typeof(pObj) != 'object' ? ( pObj ? pObj : '' ) : '' )
        if (nSay >= 1) { console.log( `${aFLNo.padEnd( 19 )}${aMsg.replace( /\n/g, "\n".padEnd( 20 ) ) }` ) }
         }; // eof traceR                                                                                   //#.(30416.02.1 RAM End)
//--------  ------  =  -----------------------------------------------------

 async function  setHTML( aDivID, aFile ) {                                                                 // .(30401.02.1 Beg RAM Add function)
       var  aPath     =  window.location.href.replace( /[^/]+$/, '')
//          traceR(     `setHTML[1]     ${aPath}/includes/inc-header-home.html`, nSay2 )
       var  response  =  await fetch( `${aPath}${aFile}` );
       var  aHTML     =  await response.text()
       var  pDiv      =  $( `#${aDivID}` )
            pDiv.html(   aHTML )
//          sayMsg(     `setHTML[2]     Included '${aFile}'`, nSay2)
            }                                                                                               // .(30401.02.1 End)

export { setAPI_URL, getEnv, getEnv_sync, setHTML, __dirname, __appDir }                                    // .(30412.01.6).(30416.02.2).(30416.03.2)
export { sayErr, aOS, traceR }                                                                              // .(30417.03.2)
