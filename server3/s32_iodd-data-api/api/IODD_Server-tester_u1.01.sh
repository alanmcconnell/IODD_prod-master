#!/bin/bash


  function help() {
  echo ""
  if [ "$1" != "" ]; then 
  echo "  Invalid IODD Repo: '$1'" ; fi 
  echo "  Usage:" 
  echo "    bash IODD_Server-tester.sh  prod0-master"  # IODD_s54032_prod0-master
  echo "    bash IODD_Server-tester.sh  test1-master"  # IODD_s54132_test1-master
  echo ""
  echo "    bash IODD_Server-tester.sh  dev01-login"   # IODD_c54632_dev01-login 
  echo "    bash IODD_Server-tester.sh  test2-rick"    # IODD_c54732_test2-rick  
  echo "    bash IODD_Server-tester.sh  dev03-alan"    # IODD_c54832_dev03-alan  
  echo "    bash IODD_Server-tester.sh  test1-robin"   # IODD_c54932_test1-robin 
  echo ""
  exit 
  }
            aRepo=$1
   if [  "${aRepo}" == "prod0"        ]; then aHost="https://iodd.com:3013/api2";   fi 
   if [  "${aRepo}" == "prod0-master" ]; then aHost="https://iodd.com:3013/api2";   fi 
#  if [  "${aRepo}" == "prod0-master" ]; then aHost="https://iodd.com:54032/api12"; fi 

   if [  "${aRepo}" == "test1-master" ]; then aHost="https://iodd.com:54132/api12"; fi 
#  if [  "${aRepo}" == "test1-master" ]; then aHost="https://iodd.com:54132/api12"; fi 

   if [  "${aRepo}" == "dev01-login"  ]; then aHost="https://iodd.com/dev01-login/api12"; fi 
   if [  "${aRepo}" == "test2-rick"   ]; then aHost="https://iodd.com/test2-risk/api12";  fi 
   if [  "${aRepo}" == "dev03-alan"   ]; then aHost="https://iodd.com/dev03-alan/api12";  fi 
   if [  "${aRepo}" == "test1-robin"  ]; then aHost="https://iodd.com/test1-robin/api12"; fi 


   if [ "${aHost}" == "" ]; then help $1; fi 
  
    echo "" 
    echo "Testing IODD App Database API: '${aHost}'"

# -------------------------------------------------------------------------------------

# aHost="http://localhost:3012"
# aHost="https://iodd.net/test-rjs/api12"

function wgetIt( ) {
   echo ""
   echo "-------------------------------------------------------------"

   if [ "$2" == "post" ]; then
       aData="${1/*\?/}"; aURL="${aHost}/${1/\?*/}"
   echo "  wget  \"${aURL}\" --post-data \"${aData}\""
   echo "-------------------------------------------------------------"
           wget -q --post-data  "${aData}"   "${aURL}" >/dev/null
      else
   echo "  wget  \"${aHost}/$1\""
   echo "-------------------------------------------------------------"
           wget -q  "${aHost}/$1" >/dev/null
       fi
   echo "-------------------------------------------------------------"
   }

#  wgetIt "login?userid=robin.mattern@gmail.com&password="     "post"; exit
#  wgetIt "login?userid=robin.mattern@gmail.com&password=xxxx" "post"; exit
#  wgetIt "member?email=robin.mattern@gmail.com" "post"
#  wgetIt "user?userid=new@domain.com"   "post"
#  wgetIt "user?userid=new email"   "post"
#  exit

#  wgetIt "login?uid=90"
#  wgetIt "login_form?uid=90"
#  wgetIt "login?userid=robin.mattern@gmail.com&password="     "post"
#  wgetIt "login?userid=robin.mattern@gmail.com&password=xxxx" "post"
#  wgetIt "login?userid=robin.mattern@gmail.com&password=iodd" "post"
   wgetIt "meetings"
   wgetIt "members"
   wgetIt "members?id=90"
   exit 
   wgetIt "member?email=robin.mattern@gmail.com" "post"
   wgetIt "member?email=robin.mattern@gmail.com&mid=90" "post"
   wgetIt "members_bios"
   wgetIt "members_projects"
   wgetIt "projects"
   wgetIt "project?pid=149"
   wgetIt "projects_list?mid=90"
   wgetIt "project_banner?pid=149"
   wgetIt "project_collaborators?pid=149"
   wgetIt "project_collaborators?action=insert&pid=99&mid=90"
   wgetIt "project_collaborators?action=delete&mpid=111"
   wgetIt "users"
   wgetIt "user?uid=7"
   wgetIt "user?userid=new@domain.com"   "post"
   wgetIt "user?userid=new email"   "post"



