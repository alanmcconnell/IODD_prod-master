/*\
##=========+====================+================================================+
##RD       formr_server-fns.mjs | Server script
##RFILE    +====================+=======+===============+======+=================+
##FD       server-fns_u1.00.mjs |  12796|  3/20/23 12:47|    65| u1.00-30320.1247
##FD       server-fns_u1.01.mjs |  15088|  3/23/23 14:54|    65| u1.01-30323.1454
##FD       server-fns_u1.01.mjs |  18470|  3/28/23 21:18|    65| u1.01-30328.2118
##FD       server-fns_u1.02.mjs |  15714|  3/30/23 15:07|    65| u1.02-30330.1507
##FD       server-fns_u1.03.mjs |  21473|  3/31/23 22:45|   341| u1-03-30331.2245
##FD       server-fns_u1.04.mjs |  37077|  4/02/23 17:24|   566| u1-04.30402.1724
##FD formr_server-fns_u1.04.mjs |  40123|  4/10/23 13:09|   602| u1-04.30410.1300
##FD formr_server-fns_u1.06.mjs |  45486|  4/12/23 16:32|   652| u1-06.30412.1630
##FD formr_server-fns_v1.06.mjs |  45567|  4/13/23 15:31|   653| v1-06.30412.1630
##FD formr_server-fns_v1.06.mjs |  45567|  4/13/23 16:31|   653| v1-06.30412.1630
##FD formr_server-fns_u1.06.mjs |  46749|  4/13/23 17:00|   665| u1-06.30413.1700
##FD formr_server-fns_u1.06.mjs |  55801|  5/11/23 15:45|   730| u1-06`30511.1545
##FD formr_server-fns_u1.06.mjs |  56121|  5/15/23 21:05|   732| u1-06`30515.2105
##FD formr_server-fns_u1.06.mjs |  65820|  5/27/23 19:00|   813| u1-06`30527.1900
##FD formr_server-fns_u1.06.mjs |  75099|  5/29/23 12:22|   894| u1-06`30529.1222
##FD formr_server-fns_u1.06.mjs |  75632|  5/30/23 13:30|   897| u1-06`30530.1330
##FD formr_server-fns_u1.07.mjs |  76000|  7/02/25 13:15|   897| u1-07`50702.1315
##DESC     .--------------------+-------+---------------+------+-----------------+
#           This Javascript file
##LIC      .--------------------+----------------------------------------------+
#           Copyright (c) 2023 8020Data-formR * Released under
#           MIT License: http://www.opensource.org/licenses/mit-license.php
##FNCS     .--------------------+----------------------------------------------+
#           putData                                                                     // .(30403.05.0)
#           getData
#           getHTML                                                                     // .(30401.02.0)
#           getStyle                                                                    // .(30402.01.0)
#           getJSON                                                                     // .(30402.01.0)
#           saySQL
#           setRoute
#           chkSQL              | return aSQL from aStr or fmtSQL with WHERE id = pArgs.id if present
#           sndRecs
#           sndFile                                                                     // .(30403.04.0)
#           fmtJSON
#           sndJSON
#           getIPAddr           |                                                       // .(30526.02.0)
#           chkArgs
#           chkArg
#           chkSQL                                                                      // .(30403.06.0)
#           fmtArgs
#           sndHTML
#           setErr
#           sndErr
#           sayErr
#           logIP                                                                       // .(30526.02.0)
#           shell                                                                       // .(50703.02.1)
#           sayMsg
#           indexObj                                                                    // .(30402.03.0)
#           init
#           setVar2
#           setVar1
#           start
#                               |
##CHGS     .--------------------+----------------------------------------------+
# .(30213.01  2/13/23 RAM  1:45p|  Created
# .(30213.02  2/13/23 RAM  2:12p|  Change port from 3000 to 3002
# .(30214.03  2/14/23 RAM  8:00p|  Display root dir
# .(30312.02  3/12/23 RAM  9:10a|  Set nPort for FRApps/server3/s36_mysql-data-api )
# .(30318.01  3/18/23 RAM  8:22a|  Should `return pReq.query` be `{}`??
# .(30319.01  3/19/23 RAM  3:32p|  Do nothing if .env not found
# .(30322.03  3/22/23 RAM  1:28p|  Play with aRemoteHost, bQuiet & aNeeds to be global to the IODD object
# .(30322.05  3/22/23 RAM  2:20p|  Put '/' back into replace( 'file:///', '/' ) if aOS = 'linux'
# .(30322.06  3/22/23 RAM  3:02p|  Add null and undefined
# .(30323.05  3/23/23 RAM  2:54p|  pDB_Config, set in code, takes precedence)
# .(30328.02  3/28/23 RAM  9:20p|  Write chkSQLargs
# .(30328.03  3/28/23 RAM  9:18p|  Move setRoute to server-fns.mjs
# .(30328.04  3/28/23 RAM 10:00p|  Write saySQL
# .(30328.05  3/28/23 RAM 10:34p|  Write chkSQLargs
# .(30322.03  3/31/23 RAM  3:24p|  aRemote_Host and aAPI_Host is needed by setRoute
# .(30328.05  3/31/23 RAM  3:34p|  Add Node's inspect
# .(30328.05  3/31/23 RAM  7:53p|  Return object in chkSQLargs
# .(30331.01  3/31/23 RAM  8:00p|  Display onRoute name
# .(30401.02  4/01/23 RAM  4:00p|  Add getHTML
# .(30402.01  4/02/23 RAM  2:53p|  Add fetchFile
# .(30402.02  4/02/23 RAM  2:53p|  Add getStyle, getJSON and modify getHTML
# .(30402.03  4/02/23 RAM  3:18p|  Add indexObj
# .(30402.05  4/02/23 RAM  5:24p|  Reuse sayMsg. Plus lots of changes for 'n Records found'
# .(30403.04  4/03/23 RAM  1:09p|  Write sndFile
# .(30403.05  4/03/23 RAM  3:40p|  Write putData
# .(30403.06  4/03/23 RAM  7:07p|  Add chkSQL and default pValidArgs: { id : /[0-9]+/ }
# .(30403.07  4/03/23 RAM  7:45p|  Trim mArg in chkArgs
# .(30406.01  4/06/23 RAM  9:10a|  Return InsertId
# .(30407.03  4/07/23 RAM  9:15a|  Change getData and putData to sndErr if needed
# .(30408.01  4/08/23 RAM 10:15a|  In chkSQL, Check if WHERE exists)
# .(30410.02  4/10/23 RAM  8:15a|  Breakout formr_utility-fns_u1.06.mjs
# .(30410.03  4/12/23 RAM  1:30p|  Use setAPI_URL and move aRemote
# .(30412.01  4/12/23 RAM  2:30p|  Use getEnv_sync
# .(30412.02  4/12/23 RAM  3:20p|  Move aAPI override to init()
# .(30413.01  4/13/23 RAM  5:00p|  Parse SQL with SQLn:
# .(30415.02  4/15/23 RAM  9:00p|  Use typeof instead of if (MT) {}
# .(30415.03  4/15/23 RAM  8:00p|  Add ${aAPI_Host} to sayMsg
# .(30415.04  4/15/23 RAM 10:00p|  Check if cssjson is present
# .(30416.01  4/16/23 RAM 10:30a|  Preserve \n in sayMsg
# .(30416.02  4/16/23 RAM 11:20a|  Use tracrR
# .(30416.03  4/16/23 RAM  1:55p|  Use __appDir
# .(30417.03  4/17/23 RAM  1:15p|  Move sayErr to formr_utility-fns.mjs
# .(30511.02  5/11/23 RAM  3:45p|  Prevent crash if SELECT nothing if no args
# .(30515.03  5/15/23 RAM  9:05p|  Don't remove // or -- from SQL if preceeded by a space
# .(30526.01  5/26/23 RAM  9:00a|  Adjust log spacing
# .(30526.02  5/26/23 RAM  1:15p|  Add getIPAddr and Display in logIP
# .(30526.03  5/26/23 RAM  3:30p|  Fix formatting of aRecords
# .(30527.02  5/27/23 RAM 10:00a|  Add fmtFld4SQL and fix saySQL
# .(30527.03  5/27/23 RAM 11:22a|  Return 'error' if 0 records deleted
# .(30527.04  5/27/23 RAM 12:48p|  Add IP and aLogNo Session number to sayMsg
# .(30526.02  5/27/23 RAM  7:00p|  Get Page and User too for sayMsg log
# .(30528.01  5/28/23 RAM 12:55p|  Change 'records' to 'recs' and pass to sayMsg
# .(30528.02  5/28/23 RAM  1:30p|  Add '+' or '-' to aLogNo
# .(30528.04  5/28/23 RAM  3:00p|  Add Abort to sayMsg instead of sayErr??
# .(30528.05  5/28/23 RAM  7:45p|  No need for sndHTML to say "handler executed"
# .(30529.01  5/29/23 RAM 12:22p|  Fix spacing for saySQL on Error
# .(30529.02  5/30/23 RAM  1:30p|  Remove doubling of //s in Start msg
# .(50702.01  7/02/25 RAM  1:07p|  Add nPort to start message
# .(50703.02  7/03/25 RAM  1:18p|  Add shell and kill port
#
##SRCE =========================+===============================================+========================== #  ===============================  #
#*/
//  ----------------------------|  -------------------------------- ------------------- ------------------+ --------------------------

   import   mysql           from  'mysql2/promise';
   import { inspect }       from  'util'                                                                    // .(30328.05.3 RAM Add)
   import   express         from  'express';
// import   bodyParser      from  'body-parser';                                                            // .(30424.09.x RAM Use express.json)
   import   killport        from  'kill-port'                                                               // .(50707.05.x)
   import   cssjson         from  'cssjson';                                                                // .(30402.02.5)
   import   cors            from  'cors';
