// Load all custom endpoints

module.exports = function(app, db) {
    // Load the webpage_project_info_view endpoint
    require('./webpage_project_info_view-endpoint')(app, db);
    
    // Load the webpage_project_members_view endpoint
    require('./webpage_project_members_view-endpoint')(app, db);
    
    // Load the count endpoints
    require('./count-endpoints')(app, db);
    
    console.log('Custom endpoints loaded successfully');
};