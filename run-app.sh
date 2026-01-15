#!/bin/bash

  nPrj=54  # Can't be greater than 64   # .(51013.05.1 IODD Project Number
  nUseThisClientPort="54332"            # .(51013.05.1 Use Normal Client Port for IODD)
  nUseThisStage=3                       # .(51017.05.1 Ok force it the Stage)

  nStg=4; if [[ "$(realpath "$0")" == *dev* ]]; then nStg=3; fi
          if [[ "$(realpath "$0")" == *tes* ]]; then nStg=2; fi
          if [[ "$(realpath "$0")" == *pro* ]]; then nStg=1; fi
          if [  "${nUseThisStage}" != ""     ]; then nStg=${nUseThisStage}; fi          # .(51017.05.2)
  nApp=1
  nPort="${nPrj}${nStg}##"
  bSave=0                                                                                                   # .(51122.03.1 RAM Don't resave in Alan's IODD app)
  nVer=1.13                                                                                                 # .(51124.02.1 RAM Set Run-App Version)

# ---------------------------------------------------

  if [ "$1" == "" ]; then
     echo -e "\n  Run Client and/or Server App(s) for Project 54 (v${nVer})"                                #. (51124.02.2)
     echo -e   "  Usage: run-app [c|s|a]{nStg}{nApp} [-b] [-q]"
     echo -e   ""
     echo -e   "    c|s|a = c)Client, s)Server, or a)both"
     echo -e   "    nStg  = Stage: 1)Prod1, 2)Test2, 3)Dev03, 4-9)Dev0[4-9]"
     echo -e   "    nApp  = [0-9][0-9]: client#/c##, server#/s##, or both/a##"
     echo -e   "     -b   = Debug, -q = Quietly, -s = Set _config.js to _config.yaml"
     echo -e   ""
     echo -e   "  Example: run-app a32  # run both Client and Server App no. 32"
     echo -e   "     Runs: Client App on Port 54332 and Server API on Port 54382"
     if [ "${OS:0:3}" != "Win" ]; then echo ""; fi
     exit; fi
# ---------------------------------------------------

  aQuiet=""; if [ "$2" == "-q" ]; then aQuiet="--quiet "; set -- "$1" "${@:3}"; fi
             if [ "$3" == "-q" ]; then aQuiet="--quiet "; fi
  bSave="0"; if [ "$2" == "-s" ]; then bSave="1";         set -- "$1" "${@:3}"; fi                          # .(51122.03c.1 RAM Add bSave Arg)
             if [ "$3" == "-s" ]; then bSave="1";         fi                                                # .(51122.03c.2)

# ---------------------------------------------------

function echot () { if [ "1" == "0" ]; then echo "$1"; fi                                                   # .(51129.05b.1 RAM Quiet debug)
     }
# ---------------------------------------------------

function checkFW() {
    if [ "${OSTYPE:0:6}" == "darwin" ]; then return; fi                                                     # .(51124.03.1 RAM ufw is different/complicated on a mac)
    bOK="$( sudo ufw status | awk '/'$1'/ { print 1 }; END { print 0 }' )"
    if [ "${bOK}" == "0" ]; then sudo ufw allow $1/tcp > /dev/null 2>&1;
#                                sudo ufw delete allow 54332/tcp
    echo "    Opened firewall for port: $1"
    fi
    }
# ---------------------------------------------------

# Function to kill process on a specific port
function chkPort() {
    local port=$1

    echo -e "  Checking ${aCS} port $port..."

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash)
        local pid=$(netstat -ano | findstr ":$port" | awk '{print $5}' | head -1)
        if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
            echo "  Killing windows process $pid for port $port"
#           taskkill /PID $pid /F > /dev/null 2>&1
            MSYS2_ARG_CONV_EXCL="/PID;/F" /c/Windows/System32/taskkill.exe /PID $pid /F 2>&1 | awk '{ print "  " $0 }'
        fi
    else
        # Linux/macOS
        local pid=$(lsof -ti:$port)
