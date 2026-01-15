# System Specifications - IODD Web Application

## 1. System Overview

### 1.1 Application Name
Institute of Database Developers (IODD) - Member Management System

### 1.2 Version
0.01.010

### 1.3 Purpose
Professional community platform for database developers providing member management, project tracking, and role-based collaboration tools.

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js with ES Modules
- **Database**: MySQL
- **Server Framework**: Express.js (inferred)
- **Authentication**: Cookie-based sessions with CSRF protection
- **Development Tools**: Live Server, Nodemon

### 2.2 System Ports
- **API Server**: 54032
- **Client Development**: 5501 (Live Server)
- **Alternative Client**: 5505

### 2.3 Directory Structure
```
iodd_dev01-alan/
├── client/iodd-New-02/          # Frontend application
├── server3/s32_iodd-data-api/   # Backend API server
├── lib/                         # Shared libraries
├── docs/                        # Documentation
└── logs/                        # Application logs
```

## 3. Frontend Specifications

### 3.1 Core Modules

#### 3.1.1 Member Management
- **Files**: `member-profile-info.js/html`, `member-list.js/html`
- **Features**: CRUD operations, profile management, member directory
- **Security**: Input validation, CSRF protection, role-based access

#### 3.1.2 Project Management
- **Files**: `project-list.js/html`, `project-members.js/html`
- **Features**: Project tracking, member-project associations
- **Data**: Project information, team assignments

#### 3.1.3 Admin Tools
- **Files**: `admin-roles.js/html`
- **Features**: Role management, user permissions
- **Access**: Admin-only functionality

#### 3.1.4 Authentication
- **Files**: `auth-client.js`, `global-auth.js`
- **Features**: Login/logout, session management
- **Security**: Token validation, role verification

### 3.2 Shared Libraries
- **global-token-functions.js**: Token management utilities
- **role-permissions.js**: Role-based access control
- **acm_Prompts.js**: User interaction dialogs
- **acm_NextID_client.js**: ID generation utilities

### 3.3 UI Components

#### 3.3.1 Navigation
- Responsive header with dropdown menus
- Role-based menu visibility
- Authentication status display

#### 3.3.2 Forms
- Auto-save functionality to localStorage
- Real-time validation
- CSRF token integration
- Responsive design

#### 3.3.3 Data Display
- Dynamic member lists
- Sortable tables
- Loading states and error handling

## 4. Backend Specifications

### 4.1 API Endpoints

#### 4.1.1 Member Operations
```
GET  /api2/list/members           # List all members
GET  /api2/members?id={id}        # Get member by ID
POST /api2/member                 # Create/update member
DELETE /api2/member?id={id}       # Delete member
GET  /api2/user_by_email?email={} # Get member by email
```

#### 4.1.2 Role Management
```
GET  /api2/webpage_roles_view     # Get active roles
```

#### 4.1.3 Project Operations
```
GET  /api2/webpage_project_info_view    # Project information
GET  /api2/webpage_project_members_view # Project members
```

### 4.2 Data Models

#### 4.2.1 Member Schema
```javascript
{
  MemberNo: Number,      // Primary key
  FirstName: String,     // Required
  LastName: String,      // Required
  Email: String,         // Required, unique
  Phone1: String,
  Phone2: String,
  Company: String,
  Address1: String,
  Address2: String,
  City: String,
  State: String,
  Zip: String,
  Country: String,
  WebSite: String,
  RoleId: Number         // Foreign key to roles
}
```

#### 4.2.2 Role Schema
```javascript
{
  Id: Number,           // Primary key
  Name: String,         // Role name (Admin, Editor, Member)
  Active: String        // 'Yes'/'No' status
}
```

### 4.3 Security Implementation

#### 4.3.1 CSRF Protection
- Meta tag token generation
- X-CSRF-TOKEN header validation
- State-changing request protection

#### 4.3.2 Input Validation
- Server-side parameter validation
- SQL injection prevention
- SSRF attack mitigation

#### 4.3.3 Authentication
- Cookie-based session management
- Role-based access control
- Secure token handling

## 5. Security Specifications

### 5.1 Vulnerability Mitigations

#### 5.1.1 Resolved Issues
- **CWE-94**: Code injection prevention
- **CWE-352**: CSRF protection implementation
- **CWE-918**: SSRF attack prevention
- **Input Validation**: Comprehensive sanitization

#### 5.1.2 Access Control
- Role-based UI restrictions
- Record-level permissions
- Admin-only functionality protection

### 5.2 Role Definitions

#### 5.2.1 Admin Role
- Full system access
- User management capabilities
- Role assignment permissions
- All CRUD operations

#### 5.2.2 Editor Role
- Limited editing capabilities
- Cannot manage roles
- No user deletion rights

#### 5.2.3 Member Role
- View all records
- Edit own profile only
- No administrative functions

## 6. Performance Specifications

### 6.1 Optimizations Implemented
- DOM element caching
- Reduced query overhead
- Efficient event listener management
- Optimized JSON parsing

### 6.2 Auto-save Features
- localStorage integration
- 1-hour data retention
- Automatic form restoration
- Background save operations

## 7. Development Environment

### 7.1 Local Development
```bash
# Server startup
cd server3/s32_iodd-data-api
npm start

# Client development
# Use Live Server on port 5501
```

### 7.2 Configuration Files
- **package.json**: Node.js dependencies
- **.env files**: Environment configurations
- **browserslist**: Browser compatibility

### 7.3 Dependencies
```json
{
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5"
}
```

## 8. API Response Formats

### 8.1 Success Response
```javascript
{
  "members": [...],     // Data array
  "success": true       // Status indicator
}
```

### 8.2 Error Response
```javascript
{
  "error": "Error message",
  "success": false
}
```

## 9. Browser Compatibility

### 9.1 Production Targets
- \>0.2% market share
- Not dead browsers
- Excludes Opera Mini

### 9.2 Development Targets
- Latest Chrome
- Latest Firefox
- Latest Safari

## 10. Deployment Specifications

### 10.1 Server Requirements
- Node.js runtime
- MySQL database
- Port 54032 availability

### 10.2 Client Requirements
- Modern web browser
- JavaScript enabled
- Local storage support

## 11. Error Handling

### 11.1 Client-Side
- Null checks for DOM elements
- Try-catch blocks for async operations
- User-friendly error messages
- Graceful degradation

### 11.2 Server-Side
- HTTP status code handling
- JSON parsing error recovery
- Database connection error handling

## 12. Future Enhancements

### 12.1 Recommended Improvements
- JWT token implementation
- Environment variable configuration
- Automated testing framework
- API rate limiting
- Modern frontend framework migration

### 12.2 Technical Debt
- Legacy callback patterns
- Hardcoded localhost URLs
- Mixed authentication patterns
- Performance optimizations for large datasets

---
*Document Version: 1.0*  
*Last Updated: $(date)*  
*System Version: 0.01.010*