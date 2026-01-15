// Centralized role-based permissions and UI controls
class RolePermissions {
    // Core permission functions
    static canEditApplicationRole(role) {
       return role === 'Admin';
    }
    
    static canEditRecord(role, currentUserId, targetUserId) {
          if (role === 'Admin') {
       return true;
          }
          if (role === 'Member') {
       return currentUserId === targetUserId;
          }
       return role === 'Editor';
    }
    
    static canViewRecord(role, currentUserId, targetUserId) {
        // Members can view all records but only edit their own
       return true;
    }
    
    static getButtonVisibility(role, currentUserId, targetUserId) {
        const isOwnRecord = currentUserId === targetUserId;
        
          if (role === 'Member') { return { add: false, delete: false, submit: isOwnRecord, cancel: isOwnRecord }; }
          if (role === 'Editor') { return { add: false, delete: false, submit: true,         cancel: true };       }
               /* Admin only */    return { add: true,  delete: true,  submit: true,         cancel: true };       
    }
    
    static shouldDisableSubmitButton(role, currentUserId, targetUserId) {
          if (role === 'Member') { return currentUserId !== targetUserId;
          }
       return false; // Admin, Editor always enabled
    }
    
    static shouldDisableFormFields(role, currentUserId, targetUserId) {
       return role === 'Member' && currentUserId !== targetUserId;
    }
    