#           echo "  what is the pid $pid for port $port";
        if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
            echo "  Killing linux process $pid for port $port"
            kill -9 $pid > /dev/null 2>&1 | awk '{ print "  " $0 }'
        fi
        sleep 1  # Wait for PM2 to restart it                                           # .(51130.01.1 RAM Check if PM2 has got port Beg)  
        local pid=$(lsof -ti:$port)
        if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
            echo "* PM2 has restarted the service for that port.";
            echo "  run-app can't start ${aApp} until you stop it on PM2.";
            if [ "${OS:0:3}" != "Win" ]; then echo ""; fi; exit 1;
            fi                                                                          # .(51130.01.1 End)
        checkFW $port
    fi
}
# ---------------------------------------------------

function setPort() { # $1 = 3201, 3251 or 64361: Proj#: 3,64; Stage#: 1)Prod, 2)Test, 3)Dev3, 4-9)Dev4-9; Client#/Server#: 0-4/5-9; App#: 1-9
#   Runs 1st for getName with "c##"
    csn=${1:1:1}     # Client#/Server#
    ano=${1:2:1}     # App#
    prj="${2:0:2}"; if [ "${#2}" == "5" ]; then prj="${2:0:3}"; fi  # Proj# + Stage#   33 or 643
    nsp=5;       if [ "${1:0:1}" == "c" ]; then nsp=0; fi
    nPort="${prj}$(( nsp + csn ))${ano}";
    aApp="${1:0:1}${csn}${ano}"

#   echo -e "\n  setPort[1] ${1} prj: ${prj}, nsp: ${nsp}, csn: ${csn}, ano: ${ano} == nPort: ${nPort}, aApp: ${aApp}\n"; exit
    aServer="server${csn}"; if [ "${csn}" == "0" ]; then aServer="server"; fi
    aClient="client${csn}"; if [ "${csn}" == "0" ]; then aClient="client"; fi
#   echo "--nPort: ${nPort}"; exit
    }
# ---------------------------------------------------

function getAppName() {
   aAppName="Unknown"; setPort "$1" "$2"; aFldr="docs"; # echo "  nPort: ${nPort}"; exit
#   echo "-- \$1 \$2: '$1' '$2', aApp: '${aApp}'"  # aApp is set by setPort
if [ "${1:0:1}" == "c" ]; then aFldr="${aClient}"; aCS="C${aClient:1:5}"; fi
if [ "${1:0:1}" == "s" ]; then aFldr="${aServer}"; aCS="S${aServer:1:5}"; fi
if [ -d "${aFldr}" ]; then
   aAppName=$(  find "./${aFldr}" -maxdepth 1 -type d -name "${aApp}_*"                  | awk '{ sub( /.+\//, ""   ); print; exit }' )
   fi
#  echo "--- ./${aFldr}/${aApp}_* -- aAppName: ${aAppName}";
if [ "$3" == "q" ]; then return; fi                                                     # .(51007.01.1 RAM Don't check)
if [ "${aAppName}" == "" ] || [ "${aAppName}" == "Unknown" ]; then                      # .(51007.01.2 RAM Check Unknown too)
   echo -e "\n* ${aCS} App, ${aApp}_*, not found in folder, ${aFldr}.";
   if [ "${OS:0:3}" != "Win" ]; then echo ""; fi; exit 1;
   fi
   if [ -f "${aServer}/${aAppName}/.env" ]; then
   aHost="$( cat "${aServer}/${aAppName}/.env" | awk '/SERVER_HOST/ && !/^#/ { sub( /.+= */, ""); print; next; }' | tr -d "'" | tr -d '"' )" # .(50911.03.x)
   fi
   if [ "${aHost}" == "" ]; then aHost="localhost"; fi;                                 # .(50911.03.x)
   }
# ---------------------------------------------------

