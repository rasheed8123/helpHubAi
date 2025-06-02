# HelpHub AI - Intelligent Helpdesk Portal

## 🚀 Live

**Live Site:** [https://th.netlify.app]([https://th.netlify.app](https://misogihelpdeskai.netlify.app/))


HelpHub AI is a modern, AI-powered internal helpdesk portal that streamlines ticket management and support processes. Built with React, Node.js, and MongoDB, it leverages advanced AI capabilities to provide intelligent ticket routing, automated responses, and predictive analytics.

## 🌟 Key Features

### 1. AI-Powered Ticket Management
- **Smart Ticket Classification**: Automatically categorizes tickets using OpenAI's GPT models
- **Time Traveler Preview**: Predicts ticket resolution time and involved departments
- **Response Suggestions**: AI-generated response templates based on ticket context
- **Voice Ticket Creation**: Convert speech to structured tickets using Google's Gemini AI
- **AI Summary Generator**: Automatically generates concise summaries of tickets and their history
- **Mood Analysis**: Detects user sentiment and emotional tone in tickets
- **Multi-Language Summaries**: 
  - Generate summaries in 20+ languages
  - Powered by Hugging Face's Helsinki-NLP models
  - Support for global and Indian regional languages
  - Real-time translation with high accuracy
  - Technical terminology support

### 2. Dual AI Chat System
- **Public Assistant**:
  - Available on landing page for immediate support
  - Handles general queries and FAQs
  - Provides system information
  - Offers pre-login guidance
  - Basic troubleshooting support

- **Authenticated Assistant**:
  - Personalized support with user context
  - Access to user's ticket history
  - Department-specific guidance
  - Real-time ticket updates
  - Enhanced response capabilities

### 3. Role-Based Access Control
- **Employee Portal**: Submit and track tickets
- **IT Support**: Handle technical issues
- **HR Support**: Manage personnel-related queries
- **Admin Dashboard**: Oversee system operations
- **Super Admin**: Full system control

### 4. Advanced Features
- **Ticket Analytics**: Comprehensive dashboard with insights
- **File Attachments**: Support for multiple file types
- **Status Tracking**: Detailed ticket history and updates
- **Email Notifications**: Automated status updates
- **Smart Summaries**: AI-generated executive summaries for quick overview
- **Emotional Intelligence**: Mood tracking and sentiment analysis for better support
- **Face Verification System**:
  - Secure password reset using face recognition
  - Face image capture during user creation
  - Advanced face detection and recognition
  - Multiple face detection with best face selection
  - Configurable verification thresholds

## 🛠️ Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Components**: Shadcn UI
- **State Management**: React Query
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Email Service**: Resend

### AI Integration
- **OpenAI**: GPT models for ticket classification and response generation
- **Google Gemini**: Voice processing and chat assistance
- **Hugging Face**: (Planned) Sentiment analysis and multilingual support

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn
- API keys for:
  - OpenAI
  - Google Gemini
  - Cloudinary
  - Resend

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rasheed8123/helpHubAi.git
cd helphub-ai
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Set up environment variables:
```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key

# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helphub
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_key
```

5. Start the development servers:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

## 📱 Application Flow

### Ticket Creation
1. User submits ticket (text or voice)
2. AI classifies ticket category
3. System assigns priority based on content
4. Ticket is routed to appropriate department
5. Time Traveler preview shows estimated resolution time

### Ticket Processing
1. Support staff receives notification
2. AI suggests response templates
3. Staff can add internal notes
4. Status updates trigger notifications
5. Resolution is tracked and documented

### Analytics and Reporting
1. Real-time dashboard updates
2. Department performance metrics
3. Resolution time tracking
4. User satisfaction monitoring
5. AI-driven insights

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- Secure file handling
- Data encryption

## 🤖 AI Features

### Ticket Classification
- Category prediction
- Priority assessment
- Department routing
- Duplicate detection
- Mood analysis (angry, frustrated, urgent, satisfied, neutral)

### Response Generation
- Context-aware suggestions
- Tone adaptation
- Multi-language support
- Sentiment analysis
- Emotional intelligence in responses

### Voice Processing
- Speech-to-text conversion
- Intent recognition
- Structured ticket creation
- Natural language understanding

### Smart Summarization
- Executive summaries of tickets
- Historical context summarization
- Key points extraction
- Action item highlighting
- Resolution tracking
- **Multi-language Support**:
  - Generate summaries in multiple languages
  - Language selection interface
  - Download summaries in PDF format
  - Support for 50+ languages
  - Real-time translation using Hugging Face models

### AI Chat Assistants
- **Public Assistant**:
  - General support queries
  - System information
  - Pre-login guidance
  - Basic troubleshooting
  - FAQ responses

- **Authenticated Assistant**:
  - Personalized support
  - Ticket history access
  - Context-aware responses
  - Department-specific guidance
  - Real-time ticket updates

## 📈 Future Enhancements

1. **Hugging Face Integration**
   - Sentiment analysis
   - Multilingual support
   - Topic classification
   - Text summarization

2. **Advanced Analytics**
   - Predictive maintenance
   - Trend analysis
   - Performance optimization
   - Resource allocation

3. **Mobile Application**
   - Native mobile app
   - Push notifications
   - Offline support
   - Camera integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenAI for GPT models
- Google for Gemini AI
- Shadcn UI for components
- MongoDB for database
- Cloudinary for file storage

## Multi-Language Support

HelpHub AI provides comprehensive multi-language support for ticket summaries and communications. The system uses Hugging Face's state-of-the-art translation models to ensure accurate and natural translations.

### Supported Languages

The system supports 20 languages, including major global languages and Indian regional languages:

- English (default)
- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Chinese
- Japanese
- Korean
- Arabic
- Hindi
- Bengali
- Tamil
- Telugu
- Marathi
- Gujarati
- Kannada
- Malayalam
- Punjabi

### Translation Technology

The translation service is powered by Hugging Face's Helsinki-NLP models, specifically:

- `Helsinki-NLP/opus-mt-en-*` series for English to other languages
- Each model is specifically trained for its language pair
- High-quality neural machine translation
- Support for technical and domain-specific terminology

### Usage

To use the translation feature:

1. Set up your Hugging Face API key in the `.env` file:
```env
HUGGINGFACE_API_KEY=your_api_key_here
```

2. The translation service is automatically integrated with:
   - Ticket summaries
   - Communication templates
   - User interface elements

3. API Endpoints:
   - `GET /api/translation/languages` - Get list of supported languages
   - `POST /api/translation/translate` - Translate text to target language

### Example API Usage

```javascript
// Get supported languages
const response = await fetch('/api/translation/languages');
const languages = await response.json();

// Translate text
const translation = await fetch('/api/translation/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Your text to translate',
    targetLanguage: 'es' // Language code
  })
});
```

## Face Verification System

The portal includes a secure face verification system for password resets and user authentication:

### Technical Implementation
- **Face Detection**: Uses face-api.js with Tiny Face Detector model
- **Face Recognition**: Implements face-api.js Face Recognition model
- **Face Landmarks**: Utilizes 68-point facial landmark detection
- **Model Files Required**:
  - `tiny_face_detector_model-weights_manifest.json`
  - `tiny_face_detector_model-shard1`
  - `face_landmark_68_model-weights_manifest.json`
  - `face_landmark_68_model-shard1`
  - `face_recognition_model-weights_manifest.json`
  - `face_recognition_model-shard1`
  - `face_recognition_model-shard2`

### Local Setup Requirements

1. **Install Dependencies**:
```bash
# Install required packages
npm install face-api.js canvas
```

2. **Download Models**:
```bash
# Run the model download script
cd server
node scripts/downloadModels.js
```

3. **Environment Configuration**:
Add the following to your `.env` file:
```env
# Face Verification Settings
FACE_VERIFICATION_THRESHOLD=0.6  # Lower value = stricter matching
FACE_DETECTION_SCORE_THRESHOLD=0.3  # Minimum confidence for face detection
```

4. **Directory Structure**:
Ensure the following directories exist:
```
server/
  ├── models/           # Face detection models
  ├── uploads/
  │   └── faces/       # User face images
  └── scripts/
      └── downloadModels.js
```