    // UI Control Functions
    static async applyRoleBasedUI() {
        let userRole, currentUserId;
        
        // Try JWT first
        try {
            userRole = await acmJWTFetch('user_role');
            currentUserId = await acmJWTFetch('user_no');
            console.log('JWT SUCCESS - Role:', userRole, 'UserId:', currentUserId);
        } catch (error) {
            console.log('JWT fetch failed in applyRoleBasedUI:', error.message);
            userRole = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getRole() : null) || window.gRole || window.parent?.gRole;
            currentUserId = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getMemberId() : null) || window.gMemberId || window.parent?.gMemberId;
            console.log('FALLBACK - Role:', userRole, 'UserId:', currentUserId);
        }
        
        console.log('=== ROLE PERMISSIONS DEBUG ===');
        console.log('Final Role:', userRole, 'Final UserId:', currentUserId);
        console.log('GlobalAuth available:', typeof GlobalAuth !== 'undefined');
        console.log('window.gRole:', window.gRole);
        console.log('window.gMemberId:', window.gMemberId);
          
        // Get buttons
        const addBtn    = document.getElementById('addBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        // Show all buttons for Admin, apply restrictions for others
      if (userRole === 'Admin') {
          if (addBtn   ) addBtn.style.display    = 'inline-block';
          if (deleteBtn) deleteBtn.style.display = 'inline-block';
          if (submitBtn) submitBtn.style.display = 'inline-block';
          if (cancelBtn) cancelBtn.style.display = 'inline-block';
              console.log('Admin role - all buttons visible');
          return;
      }
        
        // Use Member as fallback for security
        const effectiveRole = userRole || 'Member';
        
        // Force hide Add/Delete for Member and Editor roles
      if (effectiveRole === 'Member' || effectiveRole === 'Editor') {
          if (addBtn   ) { addBtn.style.display    = 'none'; }
          if (deleteBtn) { deleteBtn.style.display = 'none'; }
              console.log('Forced hiding Add/Delete buttons for role:', effectiveRole);
        }
        
        const buttonVisibility = this.getButtonVisibility(effectiveRole, currentUserId, null);
              console.log('Button visibility for role', effectiveRole, ':', buttonVisibility);
        
          if (addBtn) {
              addBtn.style.display = buttonVisibility.add ? 'inline-block' : 'none';
              console.log('Add button display set to:',    addBtn.style.display);
          }
          if (deleteBtn) {
              deleteBtn.style.display = buttonVisibility.delete ? 'inline-block' : 'none';
              console.log('Delete button display set to:', deleteBtn.style.display);
          }
          if (submitBtn) {
              submitBtn.style.display = buttonVisibility.submit ? 'inline-block' : 'none';
              console.log('Submit button display set to:', submitBtn.style.display);
          }
          if (cancelBtn) {
              cancelBtn.style.display = buttonVisibility.cancel ? 'inline-block' : 'none';
              console.log('Cancel button display set to:', cancelBtn.style.display);
          }
    }
    
    static async applyFormPermissions(member) {
        let userRole, currentUserId;
        
        try {
            userRole = await acmJWTFetch('user_role');
            currentUserId = await acmJWTFetch('user_no');
        } catch (error) {
            console.log('JWT fetch failed in applyFormPermissions, using fallback');
            userRole = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getRole() : null) || window.gRole || window.parent?.gRole;
            currentUserId = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getMemberId() : null) || window.gMemberId || window.parent?.gMemberId;
        }
        const targetUserId  = member?.MemberNo;
        
              console.log('applyFormPermissions - Role:', userRole, 'CurrentUserId:', currentUserId, 'TargetUserId:', targetUserId);
        
        // Admin gets full permissions
          if (userRole === 'Admin') {
            // Enable all form fields
        const formFields = ['firstName', 'lastName', 'email', 'phone1', 'phone2', 'company', 'address1', 'address2', 'city', 'state', 'zip', 'country', 'website'];
              formFields.forEach(fieldId => {
              const field = document.getElementById(fieldId);
                if (field) field.disabled = false;
              });
            
            // Enable Application Role dropdown
        const roleField = document.getElementById('applicationRole');
          if (roleField) roleField.disabled = false;
            
            // Enable submit button
        const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) submitBtn.disabled = false;
            
            // Show all buttons
        const addBtn    = document.getElementById('addBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const cancelBtn = document.getElementById('cancelBtn');

          if (addBtn   ) addBtn.style.display    = 'inline-block';
          if (deleteBtn) deleteBtn.style.display = 'inline-block';
          if (submitBtn) submitBtn.style.display = 'inline-block';
          if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
              console.log('Admin role - full permissions applied');
          return;
          }
        
        // If role is undefined, treat as Member for security
        const effectiveRole = userRole || 'Member';
        
        // Form field permissions
        const shouldDisableFields = this.shouldDisableFormFields(effectiveRole, currentUserId, targetUserId);
        const formFields = ['firstName', 'lastName', 'email', 'phone1', 'phone2', 'company', 'address1', 'address2', 'city', 'state', 'zip', 'country', 'website'];
              formFields.forEach(fieldId => {
                 const field = document.getElementById(fieldId);
                   if (field) field.disabled = shouldDisableFields;
              });
        
        // Application Role dropdown permissions - always disabled for Members and Editors
        const roleField = document.getElementById('applicationRole');
          if (roleField) roleField.disabled = effectiveRole === 'Member' || effectiveRole === 'Editor' || !this.canEditApplicationRole(effectiveRole);
        
        // Submit button permissions
        const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) submitBtn.disabled = this.shouldDisableSubmitButton(effectiveRole, currentUserId, targetUserId);
        
        // Button visibility for specific record
        const buttonVisibility = this.getButtonVisibility(effectiveRole, currentUserId, targetUserId);
        const addBtn    = document.getElementById('addBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
          if (addBtn   ) addBtn.style.display    = buttonVisibility.add    ? 'inline-block' : 'none';
          if (deleteBtn) deleteBtn.style.display = buttonVisibility.delete ? 'inline-block' : 'none';
          if (submitBtn) submitBtn.style.display = buttonVisibility.submit ? 'inline-block' : 'none';
          if (cancelBtn) cancelBtn.style.display = buttonVisibility.cancel ? 'inline-block' : 'none';
    }
    
    static async checkRecordAccess(member) {
        let userRole, currentUserId;
        try {
            userRole = await acmJWTFetch('user_role');
            currentUserId = await acmJWTFetch('user_no');
        } catch (error) {
            console.log('JWT fetch failed in checkRecordAccess, using fallback');
            userRole = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getRole() : null) || window.gRole || window.parent?.gRole;
            currentUserId = (typeof GlobalAuth !== 'undefined' ? GlobalAuth?.getMemberId() : null) || window.gMemberId || window.parent?.gMemberId;
        }
        const effectiveRole = userRole || 'Member';
        
        // Members can view all records, just can't edit others
         if (!this.canViewRecord(effectiveRole, currentUserId, member.MemberNo)) {
     return { allowed: false, message: 'You do not have permission to view this record' };
        }
        
     return { allowed: true };
     }
    
    // Force hide buttons for testing
    static forceHideButtons() {
        const addBtn     = document.getElementById('addBtn');
        const deleteBtn  = document.getElementById('deleteBtn');
          if (addBtn   ) { addBtn.style.display    = 'none'; }
          if (deleteBtn) { deleteBtn.style.display = 'none'; }
              console.log('Buttons force hidden');
    }
    
    // Set test role for immediate testing
    static async setTestRole(role) {
              await acmJWTPost('user_role', role);
              console.log('Test role set to:', role);
         await this.applyRoleBasedUI();
    }
}

// Make RolePermissions globally available
window.RolePermissions = RolePermissions;

// Make test function globally available
window.setTestRole = async function(role) { await RolePermissions.setTestRole(role); };