function getFVar( ) {                                                                   # .(50915.02.1 RAM Write getFVar)

         aAWKpgm="'/^[,\\ \"]*${aFVar}[\\ \"]*:/ { sub( /^[,\\ \"]*${aFVar}[\\ \"]*:/,\\ \"\" ); sub( /.+= */,\\ \"\" ); print }'"
#        aAWKpgm='/^[,\ "]*'"${aFVar}"'[ "]*:/ { sub( /^[,\ \"]*'"${aFVar}"'[ "]*:/, "" ); sub( /.+= */,\ "" ); print }'
#                 /^[,\ "]*VARNAME[\ "]*:/ { sub( /^[,\ "]*VARNAME[\ "]*:/, "" ); sub( /.+=\ */, "" ); print }
#                 /^[,$' ' "]*VARNAME[$' ' "]*:/ { sub( /^[,$' ' "]*VARNAME[$' ' "]*:/, "" ); sub( /.+=$' ' */, "" ); print }
#        aAWKpgm=$( cat <<EOF
#/^[,\\x20 "]*VARNAME[\\x20 "]*:/ { sub( /^[,\x20 "]*VARNAME[\x20 "]*:/, "" ); sub( /.+=\x20 */, "" ); print }
#EOF
#)
#        aAWKpgm="/^[, \"]*VARNAME[ \"]*:/ { sub( /^[, \"]*VARNAME[ \"]*:/, "" ); sub( /.+= */, \"\" ); print }"
         aAWKpgm="/^[,{SP}\"]*${1}[{SP}\"]*:/ { sub( /^[,{SP}\"]*${1}[{SP}\"]*:/, \"\" ); sub( /.+={SP}*/, \"\" ); a=\$0; }; END { print a }"
         aAWKpgm="${aAWKpgm//{SP\}/ }"

#        echo -e   "\n-- aAWKpgm: ${aAWKpgm}";
#        echo ""; printf "..aAWKpgm: %s\n" "$aAWKpgm"
#        aAWKpgm="${aAWKpgm//VARNAME/$1}"
#        aAWKpgm="${aAWKpgm//{SP\}/ }"
#        echo -e "-- aAWKpgm: ${aAWKpgm}\n"; exit
#                 printf "..aAWKpgm: %s\n" "$aAWKpgm"

#           if [ ! -f "${aServerDir}/_config.js" ]; then  aVar=""; else                                     # .(51124.04.1 RAM getFVAR for if exists for server)
            if [   -f "${aServerDir}/_config.js" ]; then  aVar=""; else                                     # .(51124.04b.1 RAM What the fuck!)
         aVar="$( cat "${aServerDir}/_config.js" | awk "${aAWKpgm}" | tr -d "'" | tr -d '"' )"              # .(51016.02.2).(51013.05.7)
               fi                                                                                           # .(51124.04b.1).(51124.04.2)

            if [   -f "${aClientDir}/_config.js" ]; then                                                    # .(51124.04.3 RAM getFVAR for if exists for client)
         aVar="$( cat "${aClientDir}/_config.js" | awk "${aAWKpgm}" | tr -d "'" | tr -d '"' )"              # .(51124.04.5)
               fi                                                                                           # .(51124.04b.2).(51124.04.6)
         echo "${aVar// /}"                                                                                 # .(51124.04b.3).(51124.04.7)
         }                                                                              # .(51016.02.1)
# ---------------------------------------------------

function setServerAPI_URL() {                                                           # .(50911.04.1 RAM Write function Beg)

         aServerDir="$1"
         aClientDir="$2"

         echot "  [159] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClientDir}/_config.js" 2>/dev/null )"

