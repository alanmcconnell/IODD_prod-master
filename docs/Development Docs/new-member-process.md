# New Member Registration Process

## Overview
This document outlines the process for integrating IODD webapp with the SecuredAccess (SA) webapp for new member registration. When users register through SA, they will be automatically redirected back to IODD with their information to create a new member record.

## Architecture
- **IODD**: Main webapp with member database
- **SA**: SecuredAccess webapp for authentication and registration
- **Databases**: Separate databases (no shared database)
- **Communication**: URL parameters with JWT tokens for security

## Process Flow

### 1. User Registration Journey
1. User clicks "Register" button on IODD webapp
2. User is redirected to SA webapp registration page
3. User completes registration in SA webapp
4. SA webapp creates user account in SA database
5. SA webapp redirects user back to IODD with encrypted user data
6. IODD webapp receives user data and creates new member record
7. User is logged in and redirected to member profile page

### 2. Implementation Approaches

#### Option A: JWT Token Approach (Recommended)
**Pros**: Secure, tamper-proof, industry standard
**Cons**: Requires JWT library on both sides

**Flow**:
1. SA creates JWT token containing user data
2. SA redirects to IODD with token in URL parameter
3. IODD validates and decodes JWT token
4. IODD creates member record from token data

#### Option B: Encrypted URL Parameters
**Pros**: Simple implementation
**Cons**: URL length limitations, less secure

**Flow**:
1. SA encrypts user data using shared secret
2. SA redirects to IODD with encrypted data in URL
3. IODD decrypts data using shared secret
4. IODD creates member record

#### Option C: Server-to-Server API Call
**Pros**: Most secure, no URL limitations
**Cons**: More complex, requires webhook handling

**Flow**:
1. SA creates user account
2. SA makes API call to IODD with user data
3. IODD creates member record and returns member ID
4. SA redirects user to IODD with member ID

## Recommended Implementation (JWT Approach)

### 1. Shared Configuration
Both IODD and SA need:
- Shared JWT secret key
- Agreed upon redirect URLs
- User data field mapping

### 2. SA Webapp Changes
**Registration Success Handler**:
```javascript
// After successful registration in SA
const userData = {
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  registrationDate: new Date().toISOString(),
  source: 'SA_REGISTRATION'
};

// Create JWT token
const jwt = require('jsonwebtoken');
const token = jwt.sign(userData, SHARED_JWT_SECRET, { expiresIn: '10m' });

// Redirect to IODD
const redirectUrl = `${IODD_BASE_URL}/new-member-callback?token=${token}`;
res.redirect(redirectUrl);
```

### 3. IODD Webapp Changes

#### New Route Handler
Create new route: `/new-member-callback`

```javascript
app.get('/new-member-callback', async (req, res) => {
  try {
    const { token } = req.query;
    
    // Validate JWT token
    const jwt = require('jsonwebtoken');
    const userData = jwt.verify(token, SHARED_JWT_SECRET);
    
    // Create new member record
    const newMember = await createMemberFromSA(userData);
    
    // Set authentication session
    req.session.memberId = newMember.id;
    req.session.memberEmail = newMember.email;
    
    // Redirect to member profile
    res.redirect('/member-profile.html?welcome=true');
    
  } catch (error) {
    console.error('New member creation failed:', error);
    res.redirect('/index.html?error=registration_failed');
  }
});
```

#### Database Function
```javascript
async function createMemberFromSA(userData) {
  const memberData = {
    FirstName: userData.firstName,
    LastName: userData.lastName,
    Email: userData.email,
    UserName: userData.email, // Use email as username
    RegistrationDate: userData.registrationDate,
    Source: 'SA_REGISTRATION',
    Status: 'Active',
    RoleId: 2 // Default member role
  };
  
  // Insert into IODD database
  const result = await db.query(
    'INSERT INTO Members SET ?', 
    memberData
  );
  
  return {
    id: result.insertId,
    email: memberData.Email,
    ...memberData
  };
}
```

### 4. Security Considerations

#### JWT Token Security
- Use strong secret key (minimum 256 bits)
- Set short expiration time (5-10 minutes)
- Validate token signature and expiration
- Use HTTPS for all redirects

#### Data Validation
- Validate all incoming user data
- Sanitize inputs before database insertion
- Check for duplicate email addresses
- Implement rate limiting on callback endpoint

#### Error Handling
- Log all registration attempts
- Handle token expiration gracefully
- Provide user-friendly error messages
- Implement fallback registration process

### 5. Configuration Files

#### IODD Environment Variables
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_shared_with_SA
SA_BASE_URL=https://securedaccess.com
IODD_BASE_URL=https://iodd.com

# New Member Defaults
DEFAULT_MEMBER_ROLE_ID=2
NEW_MEMBER_STATUS=Active
```

#### SA Environment Variables
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_shared_with_SA
IODD_BASE_URL=https://iodd.com
IODD_CALLBACK_URL=https://iodd.com/new-member-callback
```

### 6. Testing Scenarios

#### Success Cases
1. Valid registration with all required fields
2. User with existing email (handle gracefully)
3. Token validation and member creation
4. Proper redirect to member profile

#### Error Cases
1. Expired JWT token
2. Invalid JWT signature
3. Missing required user data
4. Database connection failures
5. Duplicate email handling

### 7. Monitoring and Logging

#### Log Events
- New member registration attempts
- JWT token validation results
- Database insertion success/failures
- Redirect URLs and parameters

#### Metrics to Track
- Registration completion rate
- Token expiration failures
- Database insertion errors
- User journey completion time

## Alternative Implementations

### Simple URL Parameter Approach
If JWT is not feasible, use encrypted URL parameters:

```javascript
// SA side - encrypt data
const crypto = require('crypto');
const userData = JSON.stringify({firstName, lastName, email});
const encrypted = crypto.createCipher('aes192', SHARED_SECRET).update(userData, 'utf8', 'hex');
const redirectUrl = `${IODD_BASE_URL}/new-member-callback?data=${encrypted}`;

// IODD side - decrypt data
const decrypted = crypto.createDecipher('aes192', SHARED_SECRET).update(encryptedData, 'hex', 'utf8');
const userData = JSON.parse(decrypted);
```

### API Webhook Approach
For maximum security, implement server-to-server communication:

```javascript
// SA side - API call to IODD
const response = await fetch(`${IODD_API_URL}/create-member`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userData)
});

const result = await response.json();
// Redirect user with member ID
res.redirect(`${IODD_BASE_URL}/welcome?memberId=${result.memberId}`);
```

## Deployment Checklist

### Pre-Deployment
- [ ] Configure shared JWT secret
- [ ] Set up environment variables
- [ ] Create database migration for new fields
- [ ] Implement error logging
- [ ] Set up monitoring alerts

### Testing
- [ ] Test complete registration flow
- [ ] Verify JWT token validation
- [ ] Test error scenarios
- [ ] Validate database record creation
- [ ] Check redirect URLs

### Post-Deployment
- [ ] Monitor registration success rates
- [ ] Check error logs
- [ ] Verify user experience
- [ ] Test with different browsers
- [ ] Validate security measures

## Maintenance

### Regular Tasks
- Rotate JWT secrets periodically
- Monitor registration analytics
- Update error handling as needed
- Review security logs
- Test integration after updates

### Troubleshooting
- Check JWT secret synchronization
- Verify redirect URL configuration
- Monitor database connection health
- Review user data validation rules
- Check HTTPS certificate validity

## Conclusion

This integration allows seamless user registration between SA and IODD webapps while maintaining separate databases and security boundaries. The JWT token approach provides the best balance of security and simplicity for this use case.