// import   fs              from  'fs'

   import { getEnv_sync, __dirname, __appDir, traceR, aOS }  from  './formr_utility-fns.mjs'                // .(30410.02.1).(30410.03.1 Add setAPI_URL).(30412.02.10).(30416.02.3).(30416.03.3)
   import { sayErr }                                         from  './formr_utility-fns.mjs'                // .(30417.03.3)

       var  bQuiet     =  false    // it's global in this module
       var  aEnv       = '../../.env'
       var  aRemote_Host                                                                                    // .(30322.03.7 RAM Needs to be global to the IODD object)
       var  aAPI_Host                                                                                       // .(30322.03.8 RAM aAPI_Host is needed by setRoute)
//     var  pApp                                                                                            //#.(30328.03.4 RAM pAPP is needed by setRoute)
       var  nSay       =  0,  nSay2 = 1
       var  nCount     =  0
//     var  aLogNo     = '00000'                                                                            //#.(30527.04.1)
       var  mIPs       = { }                                                                                // .(30527.04.4)

//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async function  putData( pDB, aSQL, aDatasetName, pRes ) {                                                 // .(30407.03.1 Beg RAM Write function)
       var  mRecs         =  await putData_( pDB, aSQL, aDatasetName );
        if (pRes) { sndErr(  pRes, mRecs[1] );                                                              // .(30515.12.1 RAM What is this for???)
            process.exit()
         } else {
    return  mRecs
            }
         }; // eof putData                                                                                  // .(30407.03.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async function  putData_( pDB, aSQL, aDatasetName ) {                                                                                              // .(30403.05.1 Beg RAM Write function).(30407.03.2)
       var  aRecords   = `${ aDatasetName ? aDatasetName.replace( /^\//, "" ) : '' } rec`                                                           // .(30528.01.1 RAM Is needed).(30526.03.1)

       var  aAction    =  aSQL.match( /INSERT/i ) ? 'inserted' : (aSQL.match( /DELETE/i ) ? 'deleted' : 'updated' )                                 // .(30403.05.5 RAM Added deleted)
       try {
       var  mRecs      =  await pDB.execute( saySQL( aSQL, 'parse' ) );                                                                             // .(30413.01.1 RAM Parse SQL).(30527.02.6 RAM Don't fmt for say, rather clean for execute)
//     var  mRecs      =  await pDB.execute( saySQL( aSQL ) );                                                                                      //#.(30413.01.2 RAM Parse SQL).(30527.02.6 RAM Do fmt to say, don't parse which it didn't anyway)

//     var  mColDefs   =  mCols.map( pRec => { return { Name: pRec.name, Type: pRec.type, Len: pRec.columnLength, Decs: pRec.decimals } } )
       var  nID        =  aSQL.match( /INSERT/i ) ? mRecs[0].insertId : 0, aRecords                                                                 // .(30406.01.1 RAM Return InsertedId)

       var  nRecs      =  mRecs[0].affectedRows                                                                                                     // .(30526.03.2)
       var  aRecords   = `${ ('* ' + nRecs).padStart(nRecs == 1 ? 5 : 4) } rec${ nRecs == 1 ? '' : 's' }`                                           // .(30528.01.1).(30526.03.15 RAM Was: 'records').(30526.03.3 RAM Add space for singular).(30526.03.3 RAM Don't, pad it with 4, or 5)
//      if (aDatasetName) {  aRecords = `${aRecords}${ (mRecs[0].affectedRows == 1) ? '' : 's' } ${ nID ? `, ${nID},` : '' }` }                     //#.(30406.01.2).(30526.03.4)
        if (aDatasetName) {  aRecords = `${aRecords} for '${aDatasetName}'${ nID ? ` (${nID})` : '' }` }                                            // .(30406.01.2).(30526.03.4)

//               sayMsg( `${ saySQL( aSQL ) }\n    *  ${ `${mRecs[0].affectedRows}` } ${ aRecords }, ${aAction}`.replace( /\n/g, '\n           ')); //#.(30526.03.5)
//               sayMsg( `${ saySQL( aSQL ) }\n  ${ aRecords }, ${aAction}`.replace( /\n/g, '\n           ') );                                     //#.(30526.03.5).(30528.01.1)
                 sayMsg(     saySQL( aSQL,  0,  `${ aRecords }, ${aAction}` ) )                                                                     // .(30528.01.1).(30526.03.5)

//  return ["success",  ` ${ mRecs[0].affectedRows } ${ aRecords }, ${aAction}`, { affectedRows: mRecs[0].affectedRows , affectedId: nID } ]        //#.(30406.01.3).(30526.03.6)
       var  aSuccess   =   ( aSQL.match( /DELETE/i ) && nRecs == 0 ) ? 'warning' : 'success'                                                        // .(30527.03.1 RAM Return 'warning' if deleted 0 records)
    return [aSuccess,    `${ aRecords.substring(4) }, ${aAction}`, { affectedRows: nRecs , affectedId: nID } ]                                      // .(30406.01.3).(30526.03.6).(30527.03.2)

        } catch( pError ) {  var aFill = '\n'.padEnd( 18 )                                                                                          // .(30529.01.1)
                 sayErr(   ` *** Error:  ${pError.message}.${aFill}${ saySQL( aSQL, -1 ) }\n` );                                                    // .(30529.01.2 RAM Fix SQL error fmt, 31 is not used, but -1 should be)
    return  [ "error",          `Error:  ${pError.message}.  <br>
                                          &nbsp; &nbsp; &nbsp; ${     saySQL( aSQL    ) }` ]
            }
         }; // eof putData_                                                                                                                         // .(30403.05.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async function  getData( pDB, aSQL, aDatasetName, pRes ) {                                                                                         // .(30407.03.3 Beg RAM Write function)
       var  mRecs         =  await getData_( pDB, aSQL, aDatasetName );
        if (mRecs[0] == 'error') {
        if (pRes) { sndErr( pRes, mRecs[1] );
//          process.exit()                                                                                                                          //#.(30511.02.1 RAM Don't abort).30407.03.x RAM I'd rather continue, but we've already sent an error)
            return null                                                                                                                             // .(30511.02.2 RAM Return !mRecs)
            }                                                                                                                                       //#.(30410.03.2 RAM ?? )
         } else {
    return (mRecs[0] == 'nodata') ? [] : mRecs                                                                                                      // .(30407.03.4 RAM Return [] if no data)
            }
         }; // eof getData                                                                                                                          // .(30407.03.3 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async function  getData_( pDB, aSQL, aDatasetName ) {                                                                                              // .(30402.05.17).(30407.03.5)
       var  aRecords   = `${ aDatasetName ? aDatasetName.replace( /^\//, "" ) : '' } rec`                                                           // .(30528.01.2 RAM Is needed).(30402.05.20).(30526.03.7 RAM Not needed).(30526.03.7 RAM it is for sayErr)
       try {
       var [mRecs, mCols] =  await pDB.execute( saySQL( aSQL, 'parse' ) );                                                                          //#.(30413.01.2 RAM Parse SQL).(30527.02.7 RAM Don't fmt for say, rather clean for execute)
//     var [mRecs, mCols] =  await pDB.execute( saySQL( aSQL ) );                                                                                   // .(30413.01.2 RAM Parse SQL).(30527.02.7 RAM Do fmt for sayMsg, don't parse which it didn't anyway)

       var  mColDefs      =  mCols.map( pRec => { return { Name: pRec.name, Type: pRec.type, Len: pRec.columnLength, Decs: pRec.decimals } } )
        if (mRecs.length == 0) {
//               sayErr(    ` *** NoData:  No ${ aRecords }s returned.\n${ saySQL( aSQL, 31 ) }` );                                                 //#.(30402.05.21).(30407.03.6).(30526.01.01).(30528.01.2)
                 sayErr(     saySQL( aSQL,  0, `  ** NoData:  No ${ aRecords }s returned` ) );                                                      // .(30528.01.2).(30402.05.21).(30407.03.6).(30526.01.01)

    return  [ "nodata",          `NoData:  No ${ aRecords }s returned.<br>                                                                          // .(30407.03.7).(30526.01.02)
                                                 &nbsp; &nbsp; &nbsp; ${ saySQL( aSQL     ) }` ] // .replace( /"/g, '\\"' ) ];                      // .(30328.04.2).(30402.05.11 RAM To be sent as HTML)
     } else {
       var  nRecs         =  mRecs.length                                                                                                           // .(30526.03.8)
       var  aRecords      = `${ ('* ' + nRecs).padStart(nRecs == 1 ? 5 : 4) } rec${ nRecs == 1 ? '' : 's' }`                                        // .(30528.01.2).(30526.03.16).(30526.03.9 RAM Added space for singular).(30526.03.9 RAM Don't, pad it with 4, 05)
//      if (aDatasetName) {  var aRecords = `${aRecords}${ (mRecs.length == 1) ? '' : 's' }`                                                        //#.(30402.05.18).(30526.03.10)
            aRecords      = (aDatasetName) ? `${aRecords} for '${aDatasetName}'` : aRecords                                                         // .(30406.01.2).(30526.03.10)
//          aRecords      = `${ aLogNo}${ aTS.substring( 9, 19 ) }${aRecords}`                                                                      //#.(30528.01.3 RAM Add aLogNo)
//               sayMsg( `${ saySQL( aSQL ) }\n       * ${ `${mRecs.length}`.padStart(3) } ${aRecords} found`.replace( /\n/g, '\n           ') ); } //#.(30402.05.19)
//               sayMsg( `${ saySQL( aSQL ) }\n     *  ${  `${nRecs}` } ${ aRecords       }, returned`.replace( /\n/g, '\n           ') ); }        //#.(30402.05.23).(30526.03.11)
//               sayMsg( `${ saySQL( aSQL ) }\n  ${ aRecords }, returned`.replace( /\n/g, '\n           ') );                                       //#.(30526.03.11).(30528.01.3)
                 sayMsg(     saySQL( aSQL,  0,  `${ aRecords }, returned` ) )                                                                       // .(30528.01.3).(30526.03.11)
    return  mRecs
            }
        } catch( pError ) {  var aFill = '\n'.padEnd( 18 )                                                                                          // .(30529.01.3)
                 sayErr(   ` *** Error:  ${pError.message}.${aFill}${ saySQL( aSQL, -1 ) }\n` );                                                    // .(30529.01.4)
    return  [ "error",          `Error:  ${pError.message}.  <br>
                                          &nbsp; &nbsp; &nbsp; ${     saySQL( aSQL     ) }` ] // .replace( /"/g, '\\"' ) ];                         // .(30328.04.2).(30402.05.12 RAM To be sent as HTML)
            }
         }; // eof getData
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