#        nServerPort="$(    cat "${aServerDir}/_config.js" | awk '/^ *SERVER_PORT *=/           { sub( /.+= */, "" ); print }' | tr -d "'" | tr -d '"' )"   # .(51013.05.5 RAM Use _config.js, not .env)
#        aServerHost="$(    cat "${aServerDir}/_config.js" | awk '/^ *SERVER_HOST *=/           { sub( /.+= */, "" ); print }' | tr -d "'" | tr -d '"' )"   # .(51013.05.6)
#        aServerAPI_URL="$( cat "${aServerDir}/_config.js" | awk '/^[, "]*SERVER_API_URL[ "]*:/ { sub( /^[, "]*SERVER_API_URL[ "]*:/, "" ); sub( /.+= */, "" ); print }' | tr -d "'" | tr -d '"' )"   # .(51013.05.7)
#        aServerAPI_URL="$( cat "${aServerDir}/_config.js" | awk '/^[, "]*SECURE_API_URL[ "]*:/ { sub( /^[, "]*SECURE_API_URL[ "]*:/, "" ); sub( /.+= */, "" ); print }' | tr -d "'" | tr -d '"' )"   # .(51013.05.7)

         aServerAPI_URL="$( getFVar "SERVER_API_URL" )"
         echot "  [167] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClientDir}/_config.js" 2>/dev/null )"

         aLocation="$(      getFVar "SERVER_LOCATION" )";
         echot "  [170] --- bSave: ${bSave}, aLocation='${aLocation}'; aServerAPI_URL: '${aServerAPI_URL}'; aClientPath: ${aClientPath}'"; # exit

   if [ "${THE_SERVER:0:5}" == "formr"  ] || [ "${bSave}" == "1" ]; then                                    # .(51129.04.1 RAM My goodness)
   if [ ! -f "${aClientDir}/_config.js" ] || [ "${bSave}" == "1" ]; then bSave=1                            # .(51129.04b.1 RAM Not necessary)
         aLocation="Remote";                                                                                # .(51129.04b.2 RAM My goodness)
      if [   -f "_config.yaml.js" ]; then cat "_config.yaml.js" | awk '/SERVER_LOCATION/ { print ", \"SERVER_LOCATION\":\"Remote\""; next }; { print }' >"${aClient}/${aAppName}/_config.js"; fi     # .(51130.04.1 RAM Fuck you).(51017.04a.5 RAM Copy _config.yaml.js).(51017.04.2)
       else                                                                                                 # .(51129.04b.3 Beg)
         echot "  [177] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClientDir}/_config.js" 2>/dev/null )"
         fi;                                                                                                # .(51129.04b.3 End)
         fi;                                                                                                # .(51129.04b.4 RAM My goodness)
         aL="$( echo "${aLocation:0:1}" | tr '[a-z]' '[A-Z]' )" # .(51129.05.1); aLocation="${aL}${aLocation:1}"                  # .(51129.05.2)

         aClientPath="$(    getFVar "CLIENT_PATH" )"
         echot "  [183] --- bSave: ${bSave}, aLocation='${aLocation}'; aServerAPI_URL: '${aServerAPI_URL}'; aClientPath: ${aClientPath}'";

 if [ "${aLocation}" == "Remote" ]; then
         aServerAPI_URL="$( getFVar "REMOTE_API_URL" )";
         aClientPath="$( echo "${aServerAPI_URL}" | sed 's|^\(https\?://[^/]*\).*|\1|' | awk '{ sub( /:[0-9]+/, "" ); print }' )"  # .(51017.02.1)
if [[ "${aClientPath}" =~ .[0-9]+. ]]; then aClientPath="${aClientPath}:${nPort}"; fi
      else
      if [ ! -f "${aClientDir}/_config.js" ]; then bSave=1                                                                                                                                           # .(51130.04.2)   
      if [   -f "_config.yaml.js" ]; then cat "_config.yaml.js" | awk '/SERVER_LOCATION/ { print ", \"SERVER_LOCATION\":\"Local\""; next }; { print }' >"${aClient}/${aAppName}/_config.js"; fi      # .(51130.04.3 RAM Fuck you).(51017.04a.5 RAM Copy _config.yaml.js).(51017.04.2)
         fi                                                                                                                                                                                          # .(51130.04.4)   
         aServerAPI_URL="$( getFVar "LOCAL_API_URL" )";
         aClientPath="$(    getFVar "LOCAL_PATH" )";
         fi
         echot "  [192] --- bSave: ${bSave}, aLocation='${aLocation}'; aServerAPI_URL: '${aServerAPI_URL}'; aClientPath: ${aClientPath}'"; # exit

#echo "  aLocation: '${aLocation}'";
#echo "  aServerAPI_URL: '${aServerAPI_URL}'";  exit

         nServerPort="$(   echo "${aServerAPI_URL}" | awk '{ sub( /.+:/, "" ); sub( /\/.+/, "" ); print }' )"                                               # .(51013.05.5 RAM Use _config.js, not .env)
#        aServerHost="$(   echo "${aServerAPI_URL}" | awk '{ sub( /:[0-9]+/, "" ); print }' )"  ##.(51013.05.6).(51017.02.1)
         aServerHost="$(   echo "${aServerAPI_URL}" | sed 's|^\(https\?://[^/]*\).*|\1|' | awk '{ sub( /:[0-9]+/, "" ); print }' )"  # .(51017.02.1)

#        echo "  Setting SERVER_API_URL to: ${aServerAPI_URL// /} in ${aClientDir}/_config.js";   # exit
#        echo "  Setting CLIENT_PATH    to: ${aServerHost}:${nPort} in ${aClientDir}/_config.js";   exit
#        echo "  Setting CLIENT_PATH    to: ${aClientPath} in ${aClientDir}/_config.js";            exit

   if [ ! -f "${aClientDir}/_config.js" ]; then                                                             # .(51013.05.8 RAM Use _config.js, not config.js Beg)
