// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the resume_builder database
db = db.getSiblingDB('resume_builder');

// Create a user for the application
db.createUser({
  user: 'resume_app',
  pwd: 'app_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'resume_builder'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('resumes');
db.createCollection('sessions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });
db.users.createIndex({ "is_active": 1 });

db.resumes.createIndex({ "user_id": 1 });
db.resumes.createIndex({ "created_at": 1 });
db.resumes.createIndex({ "updated_at": 1 });

db.sessions.createIndex({ "user_id": 1 });
db.sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

print('Database initialization completed successfully!');
print('Created database: resume_builder');
print('Created user: resume_app');
print('Created collections: users, resumes, sessions');
print('Created indexes for performance optimization');