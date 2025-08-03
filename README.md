# AI-Powered Resume Builder

A comprehensive resume builder application with React frontend, FastAPI backend, and OpenAI integration. Build, parse, and optimize resumes using AI assistance.

## Features

- 📄 **Upload & Parse Resumes**: Support for PDF, DOCX, and TXT files
- 🚀 **Generate from Job Description**: Create tailored resumes based on job postings
- ✏️ **Build from Scratch**: Interactive resume editor
- 🤖 **AI Optimization**: Optimize resumes for specific job descriptions using OpenAI
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🖨️ **Print/PDF Export**: Generate printable resumes

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI API**: GPT-powered resume processing
- **PyPDF2**: PDF text extraction
- **python-docx**: Word document processing
- **Pydantic**: Data validation and serialization

### Frontend
- **React + TypeScript**: Modern web development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

## Project Structure

```
resume-builder/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app entry point
│   ├── models.py           # Pydantic models
│   ├── openai_service.py   # OpenAI integration
│   ├── file_parser.py      # File parsing utilities
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind configuration
└── README.md               # This file
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd resume-builder/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

6. Start the backend server:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd resume-builder/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Usage

### 1. Upload Existing Resume
- Go to the home page
- Select "Upload Existing Resume"
- Choose a PDF, DOCX, or TXT file
- The AI will parse and structure your resume

### 2. Generate from Job Description
- Paste a job description
- Add your background information (optional)
- The AI will create a tailored resume template

### 3. Build from Scratch
- Start with a blank resume
- Use the interactive editor to add sections
- Preview and optimize as needed

### 4. Optimize for Job
- Upload or create a resume
- Provide a job description
- The AI will optimize your resume for that specific role

## API Endpoints

- `POST /parse-resume`: Parse uploaded resume file
- `POST /optimize-resume`: Optimize resume for job description  
- `POST /generate-resume`: Generate resume from job description

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
PORT=8000
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend can be deployed with uvicorn
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **OpenAI API Key**: Make sure your API key is valid and has sufficient credits
2. **File Upload**: Ensure files are in supported formats (PDF, DOCX, TXT)
3. **CORS Issues**: The backend is configured to allow localhost origins
4. **Dependencies**: Make sure all dependencies are installed correctly

### Getting Help

- Check the console for error messages
- Verify your OpenAI API key is working
- Ensure both frontend and backend are running
- Check that the API base URL is correct in the frontend

## Future Enhancements

- [ ] Multiple resume templates
- [ ] Real-time collaboration
- [ ] Resume analytics and scoring
- [ ] Integration with job boards
- [ ] LinkedIn import
- [ ] Multi-language support
- [ ] Resume version history
- [ ] ATS compatibility checker