#        echo 'var CONFIG = '                              > "${aClientDir}/_config.js"                     ##.(51129.05b.2 RAM Not for IODD)
#        echo ' { "CLIENT_PATH":    "{CLIENT_PATH}"'      >> "${aClientDir}/_config.js"                     ##.(51129.05b.3)
#        echo ' , "SERVER_API_URL": "{SERVER_API_URL}"'   >> "${aClientDir}/_config.js"                     #  If it doesn't exist
#        echo '  }'                                       >> "${aClientDir}/_config.js"                     ##.(51013.05.8 End).(51129.05b.4)
         bSave=1                                                                                            # .(51122.03c.3 RAM Set if it didn't exist)
         fi
         echot "  [210] --- bSave: ${bSave}, aLocation='${aLocation}'; aServerAPI_URL: '${aServerAPI_URL}'; aClientPath: ${aClientPath}'"; # exit

#        aAWKpgm='/SERVER_API_URL:/ { print   "  SERVER_API_URL:   \"'${aServerHost// /}:${nServerPort}${aServerAPI_URL}'\","; next }
#     /^[, "]*SERVER_API_URL[ "]*:/ { print ", \"SERVER_API_URL\": \"'${aServerHost}:${nPort}}'\""; next }
#     /^[, "]*CLIENT_PATH[ "]*:/    { print ", \"CLIENT_PATH\":    \"'${aServerHost}:${nPort}'\""; next }
         aAWKpgm='
      /^[, "{]*CLIENT_PATH[ "]*:/    { print ", \"CLIENT_PATH\":    \"'${aClientPath}'\""; next }
      /^[, "{]*SERVER_API_URL[ "]*:/ { print ", \"SERVER_API_URL\": \"'${aServerAPI_URL}'\""; next }
                                     { print }'
         aTS="$( date '+%y%m%d.%H%M' )"; aTS="${aTS:1}"; aConfig_tmp="_config_v${aTS}.tmp.js"               # .(51122.03.1 RAM Add $TS to _config.tmp.js)
         cat "${aClientDir}/_config.js" | awk "${aAWKpgm}"     >"${aClientDir}/${aConfig_tmp}"              # .(51122.03.2)

#        echo -e "  aAWKpgm: \n${aAWKpgm}"; echo " _config.tmp.js: "; cat "${aClientDir}/${aConfig_tmp}"
     if [ "${bSave}" == "1" ]; then                                                                         # .(51122.03a.1 RAM Opps).(51122.03.3 Beg)
#        mv  "${aClientDir}/_config.tmp.js" "${aClientDir}/_config.js"                                      ##.(51122.03.4)
         cp  "${aClientDir}/${aConfig_tmp}" "${aClientDir}/_config.js"                                      # .(51129.05.3 RAM Was mv).(51122.03.4)
#        rm  "${aClientDir}/${aConfig_tmp}"                                                                 # .(51122.03c.4).(51122.03.5)
         echo  "     Saved _config.js file:   ${aClientDir}/_config.js"                                     # .(51122.03c.5).(51122.03.6)
       else                                                                                                 # .(51122.03b.1 RAM Add msg)
         echo  "     Saved tmp _config file:  ${aClientDir}/${aConfig_tmp}"                                 # .(51122.03b.2)
         fi                                                                                                 # .(51122.03.3 End)
#        echo  "   Setting SERVER_API_URL to: ${aServerHost// /}:${nServerPort}${aServerAPI_URL} in ${aClientDir}/_config.js"
#        echo  "   Setting CLIENT_PATH    to: ${aServerHost}:${nPort} in ${aClientDir}/_config.js"
         echo  "   Setting CLIENT_PATH    to: ${aClientPath} in ${aClientDir}/_config.js"
         echo  "       and SERVER_API_URL to: ${aServerAPI_URL// /} "
#        exit
         }                                                                              # .(50911.04.1 End)
# ---------------------------------------------------

