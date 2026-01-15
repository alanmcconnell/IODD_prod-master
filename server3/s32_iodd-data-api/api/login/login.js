/*\
##=========+====================+================================================+
##RD            login.js        | IODD Login script
##RFILE    +====================+=======+===============+======+=================+
##FD            login_u1.02.js |   2925|  3/12/23 12:08|    65| u1.02-30330.1200
##DESC     .--------------------+-------+---------------+------+-----------------+
#           This Javascript file modifies the Login Button
##LIC      .--------------------+----------------------------------------------+
#           Copyright (c) 2023 8020Data-formR * Released under
#           MIT License: http://www.opensource.org/licenses/mit-license.php
##FNCS     .--------------------+----------------------------------------------+
#           setUserForm         |
#           fetchLoginData      |
#           sayMsg              |
#                               |
##CHGS     .--------------------+----------------------------------------------+
# .(30329.02  3/29/23 RAM  4:20p| Add sayMsg function
# .(30329.04  3/29/23 RAM  4:45p| Write function fetchLoginData
# .(30328.06  3/29/23 RAM  5:15p| Write function setUserForm
# .(30328.09  3/29/23 RAM  5:54p| Get nID from URL
# .(30329.02  3/30/23 RAM  2:30p| Added End of Script msg 
# .(30330.07  3/30/23 RAM  7:10p| Write functions get/setCookieID
# .(30330.08  3/30/23 RAM  7:30p| 
# .(30330.09  3/30/23 RAM  8:00p| Add onReady

##PRGM     +====================+===============================================+
##ID                            |
##SRCE     +====================+===============================================+
#*/
       var  nSay = 1, nSay2 = 1                                                         // .(30329.02.1 RAM Added sayMsg)

           document.addEventListener("DOMContentLoaded", onReady )                      // .(30330.09.1)
           sayMsg( `login.js[9]    End of script` )                                    // .(30329.02.15)
       
//--------  ---------------------------------------------------------

  function  onReady() {                                                                 // .(30330.09.2 RAM Add onReady)
            sayMsg( `onReady[1]     Beg script execution` )                             // .(30329.02.16)
       var  nID  = window.location.search.match( /id=([0-9]+)/)                         // .(30329.09.1 RAM Get nID from URL)
            nID  = (nID && nID[1]) ? nID[1] : 0                                         // .(30329.09.2)
//     var  nID  = window.location.search.match( /id=([0-9]+)/)                         //#.(30330.07.1 RAM Beg put into fncs below)
//          nID  = (nID && nID[1]) ? nID[1] : 0                                         //#.(30330.07.1)

//          document.cookie = "UserID = ; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/;"
//          document.cookie = `UserID = ${nID}; path=/`
//      //  sayMsg( `User ID set to ${nID}\nCookie now is: '${document.cookie}'`,2 )    
//          sayMsg( `login.js[1]    Cookie now set to: '${document.cookie}'`,nSay2 )    //#.(30330.07.1 End) 

            setCookieID( nID )                                                          // .(30330.07.2 RAM 
            setUserForm( nID )                                                          // .(30329.06.1 RAM Use it)
            sayMsg( `onReady[2]     End script execution` )                             // .(30329.02.13)
            }                                                                           // .(30330.09.3) 
//--------  ---------------------------------------------------------

  function  setCookieID( nID ) {                                                        // .(30330.07.3 Beg RAM Write function getCookie_ID)
            document.cookie = "UserID = ; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/;"
            document.cookie = `UserID = ${nID}; path=/`
//          sayMsg( `User ID set to ${nID}\nCookie now is: '${document.cookie}'`,2 )    //#.(30329.02.12)
            sayMsg( `setCookie[1]   Cookie now set to: '${document.cookie}'`,nSay2 )    // .(30329.02.12)
            }                                                                           // .(30330.07.3 End) 
//--------  ---------------------------------------------------------

  function  getCookieID() {                                                             // .(30330.07.4 Beg RAM Write function getCookie_ID)
       var  c = document.cookie;
       var  n = c.indexOf("=")
//      if (n > 0) {
//     var  id = c.substring(n+1)   
//      } else {
//     var  id = 0
//          }
       var  id = ( n > 0 ) ? c.substring(n+1) : 0;
    return  id

//     var  nID  = window.location.search.match( /id=([0-9]+)/)                         // .(30329.09.1 RAM Get nID from URL)
//          nID  = (nID && nID[1]) ? nID[1] : 0                                         // .(30329.09.2)
//  return (nID > 0 ) ? nID : id
            }                                                                           // .(30330.07.4 End) 
//--------  ---------------------------------------------------------

 async function  setUserForm( nID ) {                                                   // .(30329.06.2 Beg RAM Write function setUserForm)

        if (nID > 0) {
       var  pUser = await fetchLoginData( nID )
       if ( pUser.error) {                                                              // .(30330.08.1 Beg RAM Check for Error)
            sayMsg( `setUserForm[1] *** UserID, '${nID}' not found`, 3 )    
            return 
            }                                                                           // .(30330.08.1 End)
       var  pForm = document.forms[0]
            pForm.username.value = pUser.email
            sayMsg( `setUserForm[1] pForm.username set to "${pForm.username.value}"`)   // , 2)
            } // eif nID > 0 
         }                                                                           // .(30329.06.2 End)
//   -----  ---------------------------------------------------------

 async function  fetchLoginData( nID ) {                                                // .(30329.04.2 Beg RAM Write function fetchLoginData)

//     var  pLoginData = {     id: 0, code: "", name : "", email: "" }                  //#.(30330.08.2) 
       var  pLoginData = { error: 99, code: "", name : "", email: "" }                  // .(30330.08.2) 

        if (nID == 90) {
            pLoginData =
              { id     :  nID
              , code   : "RS"
              , name   : "Rick Schinner"
              , email  : "rjs@gmail.com"
                }
            }
        if (nID == 91) { pLoginData = { id: nID, code: "BT", name : "Bruce Troutman", email: "bruce.troutman@gmail.com" } }
        if (nID == 92) { pLoginData = { id: nID, code: "RM", name : "Robin Mattern",  email: "robin.mattern@gmail.com"  } }

    return  pLoginData
            }                                                                                 // .(30329.04.2 End)
//   -----  ---------------------------------------------------------

  function  sayMsg( aMsg, nSay_) {                                                      // .(30329.02.11 Beg RAM Write function)
            nSay_ =  nSay_ ? nSay_ : nSay
        if (nSay_ == 1 || nSay_ == 3) { console.log( aMsg) }
        if (nSay_ == 2 || nSay_ == 3) {       alert( aMsg) }
            }                                                                           // .(30329.02.11 End)
//   -----  ---------------------------------------------------------