//function  sndRecs( pRes, mRecs, aSQL, aDatasetName, aOnRouteFnc ) {                                       //#.(30331.01.3).(30407.03.8)
  function  sndRecs( mRecs, aSQL, aDatasetName, pRes, aOnRouteFnc ) {                                       // .(30407.03.8)
       var  aRecords   = (aDatasetName ? aDatasetName.replace( /^\//, "" ) + " " : "" ) + 'records'         // .(30526.03.12 RAM Keep??)
       var  aJSON;

        if (String(mRecs[0]).match(/error/ )) {
            aJSON      = JSON.stringify({ "error": mRecs[1].replace( /[ \n]+$/, '' ) })                     // Ensure proper JSON format
        } else {
        if (mRecs.length > 0 || pRes.bSndNoData) {
//          aRecords   = (mRecs.length != 1) ? aRecords : aRecords.replace( /s$/, "" ).replace(  /ies$/, 'y' )                                      // .(30402.05.25).(30526.03.14 RAM Don't keep??)
//               sayMsg( `${ saySQL( aSQL    ) }\n       * ${ `${mRecs.length}`.padStart(3) } ${aRecords} found`.replace( /\n/g, '\n           ')); //#.(30328.04.4).(30402.05.24)
     // //  ??   sayMsg( `${ saySQL( aSQL    ) }\n     *  ${  `${mRecs.length}` } ${  aRecords      }, returned`.replace( /\n/g, '\n           ')); // .(30328.04.4).(30402.05.24)
//     var  pRecs      =  mRecs; if (aDatasetName) { pRecs = {}; pRecs[aRecords]     = mRecs }              //#.(30404.01.2)
       var  pRecs      =  mRecs; if (aDatasetName) { pRecs = {}; pRecs[aDatasetName.replace( /^\//, "" )] = mRecs }  // .(30404.01.2 RAM Use aDatasetName, not Records)
       var  aJSON      =  fmtJSON( pRecs, aSQL )
//               sayMsg( `Handler,     '${aOnRouteFnc ? aOnRouteFnc :'routeHandler'}', executed`); //#.(30331.01.4).(30526.01.09)
        } else {
//                        sayErr( `${ saySQL( aSQL    ) }\n ** No ${aRecords} found` );                     //#.(30328.04.6).(30402.05.15 RAM Not the same as GetData).(30407.03.9 RAM Now done in getData)
       var  aJSON      =  JSON.stringify( { "data": [], "message": `No ${aRecords} found` } )              // Return empty array with message in proper JSON format
         }  }
//      if (pRes) {       sndJSON( pRes, aJSON, aRecords ) }                                                //#.(30407.03.10 RAM getData may not pass pRes )
//               sayMsg( `Handler,     '${aOnRouteFnc ? aOnRouteFnc :'routeHandler'}', executed`);          //#.(30331.01.4).(30526.01.10).(30528.05.1)
                          sndJSON( pRes, aJSON, aRecords )                                                  // .(30407.03.10 RAM getData nice try, need to send []  )
                 sayMsg( `Handler,     '${aOnRouteFnc ? aOnRouteFnc :'routeHandler'}', executed`);          // .(30528.05.1 RAM Move it here).(30331.01.4).(30526.01.10)
         }; // eof sndRecs
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async function  getHTML( aFile, aDivID ) {                                                                 // .(30401.02.1 Beg RAM Add function)

       var  pJSON      =  await fetchFile( aFile, false )                                                   // .(30402.02.1 RAM Use fetchFile)
        if (aDivID) {
       var  pDiv       =  $( `#${aDivID}` )
            pDiv.html(    pJSON.text )
//               traceR( `setHTML[2]     Included HTML file, '${aFile}'`,  nSay2)                           //#.(30402.05.1)
                 sayMsg( `HTML file,  '${aFile}', included` )                                               // .(30402.05.1).(30526.01.03)
        } else {
//               traceR( `setHTML[3]     Retreived HTML file, '${aFile}'`, nSay2)                           //#.(30402.05.2)
                 sayMsg( `HTML file,  '${aFile}', retreived` )                                              // .(30402.05.2).(30526.01.04)
    return  pJSON.text
            }
         }; // eof getHTML                                                                                  // .(30401.02.1 End)
//  ------  ---- ----- =  ------|  ---------------------------------- ----------------- ------------------+

 async function  getStyles( aFile, mStyles, aDivID ) {                                                      // .(30402.02.2 Beg RAM Add function)
//     var {toCSS, toJSON} = await import( 'cssjson' );
//     var  toJSON     =  await import( 'cssjson' ).toJSON;
//     var  toJSON     =  await import( 'cssjson' ).toJSON;
//     var  cssjson    =  await import( 'cssjson' );
        if (typeof(cssjson) == 'undefined') { sayErr( "\n** Module, 'cssjson', not loaded\n" ); return "" } // .(30415.04.1 RAM)

       var  toJSON     =  cssjson.toJSON;
       var  toCSS      =  cssjson.toCSS;
       var  nSay3      =  process.env.Log_Styles == true                                                    // .(30417.02.3)

       if (!Array.isArray(mStyles)) { aDivID = mStyles }
        if (aDivID) {
       var  pSheet     =  $( `#${aDivID}` )
            pSheet.setAttribute( 'href', `${aFile}` )
                 traceR( "getStyles[1]", "Included CSS file",              nSay3, aFile  )                  //#.(30402.05.3)
                 traceR( "getStyles[1]", "Included CSS file",              nSay3, aFile  )                  //#.(30402.05.3)
                 sayMsg(` CSS  File,  '${aFile}', included` )                                               // .(30402.05.3).(30526.01.05)
        } else {
                 traceR( "getStyles[2]", "Fetching StyleSheet",            nSay3, aFile  )                  //#.(30402.05.4)
       var  aSheet     = (await fetchFile( aFile, false )).text
                 traceR( "getStyles[3]", "Fetched: aSheet",                nSay3, aSheet )                  //#.(30402.05.4)
       if (mStyles.length == 0) { return  aSheet }                                                          // .(30420.04.1 RAM Opps.)
       var  pJSON      =  toJSON( aSheet ), pStyles = {}, aCSS = ''                                         // .(30415.04.2)
                 traceR( "getStyles[4]", "Convered aSheet into pJSON",     nSay3, pJSON  )                  //#.(30402.05.4)
//          pJSON.children['*'].attributes
//          pJSON.children['login'].attributes
//          pJSON.children['login form'].attributes
//          pJSON.children['.login form input[type="password"], .login form input[type="text"]'].attributes

//     var  aStyles    =  indexObj( pStyles.children, mStyles )
//          mStyles.forEach( aStyle => { pStyles[ aStyle ] =  pJSON.children[aStyle].attributes } )
//          pStyles    =   pJSON

            mStyles.forEach( aStyle => {
             if (pJSON.children[aStyle]) {                                                                  // .(30420.02.1 RAM Check if style exists)
                 pStyles[ aStyle ] = pJSON.children[aStyle]  // .children and .attributes
             } else {                                                                                       // .(30420.02.2 Beg)
                 traceR( "getStyles[5]", `** Style, '${aStyle}', not found`, 1 )
                   }                                                                                        // .(30420.02.2 End)
                 } )
            pStyles    = { children: pStyles, attributes: { } }
        var aFound     =`${Object.keys( pStyles.children ).length} of ${mStyles.length}`                    // .(30420.02.3)
                 traceR( "getStyles[5]", `Selected ${aFound} mStyles from pJSON into pStyles`, nSay3, pStyles )  //#.(30402.05.4)
    try {                                                                                                   // .(30415.04.3)
                 traceR( "getStyles[6]", "Converting pStyles to aCSS", nSay3 )                              //#.(30402.05.4)
       var  aCSS       =  toCSS( pStyles )
                 traceR( "getStyles[7]", "Converted: aCSS", nSay3, aCSS )
                 sayMsg( `CSS  File,  '${aFile}', retreived` )                                              // .(30402.05.4).(30526.01.06)
        } catch(pErr) {   sayErr( `\n  ** CSS File,  '${aFile}', failed to load.${ `\n${pErr.message}`.replace( /\n/g, `${ "\n".padEnd(20) }** ` ) }` )  // .(30415.04.4).(30526.01.07)
                 traceR( "getStyles[8]", "** Failed to convert pStyles", nSay3 ) }
    return  aCSS
            } // eif fetch CSS file
         }; // eof getStyles                                                                                // .(30402.02.2 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

 async  function  getJSON( aFile ) {                                                                        // .(30402.02.3 Beg RAM Add function)
       var  pJSON      =  await fetchFile( aFile, false )
//               traceR( `getJSON[1]     Retreived JSON '${aFile}'`, nSay2)                                 //#.(30402.05.5)
                 sayMsg( `JSON file,  '${aFile}', retreived` )                                              // .(30402.05.5)
    return  pJSON
         }; // eof getJSON                                                                                  // .(30402.02.3 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

//function  setRoute(  pApp, aMethod,  aRoute_, onRoute,  pValidArgs_, fmtSQL_ ) {                          //#.(30328.03.1 RAM Move to this script).(30328.03.5 RAM Need onRoute too).(30401.02.1)
  function  setRoute(  pApp, aMethod,  aRoute_, onRoute_, pValidArgs_, fmtSQL_ ) {                          // .(30401.02.1 RAM Rework it a bit)
            aAPI_Host  = aAPI_Host ? aAPI_Host : global.aAPI_Host                                           // .(50707.01.x RAM Can I reset it?)

       var  aRoute     = `${aAPI_Host}${aRoute_}`
      var { pValidArgs, fmtSQL } = chkSQLargs( pValidArgs_, fmtSQL_ )                                       // .(30328.05.1 RAM Use chkArgs4SQL)

                           async function onRoute( pReq, pRes )    { onRoute_( aMethod, pReq, pRes, aRoute_, pValidArgs, fmtSQL ) } // .(40405.02.1 Use Original route)
//                                        async  ( pReq, pRes ) => { onRoute_( aMethod, pReq, pRes, aRoute,  pValidArgs, fmtSQL ) } //#.(40405.02.1)
    
//          console.log( `DEBUG: Registering ${aMethod.toUpperCase()} route: ${aRoute}` )                  //# .(50918.04b.1 RAM Remmove).(50918.04.1 CAI Add DEBUG: Add logging)
    
    switch (aMethod) {
//    case 'get'   : pApp.get(    aRoute, async  ( pReq, pRes ) => { onRoute ( aMethod, pReq, pRes, aRoute, pValidArgs, fmtSQL ) } ); break
      case 'get'   : pApp.get(    aRoute, onRoute ); break
      case 'post'  : pApp.post(   aRoute, onRoute ); break
      case 'put'   : pApp.put(    aRoute, onRoute ); break
      case 'delete': pApp.delete( aRoute, onRoute ); break
//    case 'patch' : pApp.patch(  aRoute, xController ); break
        default    : null
            }
                 sayMsg(  aMethod, `${aAPI_Host}${aRoute_}` )                                               // .(30414.02.1 RAM Add ${aAPI_Host})
            } // eof setRoute
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  chkSQL( fmtSQL, pArgs ) {                                                                       // .(30403.06.4 RAM Beg Write chkSQL )
     try {                                                                                                  // .(30511.02.3 RAM If fmtSQL bombs)
       var  aSQL        =  typeof( fmtSQL ) == 'string'  ? fmtSQL : fmtSQL( pArgs )
     } catch( pErr ) {    sayMsg( " *** fmtSQL: Error"); return '' }                                        // .(30511.02.4 RAM Return ""?).(30526.01.08)
        if (pArgs.id) {                                                                                     // .(30511.02.5 RAM Add to id = pArgs.id, if ...)
            aSQL        =  aSQL.match( /id *=/i ) ? aSQL                                                    // .(30403.06.2 RAM Kludge: Don't add if id = is present)
                        : `${aSQL} ${ aSQL.match( /WHERE/i ) ? 'AND' : 'WHERE' } id = ${pArgs.id}` }        // .(30408.01.1 RAM Check if WHERE exists)
    return  aSQL
            } // eof chkSQL                                                                                 // .(30403.06.4 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function chkSQLargs( pValidArgs, fmtSQL_) {                                                               // .(30328.05.2 Beg RAM Write chkSQLargs)
      var  fmtSQL      = (typeof(fmtSQL_) != 'undefined') ? fmtSQL_ : '' // pValidArgs || ''
           pValidArgs  =  pValidArgs ? pValidArgs : { }
       if (typeof(fmtSQL) == 'object' || typeof(pValidArgs) == 'function') {                                // .(30328.02.3 Beg RAM Switch if object)
           fmtSQL      =  typeof(pValidArgs) != 'object' ? pValidArgs : ''
           pValidArgs  =  fmtSQL_ || { id : /[0-9]+/ }                                                      // .(30328.02.3 End)
           }
       if (typeof(pValidArgs) == 'string') { fmtSQL = pValidArgs; pValidArgs = { } }
//         console.log( `pValidArgs: ${ inspect( pValidArgs, { depth: 99 } ) }, fmtSQL: '${ inspect(fmtSQL, {depth:99})}'` )
           pValidArgs = (Object.keys( pValidArgs ).length > 0) ? pValidArgs : { id: /[0-9]+/ }              // .(30403.06.1 RAM Add default ?? )
  return { pValidArgs: pValidArgs, fmtSQL : fmtSQL }                                                        // .(30328.05.4 RAM Opps)
         }; // eof chkSQLArgs                                                                               // .(30328.05.2 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function fmtFld4SQL( aFld, aVal_, nFill ) {                                                               // .(30527.02.8 Beg RAM Write fmtFld4SQL)
        if (aFld == 'Id') { return null }                                                                   //#.(30525.03.12 RAM Was: MemberNo)
//          aFld =  `, ${aFld} ='${ pVars[ aFld ] }'`.padStart( 25 )                                        //#.(30525.02.3)
//          aFld =  `,  ${aFld.trim()} = '${ pVars[ aFld ].trim() }'`                                       // .(30525.02.3  RAM padStart: no workie)
       var  aVal =   aVal_.match( /^'/ )         ?  aVal_ : `'${ aVal_.replace( /'/g, "''" ) }'`            // .(30527.02.9  RAM No quotes   for leading, double'em otherwise)
            aVal =   aVal_.match( /^ *[0-9]+$/ ) ?  aVal_ : aVal                                            // .(30527.02.10  RAM No quotes   for a number )
            aVal =   aVal_.match( /^=/ )         ?  aVal_.substring(1) : aVal                               // .(30527.02.11 RAM No quotes   for leading =)
            aVal =   aVal_.match( /^#/ )         ? `STR_TO_DATE( '${ aVal_.substr(1) }', '%Y-%m-%d'          )` : aVal // .(30527.02.12 RAM A Date      for leading #)
            aVal =   aVal_.match( /^@/ )         ? `STR_TO_DATE( '${ aVal_.substr(1) }', '%Y-%m-%d %H:%i:%s' )` : aVal // .(30527.02.13 RAM A Timestamp for leading @)
            aFld =  `,  ${aFld.trim()} = ${ aVal.trim() }`
    return `${''.padEnd( nFill ? nFill : 25 )}${ aFld.trim() }`
            } // eof fmtFld4SQL                                                                             //#.(30527.02.8 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  saySQL( aSQL, nFill, aRecs ) {                                                                  // .(30528.01.4 RAM Add aRecs).(30328.04.3 Beg RAM Add)
       var  nSQL  = 'SQL';  aSQL = aSQL.replace( / [\/-]{2}.*/g, '' )                                       // .(30413.01.3 RAM Remove comments: // or --).(30515.03.1 RAM Only if prefixed by a space)
            aSQL  = aSQL.replace( /^[ \n]+/, "" ).replace( /[ \n]+$/, '' )                                  // .(30527.02.14 RAM Remove leading and trailing spaces or \n)
        if (aSQL.match( /^ *SQL[0-9]+/)) {
       var  nSQL  = aSQL.match( /^ *(SQL[0-9]+)/ )[1]
            aSQL  = aSQL.replace( new RegExp( `${nSQL}[ :\n]+` ), '' )
            }
        if (nFill == 'parse') { return aSQL }                                                               // .(30413.01.4 End)
       var  aTS   = (new Date).toISOString().replace( /[Z:-]/g, '' ).replace( /T/, '.' )                    // .(30528.01.5)
            aTS   = `${ aLogNo }${ aTS.substring(9) }`                                                      // .(30528.02.4 RAM Add '+' or '-' to aLogNo).(30528.01.6).(30527.04.4)
//     var  aFill = `\n`.padEnd( nFill ? nFill + 6 : 6 ); aSQL = aSQL.replace( /^ +/, "" )                  //#.(30402.05.22 RAM Remove leading spaces).(30528.01.7)
//          aFill =  aFill.replace( /\n/g, `\n${aTS}` )                                                     //#.(30528.01.7 RAM Add TS and aLogNo)
       var  aFill = `\n${ aTS.padEnd( aTS.length + 7 + (nFill ? nFill : 0) ) }`                             // .(30529.01.5).(30528.01.7 RAM Use only aLoNo and aTS plus 7 spaces)
//     var  aFill = `\n`.padEnd( nFill ? nFill + 6 : 5 ); aSQL = aSQL.replace( /^ +/, "" )                  //#.(30528.01.8 RAM Change nFill from 6 to 10).(30402.05.22 RAM Remove leading spaces)
//     var  aStr  = (aSQL || '').replace( /\n           /g, aFill ).replace( /^[\n]+/, '' ).replace( /[ \n]+$/, '' )
//          aStr  = (aSQL || '').replace( /^[\n]+/, '' ).replace( /[ \n]+$/, '' )                           //#.(30528.01.8 RAM  Add a space).(30528.01.9)
       var  aStr  =  aSQL.replace( new RegExp( '\n'.padEnd( 20 ), 'g' ), aFill )                            // .(30528.01.9 RAM New fill )
//  return `${aFill.substring(6)}${aStr}`                                                                   //#.(30413.01.5)
//          aSQL  = `${ nSQL + ( nSQL.match( /[0-9]/ ) ? '' : '1' )}: ${aFill.substring(6)}${aStr}`         //#.(30413.01.5).(30527.01.1 RAM Add '1' if not there).(30528.01.10)
            aSQL  = `${ nSQL + ( nSQL.match( /[0-9]/ ) ? '' : '1' ) }: ${aStr}`                             // .(30528.01.10).(30413.01.5).(30527.01.1 RAM Add '1' if not there)
            aSQL  =  aSQL.replace( / SELECT \*/, 'SELECT *' )                                               // .(30528.01.11 RAM Remote leading space for SELECT *)
            aRecs =  aRecs ? `${ aRecs.match( / NoData/i ) ? "  " + aRecs : aRecs }` : ''                   // .(30528.01.12)
    return  aSQL  + (aRecs ? `\n${aTS}${aRecs}` : '')                                                       // .(30528.01.13)
         }; // eof saySQL                                                                                   // .(30328.04.3 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  sndFile( pRes, aFile, aDatasetName, aOnRouteFnc ) {                                             // .(30403.04.1 Beg RAM Write function)
       try {
//                        pRes.sendFile( `${__dirname}/../../${aFile.replace( /^\.\//, '' )}` )
//                        pRes.sendFile( `/../../${aFile.replace( /^\.\//, '' )}` )
                          pRes.sendFile(  aFile.replace( /^\.\//, '' ), { root: __appDir } )                // .(30416.02.3).(30416.03.4 RAM Was: `${__dirname}/../../`)
                 sayMsg( `Handler,     '${aOnRouteFnc ? aOnRouteFnc :'routeHandler'}', executed`); // .(30526.01.11)
                 sayMsg( `File,       '${aFile}', sent` );
        } catch( pErr ) { aMsg = `File:       '${aFile}'\n  *** Error: ${pError.message}`                   // .(30526.01.12) 'Forbidden' not caught.
                 sayErr(  aMsg );
    return  `{ "error": ${aMsg} }` }
         }; // eof fmtJSON                                                                                  // .(30403.04.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  fmtJSON( pJSON, aSQL ) {
       try {
    return  JSON.stringify( pJSON )
        } catch( pError ) {
                 sayErr( `${ aSQL ? aSQL + '\n' : '' } *** Error:  ${pError.message}` );                    // .(30526.01.13)
    return                              `{ "error": \` *** Error:  ${pError.message}\` }`                   // .(30526.01.14)
            }
         }; // eof fmtJSON
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  sndJSON( pRes, aJSON, aDatasetName ) {

            pRes.setHeader( 'Content-Type', 'application/json' );

        if (typeof(aJSON) == 'object') { aJSON = JSON.stringify( aJSON ) }                                  // .(30424.09.x)
        
        // Ensure valid JSON format
        try {
            JSON.parse(aJSON); // Validate JSON
        } catch (e) {
            aJSON = JSON.stringify({ "error": "Invalid JSON response format" });
        }
        
            pRes.send(  aJSON )
            pRes.end();
        if (aJSON.match( /{ "error": /)) { return }
        if (aDatasetName) {
                 sayMsg( `JSON Object, '${aDatasetName.replace(/^\//, '')}', sent` ) }                      // .(30528.04.4 RAM No \n).(30526.01.15)

         }; // eof sndJSON
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  chkArgs( pReq, pRes, pValidArgs ) {
         if (Object.keys(  pReq.body).length == 0 && pReq.method != 'GET') {                                // .(30424.09.x RAM Beg)
                           sndErr( pRes,   '** Request Body/Query is empty' )                               // .(30526.01.16)
                           sayErr(       '  ** Request Body/Query is empty\n' )                             // .(30402.05.7).(30526.01.17)
    return  null
            }                                                                                               // .(30429.09.x End)
       var  pArgs_ = { ...pReq.body, ...pReq.query }, mErrArgs = []                                         // .(30403.02.3 RAM pReq.query overrides pReq.body)
       if (!pValidArgs) {
    return  pArgs // pReq.query                                                                             // .(30318.01.1 RAM S.It.B {} ??).(30403.02.4)
       } else {
//     var  mArgs      =  Object.keys( pReq.query ).map( aKey => { return [ aKey, pReq.query[aKey] ] } )    //#.(30403.02.5)
       var  pArgs = {};   Object.keys( pArgs_ ).map( aKey => { pArgs[ aKey.trim() ] = pArgs_[aKey].trim()}) // .(30403.07.1 RAM Trim pArgs).(30424.09.x pArgs S.b. {}, not [] )

       var  mArgs      =  Object.keys( pArgs  ).map( aKey => { return [ aKey, pArgs[aKey]      ] } )        // .(30403.02.5)
        if (mArgs.length > 0) {
            mErrArgs   =  mArgs.filter( chkArg )
        } else {
            mErrArgs   =  pValidArgs.required ? [ [ 'Required', 'yes' ] ] : [ ]                             // .(30403.02.5 RAM Are any args required? What if not. fmtSQL must handle it)
         }  }
        if (mErrArgs.length == 0) {
    return  pArgs                   // pReq.query; all? or nothing; could be {} if no args given                           // .(30403.02.6)
            }
                          sndErr( pRes, `  ** Invalid Arguments`,    mErrArgs.map( mArg => fmtArg( mArg ) ) )              // .(30425.01.1 RAM Add fmtArg).(30526.01.18)
       var  aMsg       =                `  ** Invalid Arguments: '${ mErrArgs.map( mArg => fmtArg( mArg ) ).join(", ") }'` // .(30402.05.6).(30425.01.2).(30526.01.19)
//                        sayErr( `${aMsg}` ); sayMsg( 'Done', fncName(3) )                                 //#.(30529.01.6 RAM No \n, call sayMsg( 'Done', '') instead).(30402.05.7)
                          sayMsg( 'Abort', aMsg, fncName(3) )                                               // .(30529.01.6 RAM Call sayMsg( 'Abort' ) instead).(30402.05.7)
    return  null
//          ----------------------------------

  function  fmtArg( mArg ) {                                                                                // .(30425.01.3 RAM Beg Write fmtArg)
            mArg[1] = `"${mArg[1]}"`
    return  mArg.join(' = ')
            }                                                                                               // .(30425.01.3 End)

  function  chkArg( mArg ) {
       var  rTestVals  =  pValidArgs[ mArg[0] ], bOk = false                                                // .(30403.07.1 RAM Add trim)
        if (rTestVals !=  null) {
       var  bOk        =  rTestVals.test( mArg[1] )                                                         // .(30403.07.2)
            pReq.query[   mArg[0].toLowerCase() ] =  mArg[1]                                                // .(30403.07.3).(30328.04.1 RAM Put bak in to pReq.query??)
            }
    return  bOk ? false : true

            } // eof chkArg
//          ----------------------------------
         }; // eof chkArgs
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  fmtArgs( pArgs ) {
       var  mArgs =  Object.keys( pArgs ).map( aKey => { return [ aKey, pArgs[ aKey ] ] } )
       var  aArgs = (mArgs.length == 0) ? '' : '/' + mArgs.map( mArg => mArg.join('=') ).join()
    return  aArgs

         }; // eof fmtArgs
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

//function  sndHTML( pRes, aHTML, aURI, aOnRouteFnc ) { ... }                                               //#.(30528.05.2)
  function  sndHTML( pRes, aHTML, aURI ) {                                                                  // .(30528.05.2 RAM Remove Handler)(30331.01.4)
//               sayMsg( `Handler,     '${aOnRouteFnc ? aOnRouteFnc : 'onRoute'}', executed` );             // .(30528.04.5 RAM Let sayMsg( 'Done') doit).(30331.01.6).(30526.01.20)
                          pRes.send( aHTML )
        if (typeof(aURI) != 'undefined') {                                                                  // .(30414.03.1).(30415.02.1)
                          sayMsg( `HTML Page,  '${aAPI_Host}${aURI}', sent` ) }                             // .(30528.04.6 RAM No \n).(30415.03.1).(30526.01.21)

         }; // eof sndHTML
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  setErr( pApp, aMsg, s ) {

       // Handle root path requests
/*       pApp.get( '/', function( pReq, pRes ) {
                          pRes.redirect( '/api2' )
            } )
*/
       pApp.use( '*', function( pReq, pRes ) {
                          console.log( `DEBUG: Catch-all route hit for: ${pReq.method} ${pReq.url}` )      // DEBUG: Add logging
                          var errorResponse = { error: `${aMsg}: ${pReq.url}` };
                          pRes.setHeader( 'Content-Type', 'application/json' );
                          pRes.send( JSON.stringify(errorResponse) );
                          sayErr(        `${aMsg}: '${ pReq.url }'\n` )                                    // .(30402.05.8 RAM Add).(30414.02.1 RAM Changed from baseUrl to url)
            } )
                          sayMsg( `${aMsg}${ s || '' }, set` )
         }; // eof setErr
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  sndErr( pRes, aMsg, mItems ) {
       var  aItems     =  mItems ? ( mItems.length > 0 ? `, ${ mItems.join( ', ') }`  : "") : ""; aMsg = aMsg.replace( /[: ]$/, "" )  // .(30511.02.6 RAM ?? Trailing :)
       
       // Always return JSON format for API responses
       pRes.setHeader( 'Content-Type', 'application/json' );
       var errorResponse = { error: `${aMsg}${aItems ? ': ' + aItems.substring(2) : ''}` };
       pRes.send( JSON.stringify(errorResponse) );
       pRes.end();
         }; // eof sndErr
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+
/*
  function  sayErr( aMsg ) {                                                                                //#.(30417.03.4)

        var aTS       =  (new Date).toISOString().replace( /[Z:-]/g, '' ).replace( /T/, '.' ).substring(2)
        var aCR        =  aMsg.match( /^[ \n]+/ ) ? "\n" : ""; aMsg = aMsg.replace( /^[\n]+/, "" )          // .(30416.01.1)
            console.log( `${aCR}${aTS}  ${aMsg}` )
//          console.trace()                                                        // .(30416.01.2)

         }; // eof sayErr
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+
*/
  function  getIPAddr( pReq, pDB ) {                                                                        // .(30526.02.1 RAM Beg Add getIPAddr)
//               sayMsg( `IPAddr is: ${pReq.ip}` )

       var  aIPAddr4   =  pReq.ip ? pReq.ip : (pReq.ips && pReq.ips[0]) || '::1'
       var  mIPs       = (pReq.headers['formr-userip'   ] ||
                          pReq.headers['x-real-ip'      ] ||
                          pReq.headers['x-forwarded-for'] ||
                          pReq.connection.remoteAddress   || ''    // aka pReq.ip
                          ).split(',');
       var  aIPAddr4   =  mIPs[0].trim();                        // .(30428.03.1 RAM Missing pReq.ip)
            aIPAddr4   =  aIPAddr4.replace( /::1/, '127.0.0.1' ).replace( /^::ffff:/, '')                   // .(30406.03.1)

       var  aPage      = (pReq.headers['formr-page'] || pReq.get('Referrer') || '').split(",")[0].trim()
       var  aUser      =  pReq.headers['formr-user'] || ''

   return [ aIPAddr4, aPage, aUser ]                                                                        // .(30526.02.16)
            }                                                                                               // .(30526.02.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  logIP( pReq, pDB, aWhen ) {                                                                     // .(30526.02.2 Beg RAM Add logIP)
       var  aIP        =  getIPAddr( pReq );
       var  aUser      =  aIP[2], aPage = aIP[1]; aIP = aIP[0]                                              // .(30526.02.17 RAM Get aUser and Page too)
       var  aUWT       =  pReq.method == 'GET' ? "-" : "+"                                                  // .(30528.02.5 RAM Unit of Work type)
       if (!mIPs[ aIP ]) {                                                                                  // .(30527.04.5 RAM Beg )
       var  aLogNo     = (Object.keys( mIPs ).length + 1).toString().padStart( 5, '0' ) + aUWT              // .(30528.02.6)
       var  aTS        = (new Date).toISOString().replace( /[Z:-]/g, '' ).replace( /T/, '.' )
       var  aUser      =  aUser.padEnd(30)
            mIPs[ aIP ]= `${aLogNo}${aTS.substring(2,8)} ${aIP.padStart(15)}    ${aUser} ${aPage}`          // .(30528.02.7).(30527.04.6 RAM Put aLogNo aTS aIP aUser into mIPs)
            }
            aLogNo     =  mIPs[ aIP ].substring(0,6)                                                        // .(30528.02.8 RAM Was 5)
        if (process) { global.aLogNo = aLogNo } else { window.aLogNo = aLogNo }                             // .(30527.04.5 End)
            console.log( mIPs[ aIP ] )                                                                      // .(30527.04.7)
            }                                                                                               // .(30526.02.2 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  async function  shell( aCmd, aQuiet ) {                                                                   // .(50707.03.1).(50703.02.2 RAM Write Shell Beg)
    // Dynamically import modules
    const { exec }      = await import('child_process');
    const { promisify } = await import('util');
    const { platform }  = await import('os');

    const execPromise = promisify(exec);

    const platformValue = platform();
    let shellCommand;

    switch (platformValue) {
        case 'win32': // Windows (including Git Bash)
            shellCommand = `cmd.exe /c ${aCmd}`;
            break;
        case 'darwin': // macOS
        case 'linux':  // Ubuntu
            shellCommand = aCmd;
            break;
        default:
            throw new Error('Unsupported platform');
            }
    try {
        const { stdout, stderr } = await execPromise(shellCommand);
        if (stderr) {  
        if (aQuiet.match( /quiet/i) == null) {                                                              // .(50707.03.2 RAM Don't print error)
            console.error(`Stderr: ${stderr}`);
            }                                                                                               // .(50707.03.3)
            return { stderr: stderr }                                                                       // .(50707.03.4)
            }
//      console.log(`Output: ${stdout}`);
        return { stdout, stderr };
    } catch (error) {
        if (aQuiet.match( /quiet/i) == null) {                                                              // .(50707.03.5 RAM Don't print this error either)
            console.error(`Error: ${error.message}`);
            throw error;
            }                                                                                               // .(50707.03.6)
            return { stderr: error.message }                                                                // .(50707.03.7)
            }
    }                                                                                                       // .(50703.02.2 End)
// -----------------------------------------------------------------------

  function  sayMsg( pReq, aMethod_, aRoute, aWhen ) {
//      if (bQuiet) { return }                                                                              // .(30529.02.2)
            aRoute     =  aRoute ? aRoute : aMethod_                                                        // .(50707.01.1 RAM Geez Louis is right!, Move to here).(30528.04.13 RAM Geez Louise)

       var  aMsg       = (typeof(aMethod_) != 'undefined') ? aMethod_ : pReq                                // .(30528.04.7)
       var  aEndMsg    = ''
//      if (typeof(aRoute) == 'undefined') { aRoute = aMethod; aMethod = pReq; pReq = null }                //#.(30528.04.8).(30414.03.3 RAM It could be '').(30415.02.2)
//      if (typeof(pReq) == 'object') {                                                                     //#.(30528.04.8).(30414.03.3 RAM It could be '').(30415.02.2)
//          aRoute     =  aMethod_; aMethod = 'set'; pReq = 'set';                                          //#.(30528.04.8)
//          }                                                                                               //#.(30528.04.8)
//      if (pReq) {                                                                                         //#.(30528.04.8)
        if (typeof(pReq) == 'string') {                                                                     // .(30528.04.8)

       var  aMethod    =  pReq.trim().substring(0,6).toLowerCase()                                          // .(30528.04.9)
     switch(aMethod) {                                                                                      // .(30528.04.10 RAM Beg Use switch stateement)

      case 'use':                                                                                           // .(30528.04.11 RAM Use Database)
            aMsg       = `USE  ${aMsg}`; break                                                              // .(30529.02.3)

//    case 'set':                                                                                           //#.(30528.04.12)
//          aMsg       = `${aMsg}', set`; break                                                             //#.(30528.04.12 RAM For inital route set only)

      case 'get':
      case 'post':
      case 'put':
      case 'delete':
//          aRoute     =  aRoute ? aRoute : aMethod_                                                        //#.(50707.01.1 Ram Geez Louis is right!).(30528.04.13 RAM Geez Louise)
//          aMsg       = `${ aMethod.toUpperCase().padEnd(4) } Route, '${aAPI_Host}${aRoute}, set`; break   //#.(50707.01.2).(30414.02.x RAM Don't Add aAPI_Host).(30415.03.2).(30526.01.22 RAM Pad method)
            aMsg       = `${ aMethod.toUpperCase().padEnd(4) } Route, '${aRoute}', set`; break              // .(50707.01.2).(30414.02.x).(30415.03.2).(30526.01.22 RAM Pad method)

      case 'abort':                                                                                         //#.(30528.04.14 RAM Abort.  What about sayErr)
//          aMsg       = `${aMsg}'                                                                          // .(30528.04.14 RAM The reason why)
       var  aHandler   =  aRoute
            aEndMsg    = `Handler      '${ aHandler ? aHandler :'routeHandler'}', aborted\n`;  break

      case 'done':                                                                                          // .(30528.04.15 RAM In case sndJSON or sndHTML didn't do it)
       var  aHandler   =  aRoute ? aRoute : aMsg                                                            // .(30528.04.16 RAM Geez Louise)
            aMsg       = `Handler      '${ aHandler ? aHandler :'routeHandler'}', executed\n`; break        // .(30528.04.17 RAM Send the Carriage Return)

      case 'end':                                                                                           // .(30528.04.18 RAM Last resort, for sndRecs)
//          aMsg       = `\n`; break
            console.log( "" ); return;

      default:
//          aMsg       = `${aMsg}'
            }                                                                                               // .(30528.04.19 End pReq == string)

        if (bQuiet) { return }                                                                              // .(30529.02.2 RAM Moved to here)
/*
       var  aMsg       = `${ aMethod.toUpperCase().padEnd(4) } Route, '${aRoute}'`                          //#.(30528.04.20).(30415.03.3 RAM aRoute, set has ${aAPI_Host}).(30526.01.23)
            aMsg       =  typeof(aRoute) == 'undefined' ? aMsg1 : `${aMsg}', set`                           //#.(30528.04.20 RAM Use aMsg1).(30414.03.1 RAM aMethod == aMsg if aRoute is not defined)
*/
        } else {
            pReq.args  =  fmtArgs( pReq.query )                                                             // .(30528.04.21 RAM For Excuted Route).(30414.03.3 RAM save for ending sayMsg)
       var  aMsg       = `${ aMethod_.toUpperCase().padEnd(4) } Route, '${aAPI_Host}${aRoute}`              // .(30528.04.22 RAM Use aMethod_).(30415.03.2).(30526.01.22 RAM Pad method)
            aMsg       = `${ aMsg }${ pReq.args }', recieved`

            } // eif typeof(pReq) != 'string'

        var aTS        = (new Date).toISOString().replace( /[Z:-]/g, '' ).replace( /T/, '.' )
            aTS        = `${ aLogNo }${ aTS.substring(9) }`                                                 // .(30528.02.9 RAM Add '+' or '-' to aLogNo).(30527.04.4)
        var aCR        =  aMsg.match( /^[\n]+/ ) ? "\n" : ""; aMsg = aMsg.replace( /^[\n]+/, "" )           // .(30528.04.23 RAM Ignore leading space: /^[ \n]+/).(30416.01.3)

            console.log( `${ aCR }${ aTS }  ${ aMsg }` )                                                    // .(30416.01.4)
        if (aEndMsg) {                                                                                      // .(30528.04.24)
            console.log( `${ aTS.replace( /[+-]/, "*" ) }  ${ aEndMsg }` )                                  // .(30528.04.25
            }                                                                                               // .(30528.04.26)
         }; // eof sayMsg
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  indexObj( pObj, mItems ) {                                                                      // .(30402.03.1 Beg RAM Add)
//      var pOut = {}, i, n = Array.isArray( mItems ) ? mItems.length : 0; if (!n) { return pObj }
       if (!Array.isArray( mItems )) { return pObj }; var pOut = {}, n = mItems.length, i
       for (i = 0; i < n; i++) { pOut[ mItems[i] ] = pObj[ mItems[i] ]; }
    return  pOut;

         }; // eof indexObj                                                                                 // .(30402.03.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

  function  fncName( n ) {                                                                                  // .(30529.01.7 Beg RAM Write fncName)
       var  mStack = (new Error).stack.split("\n"); // console.log(mStack)
//     var  aRow   =  mStack[ n ? n : 2 ] || ''
       var  mFName = (mStack[ n ? n : 1] || '').match( /at (.+) \(/ )
    return  mFName ?  mFName[1] : ""
        }                                                                                                   // .(30529.01.7 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

   function init( pApp, pDB_Config, bQuiet_, aAPI_, nPort ) {                                                      // .(30410.03.3 RAM async).(30412.02.1)
// function init( pApp, pDB_Config, bQuiet_, aAPI_) {                                                      // .(30410.03.3 RAM async).(30412.02.1)

            // CORS handled in main server file
            pApp.use( express.urlencoded( { extended: true  } ) )                                           // .(30403.02.2 RAM Needed for form body vars)
//          pApp.use( express.urlencoded( { extended: false } ) )                                           // .(30424.09.1 RAM Set to false)
            pApp.use( express.json() );                                                                     // .(30424.09.2 RAM Instead of bodyParser.json() )

//          ---------  =  ----------------------------------------------------------

       var  aEnv_File  =  `${__appDir.replace('/api', '')}/.env`; // Correct path to .env file             // .(30322.03.1 Beg RAM Set different var).(30416.03.5)
            console.log( `formr_server-fns aEnv_File: '${aEnv_File }'`)

//          process.env=  await getEnv( `${aEnv_Dir}/.env` )                                                // .(30222.01.2 RAM Get it myself).(30322.03.1 End).(30410.03.4 RAM await)
            process.env=  getEnv_sync(  aEnv_File ); var pEnv = process.env                                 // .(30222.01.2 RAM Get it myself).(30322.03.1 End).(30412.01.9 RAM no await)

            bQuiet     =  setVar1( 'Quiet', bQuiet_, true )   // Override value in .env
            bQuiet     =  bQuiet ?  true :  false;            // console.log( `bQuiet:        ${bQuiet}`   );  process.exit()
//                                     
                          setVar2( 'DB_Host',     'localhost'   , 'host' )                                  // .(5070708.01.RAM Set from process.env or default. Look in pDB_Config too)
                          setVar2( 'DB_User',     'nimdas'      , 'user' )
                          setVar2( 'DB_Password', 'FormR!1234'  , 'password' )
                          setVar2( 'DB_Database', 'iodd'        , 'database' )                              // .(30320.06.1 RAM Opps )

                         console.log( `pDB_Config.host:     ${pDB_Config.host}` )
                         console.log( `pDB_Config.user:     ${pDB_Config.user}` )
                         console.log( `pDB_Config.password: ${pDB_Config.password}` )
                         console.log( `pDB_Config.database: ${pDB_Config.database}` )

//          pDB  =  await mysql.createPool( pDB_Config ? pDB_Config : pDB_Config )
       var  pDB        =  mysql.createPool( pDB_Config )                                                    //

                          console.log( "" )
                          sayMsg( 'USE', `Database: '${ pDB_Config.database }'` )                           // .(30528.04.27 RAM Add Use too).(30323.03.1).(30526.01.24)

//          ---------  =  ----------------------------------------------------------

       var  aHostLocation =  process.env.Host_Location  || 'Remote'                                           // .(50703.01.1
//          console.log( `HostLocation2: '${aHostLocation}'`)
//     var  aRemote_Host= process.env.Remote_Host]                                                          //#.(30322.03.2 RAM I-Yi-Yai?).(30410.03.8).(50703.01.2)
       var  aRemote_Host  =  process.env[`${aHostLocation}_Host`]                                              // .(50703.01.2).(30322.03.2 RAM I-Yi-Yai?).(30410.03.8)
//     var  aAPI_Host  =  process.env.API_Host                                                              //# .(30412.02.8 RAM Or aAPI_URL).(50703.01.3)
       var  aAPI_URL      =  process.env[`${aHostLocation}_API_URL`]                                           // .(50703.01.3).(30412.02.8 RAM Or aAPI_URL)
            aAPI_URL      =  aAPI_URL.replace( /{PORT}/, nPort )

//     var  aAPI_Host     =  `${aRemote_Host}${aAPI_URL}`                                                       //#.(50703.01.x RAM It's global)
//          aAPI_Host     =  `${aRemote_Host}${aAPI_URL}`                                                       //#.(50703.01.x RAM It's global)
       var  aAPI_Host     =  aAPI_URL                                                                           //#.(50703.01.x RAM It's really the API_URL path only).(50703.01.x RAM It's global)
//   global.aAPI_Host     =  aAPI_URL                                                                           // .(50703.01.x RAM It's really the API_URL path only).(50703.01.x RAM It's global)
//          console.log( `aRemote_Host: '${aRemote_Host}'`)
//          console.log( `aAPI_Host: '${aAPI_Host}'`)

       pEnv.API_URL       =  aAPI_ ? aAPI_ : pEnv.API_URL;                                                     // .(30412.02.2)

//     var  aAPI_URL   =  setVar1( 'API_URL',     '/api2' );// console.log( `aAPI_URL:     '${aAPI_URL}'`); //#.(30410.03.5)process.exit() //
//     var  aAPI_URL   =  await setAPI_URL( process.env )                                                   //#.(30410.04.2 Use it).(30410.04.9 RAM Add pEnv arg)
//     var  aAPI_URL   =        setAPI_URL( process.env )                                                   //#.(30410.04.2 Use it).(30410.04.9 RAM Add pEnv arg).(30412.02.3 RAM Can't be a promise)

   //  var  aAPI_URL   = `${pEnv.Host_Location == 'remote'                                                  //#.(30412.02.4)
   //                  ? `/${pEnv.API_URL.replace( /^\//, '' )}`
   //                  : `${pEnv.Local_Host}:${pEnv.Server_Port}` }`

//          console.log( `aAPI: ${aAPI}, argv0: '${process.argv[1]}'`);

                          setVar1( 'Server_Port',  3000 )                        // console.log( `Server_Port:  '${process.env.Server_Port}'` ); // Look in process.env only
                          setVar1( 'Remote_Host', 'https:/iodd.com'  );          // console.log( `aRemote_Host: '${aRemote_Host}'` ); //#.(30322.03.2 RAM I-Yi-Yai?).(30410.03.6 RAM Just set it)
//          aAPI_Host  = (aOS != 'windows'              ) ? aAPI_URL : ''        // console.log( `aAPI_Host:    '${aAPI_Host}'`    ); //#.(30322.03.3 RAM Make it global)
   //       aAPI_Host  = (pEnv.Host_Location == 'remote') ? aAPI_URL : ''                                                             // .(30412.02.5)
//          aAPI_Host  =  aAPI_ ? `/${aAPI_.replace( /^\//, '' )}` : aAPI_URL;   // console.log( `aAPI_Host:    '${aAPI_Host}'`    ); //#.(30410.03.7 RAM ??? ).(30412.02.5)

   //       process.env.API_Host = aAPI_Host                                                                           // .(30412.02.6).(50703.01.x)
            process.env.API_Host = aAPI_URL                                                                            // .(50703.01.x).(30412.02.6)

//          ---------  =  ----------------------------------------------------------

       return { pDB_: pDB, aAPI_Host_: aAPI_Host, bQuiet_: bQuiet }                                         // .(30322.03.4

   function setVar2( aVar2, aVal,   aVar1 ) { //  aVar2 in process.env, aVar1 in pDB_Config
            aVar1 = aVar1 ? aVar1 : aVar2     // .toUpperCase(); // case is important
            pDB_Config[aVar1] = typeof(pDB_Config[ aVar1 ]) != 'undefined' ? pDB_Config[ aVar1 ]  : process.env[aVar2]  // .(30323.05.1 RAM pDB_Config, set in code, takes precedence)
            pDB_Config[aVar1] = typeof(pDB_Config[ aVar1 ]) != 'undefined' ? pDB_Config[ aVar1 ]  : ( typeof( aVal ) != 'undefined' ? aVal : null )  // .(30322.06.1)
     return pDB_Config[aVar1]
            }

   function setVar1( aVar2, aVal, bSw) {
        if (bSw) { return typeof(aVal) != 'undefined' ? aVal : process.env[aVar2] || '' }
     return typeof(process.env[aVar2]) != 'undefined' ? process.env[aVar2] : ( typeof( aVal ) != 'undefined' ? aVal : null )  // .(30322.06.2)
            }
         }; // eof init
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

function onStart(__filepath, nPort) {                                                                       // .(51130.03.1)
   var  aHostLocation =  process.env.Host_Location  || 'Remote'                                             // .(50703.01.1

  if (aAPI_Host === '' || aHostLocation == "Local") {                                                       // .(51130.03.2 RAM Really)
    console.log(`\n      Server is running at: http://localhost:${nPort}`);
  } else {
if (aAPI_Host.match( /:/)) {                                                                                // .(50708.01.1 RAM Again)
    console.log(`\n      Server is running at: ${aAPI_Host}`);
} else {                                                                                                    // .(50708.01.1 RAM Again)
    console.log(`\n      Server is running at: ${global.aRemote_Host}${aAPI_Host}`);                        // .(50708.01.1 RAM Again)
    }                                                                                                       // .(50708.01.1 RAM Again)
  }

  __filepath = `${__dirname.replace(/assets\/mjs\/*/, '')}${__filepath}`;
  console.log(`      Server is running in: ${__filepath}\n`);

  const bLocal = aHostLocation.match(/local/i) !== null;
  let aLocation = '';
  if (aOS === 'windows' && !bLocal) aLocation = 'local';
  if (aOS === 'linux' && bLocal) aLocation = 'remote';
  // macOS (darwin) can run either local or remote without warnings
  if (aLocation) {
    console.log(`*** Server is running in ${aOS}. Should the .env.Host_Location be set to: ${aLocation}?\n`);
  }
}

function killPort(nPort) {
  return killport(nPort)
    .then(() => {
      console.log(`Process on port ${nPort} killed. Retrying...`);
      // Return a Promise for the retry
      return new Promise((resolve) => {
        setTimeout(() => {
          pApp.listen(nPort, () => {
            const __filepath = new Error().stack.match(/IODD-Server_u.+\.mjs/)[0];
            onStart(__filepath, nPort);                                                                     // .(51130.03.3)
            resolve();
          }).on('error', (pErr) => {
            console.log('Retry failed:', pErr);
            resolve(); // Resolve even on error to avoid hanging
          });
        }, 1000);
      });
    })
    .catch((killErr) => {
      console.log('Failed to kill process on port', nPort, killErr);
      process.exit(1);
    });
}

function startServer( pApp, port, __filepath) {
  pApp.listen(port, () => {
    
    onStart(__filepath, port);                                                                              // .(51130.03.4)

  }).on('error', (pErr) => {
    if (pErr.code === 'EADDRINUSE') {
      console.log('\n----- error: Port', port, 'is in use');
      console.log(pErr);

      killPort(port)
        .then(() => {
          console.log('Retry sequence completed');
        })
        .catch(() => {
          // Already handled by killPort's exit
        });
    } else {
      console.log('Unexpected error:', pErr);
      process.exit(1);
    }
  });
}
// function start( pApp, nPort, aAPI_Host ) {     // must be last                                           // .(50703.01.1 RAM True aAPI_Host is needed for the routes)
   function start( pApp, nPort            ) {                                                               // .(30412.02.7 RAM Remove aAPI_Host)

//     var  nPort      =  nPort ? nPort : process.env.Server_Port                                           // .(30312.02.1 RAM Set nPort for FRApps/server3/s36_mysql-data-api ).(50703.03.1)
//     var  aHostLocation =  process.env.Host_Location  || 'Remote'                                           // .(50703.01.1
// console.log( `HostLocation: '${aHostLocation}'`)
//     var  aRemote_Host= process.env.Remote_Host]                                                          //#.(30322.03.2 RAM I-Yi-Yai?).(30410.03.8).(50703.01.2)
//     var  aRemote_Host  =  process.env[`${aHostLocation}_Host`]                                              // .(50703.01.2).(30322.03.2 RAM I-Yi-Yai?).(30410.03.8)
//     var  aAPI_Host  =  process.env.API_Host                                                              //# .(30412.02.8 RAM Or aAPI_URL).(50703.01.3)
//     var  aAPI_URL      =  process.env[`${aHostLocation}_API_URL`]                                           // .(50703.01.3).(30412.02.8 RAM Or aAPI_URL)
//          aAPI_URL      =  aAPI_URL.replace( /{PORT}/, nPort )
//     var  aAPI_Host  =  `${aRemote_Host}${aAPI_URL}`
// console.log( `aRemote_Host: '${aRemote_Host}'`)
// console.log( `aAPI_Host: '${aAPI_Host}'`)
//          pApp.get(    '/favicon.*', function( pReq, pRes ) {                                             //#.(50628.01.1)
//          pApp.get(    '/favicon.:*', function( pReq, pRes ) {                                            //#.(50628.01.1 RAM Good grief: needs a : for a "named parameter ")
            pApp.get(    '/favicon.png', function( pReq, pRes ) {                                           // .(50628.01.1 RAM Good grief: needs a : for a "named parameter ")
                          pRes.sendFile( `${__dirname}/${pReq.url}` )                                       // .(30318.01.1 RAM Or else it's a bad route)
                          } )
                 setErr(  pApp, 'Bad  Route', 's' ) // Other Uses?                                          // .(30526.01.25)

     const __filepath = new Error().stack.match(/IODD-Server_u.+\.mjs/)[0];    

            pApp.listen( nPort ); onStart( __filepath, nPort );                                             // .(51130.03.5)
//          startServer( pApp, nPort, __filepath )    
                        }                 
//function  getEnv( aFile, bNewOnly ) {                                                                     //#.(30410.02.2 moved to formr_utility-fns_u1.06.mjs)

//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+
/*
async  function  readFile( aFile, bJSON ) {
       var  bNode = (typeof(process) != 'undefined')

        if (bNode) {   // in NodeJS
        if (aFile.match( /^(http|local|127)/ )) {
       var  pResponse  = await node_fetch( `${aFile}` );
    return  await (bJSON ? pResponse.json() : pResponse.text() )
        } else {       // eif remote file
       var  aResponse  =  node_readFile( `${__dirname }${aFile}`, 'ASCII' );
    return (bJSON ? aResponse : JSON.parse( aResponse )
            }          // eif local file

        } else {       // in browser
       var  aPath      =  window.location.href.replace( /[^\/]+$/, '')
       var  pResponse  =  await node_fetch( `${aPath}${aFile}` );
    return  await (bJSON ? pResponse.json() : pResponse.text() )
            }
//  ------  ------------------  =   -------------------------------- ------------------ ------------------+
*/

 // browser:  var  aJSON  =  await (await fetch(         `localhost:3000/${aPath}${aFile}`      )).response.json();
 // browser:  var  aText  =  await (await fetch(         `host.domain.tld:3000${aPath}${aFile}` )).response.text();
 // Node:     var  aText  =  await (await node_fetch(    `localhost:3000/${aPath}${aFile}``     )).response.text();
 // Node:     var  aText  =  await (await node_fetch(    `host.domain.tld:3000${aPath}${aFile}` )).response.text();
 // Node:     var  aText  =               node_readFile( `${aPath}${aFile}` )

//  async function fetchJSON( aURL ) {                                                  //#.(30402.01.1)
    async function fetchFile( aURL, bJSON ) {                                           // .(30402.01.1 RAM Rename and add bJSON)
//           if (typeof(document) != 'object' && aURL.match( /http/i )) {
//          var  fetch3         = (...args) => import( 'node-fetch-v3' ).then( ( { default: fetch } ) => fetch( ...args ) );
//          var  fetch3         =             require( 'node-fetch-v2' );
//               }
//               browser   ./assets        fetch
//               browser    http://        fetch
//               node      ./assets        fs/promises
//               node       http://        node-fetch-v3

//       ------  -------------  =  ----------------------------------------

        if (typeof( document ) == 'object') {   // browser
            try {
            var  pResponse      =  await  fetch( aURL )
             } catch( pErr ) {     return onError( pErrr, pResponse ) }
/*          var  pResponse      =  await fetch( aURL, {
                     mode       : 'no-cors',
                     method     : "get"
                     } ) */
        } else { // ----------  =  --------------------------------

             if (aURL.match( /^(http|localhost|127\.0)/i )) {     // node http://       // .(30402.01.2 RAM Add localhost and 127.0.0.1)
            try {
            var  fetch3         =  typeof( fetch )  != 'undefined' ? fetch
                                : (...args) => import( 'node-fetch-v3' ).then( ( { default: fetch } ) => fetch( ...args ) );
            var  pResponse      =  await  fetch3( aURL )
             } catch( pErr ) {     return onError( pErrr, pResponse ) }
                 }
              }
//         ----  -------------  =  --------------------------------
//       ------  -------------  =  ----------------------------------------

//    if (typeof( document ) == 'object' || aURL.match( /http/i )) {
        if (pResponse) {                          // browser  or  node http://

        if (bJSON) {                                                                    // .(30402.01.3 RAM)
      try {
            var  pJSON          =  await pResponse.json( )
        } catch( pErr ) {          return onError( pErr, pResponse ) }

        } else {
            var  pJSON          =  { }; pJSON.text = await pResponse.text( )
                 } // eif text
//         ----  -------------  =  --------------------------------
         return  pJSON
//       ------  -------------  =  ----------------------------------------

        } else { // ----------  =  ----------   // node local file

            var  pFS            =  await import( 'fs/promises' )
//          var  aJSON          =  await pFS.readFile( aURL, 'ASCII' )
//          var  pJSON          =  JSON.parse( aJSON )
//          var  pJSON          =  JSON.parse( '{}' )
//          var  pJSON          =  JSON.parse( await pFS.readFile( new URL( aURL, import.meta.url) ) )
            var  aFile          =  aURL.match( /^(C:)*[/\\]/) ? aURL : `${__dirname}/${aURL}`
                 aFile          =  aFile.replace(   /\/\.\//, '/' )
//          var  aJSON          =  pFS.readFileSync( `${aFile}`, "ASCII" )
//          var  aJSON          =  pFS.readFileSync( `${aFile}`, "UTF8"  )
            try {
            var  aText          =  await pFS.readFile( aFile, "UTF8" )
             if (pJSON) {
            var  pJSON          =  JSON.parse( aText )
             } else {
//               pJSON     =  {};  pJSON.text = aText
            var  pJSON          =     { text:  aText }
                 }
             } catch( pErr ) {     return onError( pErr, { status: 404, url: aFile } ) }

//         ----  -------------  =  --------------------------------
         return  pJSON
//       ------  -------------  =  ----------------------------------------
                 } // eif Node && local file
//--------  ---- -------------  =  ---------------------------------------------------

  function  onError( pErr, pResponse ) {
             if (pResponse && pResponse.status == 404) {
                 pErr.message   =  `Bad URL: '${pResponse.url}'`
                 }
                 console.trace();  traceR( 'onError[1]', `*** Invalid JSON file.\n    Error: ${pErr.message}`, 1 )
                                   sayErr(    `*** Invalid JSON file.${ `\nError: ${ pErr.message }`.replace( /\n/g, `${'\n'.padEnd( 20 )}*** ` ) }` )
          return pJSON          = { "error": ` *** Invalid JSON file. Error: ${pErr.message}` }
                 }
//       ------  -------------  =  ----------------------------------------
         }; // eof fetchFile                                                                                // .(30402.01.1 End)
//  ------  ---- ----- =  ------|  -------------------------------- ------------------- ------------------+

    export { putData, getData,   sndRecs,  fmtJSON,  sndJSON,  chkArgs,  fmtArgs }                          // .(30403.05.2 RAM Add putData)
    export { sndHTML, sndErr,    setErr,   setRoute, sayMsg,   init,     start,      traceR }               // .(30328.03.2).(30416.02.4 RAM Add traceR)
    export { getHTML, getStyles, getJSON,  sndFile,  indexObj, chkSQL, __dirname , __appDir }               // .(30402.02.4 RAM).(30402.03.2).(30403.04.1).(30403.06.5).(30410.01.x).(30416.03.6)
    export { getIPAddr,  logIP,  fmtFld4SQL, shell }                                                        // .(50703.02.3).(30526.02.3).(30527.02.15)

//  --------------------------  |  -------------------------------- ------------------- ------------------+ --------------------------