function runServer() {
#                        echo "\n  runServer( '$1', '$2' )"
    setPort "$1" "$2"  # Sets aServer, aApp and nPort
#   chkPort ${nPort}   # Kill any existing processes on our ports
    getAppName $1 $2;  # echo "  Server nPort: ${nPort} for ${aAppName}"; return
#   echo -e "\n  runServer[1] Client nPort: ${nPort} for ${aAppName}";                  # .(50113.05.3 RAM ??? To get the client folder)

#        echot "  [248] --- bSave: ${bSave}, Does it exist: $( ls -1 "client32/c32_iodd-app/_config.js" 2>/dev/null )"

 if [ ! -f "${aServer}/${aAppName}/_config.js" ] || [ "${bSave}" == "1" ]; then                             # .(51129.05.4).(51017.04a.1 RAM If _config.js doesn't exist)
 if [   -f "_config.yaml.js" ]; then cp -p "_config.yaml.js" "${aServer}/${aAppName}/_config.js";fi         # .(51017.04a.2 RAM Copy _config.yaml.js).(51017.04.1)
    fi                                                                                                      # .(51017.04a.3)
#        echot "  [253] --- bSave: ${bSave}, Does it exist: $( ls -1 "client32/c32_iodd-app/_config.js" 2>/dev/null )"

#   Install dependencies if needed
    bDoit="0"; if [ "${3:0:2}" == "-d" ]; then bDoit="1"; fi
 if [ ! -d "${aServer}/node_modules"   ]; then bDoit="1"; fi
 if [ "${bDoit}" == "1" ] && [ -f "${aServer}/package.json" ]; then

    echo -e "\n  Installing ${aServer} dependencies..."
    cd ${aServer}
    npm install
    cd ..
    fi
 if [ "$(command -v nodemon)" == "" ]; then npm install -g nodemon >/dev/null 2>&1; fi

    echo -e "\n  Starting ${aServer}, ${aAppName}, on port ${nPort}..."

    cd ${aServer}/${aAppName}
    chkPort ${nPort}   # Kill any existing processes on our ports

    aExt='mjs'; if [ -f "server.js" ]; then aExt='js'; fi
echo "  node --trace-deprecation ${aQuiet}\"server.${aExt}\""; echo ""
        node --trace-deprecation ${aQuiet}"server.${aExt}" &

    SERVER_PID=$!
#   echo "  Server is running at: http://localhost:${nPort}/api"
#   echo "  Server is running at: http://${aHost}:${nPort}"
#   if [ "${aQuiet}" == "" ]; then echo ""; fi
    cd ../..
    }
# ---------------------------------------------------

function runClient() {
#                        echo "\n  runClient( '$1', '$2' )"
    getAppName "s${1:1}" $2 "q"; aServerName=${aAppName}
    getAppName "c${1:1}" $2;
#   echo -e "\n  runClient[1] Client nPort: ${nPort} for ${aAppName}";                  # .(50113.05.3 RAM ??? To get the client folder)

 if [ "${nUseThisClientPort}" == "" ]; then      # .(50113.05.2 Beg)
    setPort "$1" "$2"  # Sets aClient, aApp and nPort
    else
    nPort="${nUseThisClientPort}"
    fi                                           # .(50113.05.2 End)

#   chkPort ${nPort}   # Kill any existing processes on our ports
#   getAppName $1 $2;  # echo -e "  Client nPort: ${nPort} for ${aAppName}\n";          # .(50113.05.3 RAM ??? Why was this here a 2nd time)
#   echo "  runClient[2] \$2: '$2', nPort: '${nPort}', aServerName: '${aServerName}'"

#   setServerAPI_URL "${aServer}/${aServerName}" "${aClient}/${aAppName}"; # exit       # .(50911.04.2 RAM Use it)

         echot "  [302] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClient}/${aAppName}/_config.js" 2>/dev/null )"

#if [ "${bSave}" == "1" ] ]] || [ ! -f "${aClient}/${aAppName}/_config.js" ] || [ "${bSave}" == "1" ]; then ##.(51129.05.5).(51017.04a.4 RAM Create If _config.js doesn't exist).(51129.05b.5)
 if [ "${bSave}" == "1" ]; then                                                                             # .(51129.05b.5 RAM Just bSave).(51017.04a.4 RAM NO! not unless bSave)
 if [   -f "_config.yaml.js" ]; then cp -p "_config.yaml.js" "${aClient}/${aAppName}/_config.js"; fi        # .(51017.04a.5 RAM Copy _config.yaml.js).(51017.04.2)
    fi                                                                                                      # .(51017.04a.6)
