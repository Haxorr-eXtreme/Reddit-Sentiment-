# Sentiment Analysis Dashboard

A comprehensive sentiment analysis application built with Next.js frontend and FastAPI backend, featuring a BERT-based machine learning model for analyzing text sentiment across multiple platforms.

##  Features

### Core Functionality
- **Single Text Analysis**: Analyze sentiment of individual text inputs
- **Batch Analysis**: Process multiple texts from CSV files
- **Reddit Analysis**: Extract and analyze sentiment from Reddit posts
- **Twitter Analysis**: Scrape and analyze Twitter sentiment
- **Real-time Dashboard**: Interactive dashboard with visualizations and analytics

### Technical Features
- **BERT Model**: Advanced transformer-based sentiment analysis
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Responsive Design**: Mobile-friendly interface with dark/light mode
- **Real-time Processing**: Fast API backend with async processing
- **Data Visualization**: Charts and graphs for sentiment insights
- **CSV Export**: Download analysis results

##  Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Chart.js/Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face transformers
- **BERT** - Pre-trained language model
- **PRAW** - Reddit API wrapper
- **snscrape** - Social media scraping
- **Pandas** - Data manipulation

##  Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.8+
- CUDA-compatible GPU (optional, for faster inference)

##  Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sentiment-analysis-dashboard.git
cd sentiment-analysis-dashboard
```

### 2. Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
# From the root directory
npm install
# or
pnpm install
```

### 4. Model Setup
Ensure you have the BERT sentiment model in the `sentiment-model/` directory. The model should be compatible with Hugging Face transformers.

##  Running the Application

### Start the Backend
```bash
cd Backend
python main.py
```
The API will be available at `http://localhost:8000`

### Start the Frontend
```bash
npm run dev
# or
pnpm dev
```
The application will be available at `http://localhost:3000`

##  API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints
- `POST /predict` - Analyze single text sentiment
- `POST /api/analyze-batch` - Analyze CSV file
- `GET /reddit/{query}` - Analyze Reddit posts
- `GET /api/twitter/{query}` - Analyze Twitter posts

##  Usage

### Single Text Analysis
1. Navigate to "Single Analysis" in the dashboard
2. Enter your text in the input field
3. Click "Analyze" to get sentiment results

### Batch Analysis
1. Go to "Batch Analysis" page
2. Upload a CSV file with a 'text' column
3. Download results as CSV

### Reddit Analysis
1. Visit "Reddit Analysis" page
2. Enter search query
3. View sentiment analysis of Reddit posts

### Twitter Analysis
1. Access "Twitter Analysis" page
2. Enter search terms
3. Analyze sentiment of tweets

##  Dashboard Features

- **Sentiment Overview**: Visual summary of analysis results
- **Recent Analyses**: History of previous analyses
- **Interactive Charts**: Real-time data visualization
- **Export Options**: Download results in various formats
- **Dark/Light Mode**: Toggle between themes

##  Configuration

### Reddit API Setup
Update the Reddit credentials in `Backend/main.py`:
```python
reddit = praw.Reddit(
    client_id="your_client_id",
    client_secret="your_client_secret",
    user_agent="your_user_agent"
)
```

### Model Configuration
The BERT model is loaded from the `sentiment-model/` directory. Ensure your model files are properly placed there.

##  Project Structure

```
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── batch-analysis/    # Batch analysis page
│   ├── reddit-analysis/   # Reddit analysis page
│   ├── single-analysis/   # Single analysis page
│   └── twitter-analysis/  # Twitter analysis page
├── Backend/               # FastAPI backend
│   ├── main.py           # Main API server
│   └── requirements.txt  # Python dependencies
├── components/           # React components
│   ├── ui/              # UI components
│   └── ...              # Feature components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── public/              # Static assets
└── sentiment-model/     # BERT model files
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Hugging Face](https://huggingface.co/) for the BERT model
- [Next.js](https://nextjs.org/) for the React framework
- [FastAPI](https://fastapi.tiangolo.com/) for the Python backend
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for components

##  Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This is a Final Year Project (FYP) demonstrating advanced sentiment analysis capabilities with modern web technologies.
