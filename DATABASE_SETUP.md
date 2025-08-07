# Database Setup Guide

The Resume Builder application now uses **MongoDB** for persistent data storage instead of in-memory storage.

## 🚀 Quick Setup

### 1. Install MongoDB

**Option A: Local Installation**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get connection string

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

### 4. Initialize Database
```bash
# Run the database setup script
python setup_db.py
```

### 5. Start the Application
```bash
# Start the FastAPI server
python main.py
```

## 📊 Database Schema

### Collections

#### **users**
- User account information
- Encrypted passwords
- Profile data

#### **resumes** 
- Complete resume data (JSON format)
- Template and styling settings
- Created/updated timestamps

#### **resume_versions**
- Version history for resume changes
- Automatic snapshots before edits
- Restore functionality

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `resume_builder` |
| `SECRET_KEY` | JWT signing key | *(change in production)* |
| `OPENAI_API_KEY` | OpenAI API key | *(required)* |

### MongoDB Connection Examples

**Local MongoDB:**
```
MONGODB_URL=mongodb://localhost:27017
```

**MongoDB Atlas:**
```
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
```

**Local with Authentication:**
```
MONGODB_URL=mongodb://username:password@localhost:27017/
```

## 🛡️ Data Security

### Password Security
- Passwords are hashed using bcrypt with salt
- No plaintext passwords stored
- JWT tokens for session management

### Database Security
- Unique indexes on email addresses
- User data isolation (users can only access their own data)
- Automatic data validation with Pydantic models

## 📈 Features Added

### ✅ Data Persistence
- **No more data loss** on server restart
- **User accounts** with proper authentication
- **Resume history** and version control

### ✅ Multi-Resume Support
- Users can create **multiple resumes**
- **Set default** resume
- **Copy and modify** existing resumes

### ✅ Version Control
- **Automatic versioning** before major edits
- **Restore** to previous versions
- **Track changes** over time

### ✅ Scalability
- **MongoDB indexes** for fast queries
- **Efficient data storage** with JSON documents
- **Ready for cloud deployment**

## 🔍 Health Monitoring

### Health Check Endpoint
```bash
curl http://localhost:8000/health
```

Response:
```json
{
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📡 New API Endpoints

### Resume Management
- `POST /resumes` - Create new resume
- `GET /resumes` - Get user's resumes
- `GET /resumes/{id}` - Get specific resume
- `PUT /resumes/{id}` - Update resume
- `DELETE /resumes/{id}` - Delete resume
- `POST /resumes/{id}/set-default` - Set default resume

### Version Control
- `GET /resumes/{id}/versions` - Get resume versions
- `POST /resumes/{id}/versions/{version_id}/restore` - Restore version

## 🚨 Migration from In-Memory

The application has been completely migrated from in-memory storage to MongoDB:

**Before:**
- ❌ Data lost on restart
- ❌ Single resume per session
- ❌ No user accounts
- ❌ No history/versioning

**After:**
- ✅ Persistent data storage
- ✅ Multiple resumes per user
- ✅ Full user authentication
- ✅ Resume version history

## 🛠️ Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB service status
sudo systemctl status mongodb

# Start MongoDB service
sudo systemctl start mongodb
```

**Database Setup Failed:**
```bash
# Ensure MongoDB is running
python -c "import pymongo; pymongo.MongoClient().admin.command('ping')"

# Check Python dependencies
pip install -r requirements.txt
```

**Authentication Errors:**
```bash
# Verify SECRET_KEY is set in .env
grep SECRET_KEY .env

# Generate new secret key if needed
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📦 Deployment Notes

### Production Checklist
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Generate strong `SECRET_KEY`
- [ ] Set up database backups
- [ ] Configure proper MongoDB indexes
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging

### Docker Support
The application is ready for Docker deployment with MongoDB as a service.

---

## 🎉 Success!

Your resume builder now has:
- **Persistent data storage** ✅
- **User accounts and authentication** ✅  
- **Multiple resumes per user** ✅
- **Version control and history** ✅
- **Production-ready architecture** ✅

The application is now enterprise-ready and suitable for serious use!