#        sleep 3
         echot "  [309] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClient}/${aAppName}/_config.js" 2>/dev/null )"

#   Install dependencies if needed
    bDoit="0"; if [ "${3:0:2}" == "-d" ]; then bDoit="1"; fi
 if [ ! -d "${aClient}/node_modules"   ]; then bDoit="1"; fi
 if [ "${bDoit}" == "1" ] && [ -f "${aClient}/package.json" ]; then

    echo -e "\n  Installing ${aClient} dependencies..."
    cd ${aClient}
    npm install
    cd ..
    fi

 if [ "$(command -v live-server)" == "" ]; then npm install -g live-server >/dev/null 2>&1; fi

    echo -e "\n  Starting ${aClient}, ${aAppName}, on port ${nPort}..."

    chkPort ${nPort}   # Kill any existing processes on our ports
         echot "  [328] --- bSave: ${bSave}, Does it exist: $( ls -1 "${aClientDir}/_config.js" 2>/dev/null )"
    setServerAPI_URL "${aServer}/${aServerName}" "${aClient}/${aAppName}"; # exit       # .(50911.04.2 RAM Use it)

# echo "  live-server ${aQuiet}--port=${nPort} --open=${aAppName}/ --watch=.,../${aServer}/${aServerName}"    # .(50926.05.2)
#         live-server ${aQuiet}--port=${nPort} --open=${aAppName}/ --watch=.,../${aServer}/${aServerName} &   # .(50926.05.2)
# echo "  live-server ${aQuiet}--port=${nPort} --open=${aClient}/${aAppName} --watch=${aClient}/${aAppName},${aServer}/${aServerName}"    # .(50926.05.2)
#         live-server ${aQuiet}--port=${nPort} --open=${aClient}/${aAppName} --watch=${aClient}/${aAppName},${aServer}/${aServerName} &   # .(50926.05.2)
# echo "  live-server ${aQuiet}--port=${nPort} --host=0.0.0.0 --open=${aClient}/${aAppName} --watch=${aClient}/${aAppName},${aServer}/${aServerName}"    # .(50926.05.2)
#         live-server ${aQuiet}--port=${nPort} --host=0.0.0.0 --open=${aClient}/${aAppName} --watch=${aClient}/${aAppName},${aServer}/${aServerName} &   # .(50926.05.2)
  echo "  live-server ${aClient}/${aAppName} ${aQuiet}--port=${nPort} --host=0.0.0.0 --no-content-length --watch=${aClient}/${aAppName},${aServer}/${aServerName}"    # .(50926.05b.1)
          live-server ${aClient}/${aAppName} ${aQuiet}--port=${nPort} --host=0.0.0.0 --no-content-length --watch=${aClient}/${aAppName},${aServer}/${aServerName} &   # .(50926.05b.1)
  
    CLIENT_PID=$!
    echo ""
#   echo "  Client is running in: $(pwd)/index.html"
#   echo "  Client is running in: $(pwd)/${aAppName}/index.html"
    echo "  Client is running in: $(pwd)/${aClient}/${aAppName}/index.html"
#   echo "  Client is running at: http://${aHost}:${nPort}"
    echo "  Client is running at: ${aClientPath}/${aClient}/${aAppName}"
    cd ../..
    }
# ----------------------------------------------------------------------------------------------

 if [ "${1:0:1}" == "s" ] || [ "${1:0:1}" == "a" ]; then
    runServer "s${1:1:2}" ${nPort}                                                      # .(50911.04.3 RAM Removes 3rd arg)
    sleep 6  # Wait for server to start
    echo "  ----------------------------------------------------------------------"     # .(51130.02.1 RAM Added line)  
    fi
         echot "  [353] --- bSave: ${bSave}, Does it exist: $( ls -1 "client32/c32_iodd-app/_config.js" 2>/dev/null )"

 if [ "${1:0:1}" == "c" ] || [ "${1:0:1}" == "a" ]; then
    runClient "c${1:1:2}" ${nPort}                                                      # .(50911.04.4)
    fi
# ---------------------------------------------------

    echo -e "\n  Press Ctrl+C to stop one or both processes\n"
#   if [ "${OS:0:3}" != "Win" ]; then echo ""; fi;

#   Wait for user interrupt
    trap "kill $SERVER_PID $CLIENT_PID; exit" INT
    wait