#    Welcome  to IODD MySQL Express Server API (v1-06.30412.1630).<br>
#           Use any of the following APIs:<br><br>
#           <div style="margin-left:40px; font-size:18px; line-height: 25px;">
#
#           <a href="/login?uid=90"                      >/login?uid=90</a><br>                  <!-- .(30525.03.1 RAM Was: id) -->
#           <a href="/login_form?uid=90"                 >/login_form?uid=90</a><br>             <!-- .(30525.03.2 RAM Was: id) -->
#    <!--   <a href="/login_form?form&uid=90"            >/login_form?form&uid=90</a><br> -->
#    <!--   <a href="/login_form_post?userid=a.b@c&password=" >/login_form_post</a><br> -->      <!-- .(30525.06.1)
#    <!--   <a href="/login_form"                        >/login_form?id=90</a><br> -->
#           <form  method="POST" action="/login"                     style="margin-bottom: -5px;">
#             /login?userid=<input type="text"   name=""         value=" email" style="padding: 0px;  width:200px" />
#                           <input type="hidden" name="userid"   value="robin.mattern@gmail.com"    placeholder=" Email Address" >
#                           <input type="hidden" name="password" value="iodd">
#                           <input type="submit"   id="form1"    value="Submit"       style="padding: 0px;  width: 54px" />
#           </form>     <!-- .(30511.01.1) -->
#           <a href="/meetings"                          >/meetings</a><br>
#           <a href="/members"                           >/members</a><br>
#           <a href="/members?id=90"                     >/members?id=90 # Spcial case</a><br>   <!-- .(30525.05.1 RAM Uses id) -->
#           <form  method="POST" action="/member"                   style="margin-bottom: -5px;">
#             /member?email=<input type="text"   name="email"    value=" "    style="padding: 0px;  width: 200px" />
#                       mid=<input type="text"   name="mid"      value=" 90"       style="padding: 0px;  width: 30px" />
#                           <input type="submit"   id="form2"    value="Update"    style="padding: 0px;  width: 56px" />
#           </form>     <!-- .(30510.03.3 RAM Add Member_postRoute) -->
#           <a href="/members_bios"                      >/members_bios</a><br>
#           <a href="/members_projects"                  >/members_projects</a><br>
#           <a href="/projects"                          >/projects</a><br>
#           <a href="/project?pid=149"                   >/project?pid=149</a><br>               <!-- .(30525.03.3 RAM Was: id).(30525.04.3) -->
#           <a href="/projects_list?mid=90"              >/projects_list?mid=90</a><br>          <!-- .(30511.03.3 RAM Add GET projects_list).(30525.03.4 RAM Was: id) -->
#           <a href="/project_banner?pid=149"            >/project_banner?pid=149</a><br>        <!-- .(30521.01.3 RJS).(30525.03.5 RAM Was: id) -->
#           <a href="/project_collaborators?pid=149"     >/project_collaborators?pid=149</a><br> <!-- .(30525.03.6 RAM Was: id) -->
#           <form  method="GET" action="/project_collaborators?action=insert"                    style="margin-bottom: -5px;">
#             /project_collaborators?action=insert
#                   &pid=<input type="text"   name="pid"      value=" 99"       style="padding: 0px;  width: 30px;" />
#                   &mid=<input type="text"   name="mid"      value=" 90"       style="padding: 0px;  width: 30px;" />
#                        <input type="hidden" name="action"   value="Insert"                                       />
#                        <input type="submit"   id="form5"    value="Insert"    style="padding: 0px;  width: 50px" />
#           </form>     <!-- .(30524.01.2 RAM Add Insert project_collaborators) -->
#           <form  method="GET" action="/project_collaborators?action=delete"                    style="margin-bottom: -5px;">
#             /project_collaborators?action=delete
#                  &mpid=<input type="text"   name="mpid"     value=" 111"      style="padding: 0px;  width: 35px;" />
#                        <input type="hidden" name="action"   value="Delete"                                       />
#                        <input type="submit"   id="form4"    value="Delete"    style="padding: 0px;  width: 53px" />
#           </form>     <!-- .(30524.01.1 RAM Add Delete project_collaborators) -->
#           <a href="/users"                             >/users</a><br>                         <!-- .(30328.03.1 Add Users) -->
#           <a href="/user?uid=7"                        >/user?uid=7</a><br>                    <!-- .(30405.03.1 End).(30525.03.7 RAM Was: id) -->
#           <form  method="POST" action="/user"                 style="margin-bottom: -5px;">
#             /user?userid=<input type="text"   name="userid"   value=" new email"     style="padding: 0px;  width: 200px" />
#                          <input type="hidden" name="password" value="iodd">
#                          <input type="submit"   id="form3"    value="Add"       style="padding: 0px;  width: 38px" />
#           </form>     <!-- .(30511.01.3).(30510.02.5 RAM Add POST User) -->
#           </div>
#
#