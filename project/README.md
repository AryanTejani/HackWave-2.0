# HackWave 2.0 - Supply Chain Risk Detection Platform

A sophisticated supply chain risk detection and monitoring platform built with Next.js 15, featuring AI-powered multi-agent analysis for real-time risk assessment and strategic recommendations.

## 🚀 Features

- **Multi-Agent AI System**: Risk Monitor, Impact Simulator, and Strategy Recommender agents
- **Real-time Shipment Tracking**: Monitor shipments with live status updates
- **Risk Detection**: AI-powered alerts for supply chain disruptions
- **Interactive Dashboards**: Beautiful visualizations of supply chain data
- **Demo Data**: Comprehensive demo dataset for testing and demonstration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
- **Charts**: Recharts

## 📦 Demo Data

The application includes comprehensive demo data:

- **10 Products**: Realistic electronics products with suppliers and specifications
- **10 Shipments**: Various shipment scenarios with different statuses and risk factors
- **3 Risk Alerts**: Current supply chain risk scenarios (Red Sea, Shanghai Port, Panama Canal)

### Demo Data Structure

```
src/lib/demo-data/
├── products.ts      # Product catalog with suppliers
├── shipments.ts     # Shipment tracking data
├── risk-alerts.ts   # Supply chain risk alerts
├── index.ts         # Export utilities
└── seeder.ts        # Database seeding utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackWave-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_nextauth_secret
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Demo Data Setup

### Option 1: Use Demo Data (Default)
The application currently uses demo data by default. No additional setup required.

### Option 2: Seed Database
To populate your MongoDB database with demo data:

```bash
# Check current data status
curl http://localhost:3000/api/seed

# Seed demo data
curl -X POST http://localhost:3000/api/seed
```

### Option 3: Switch to Database
To use the database instead of demo data, update the API routes:

1. Uncomment database code in `/api/shipments/route.ts`
2. Uncomment database code in `/api/alerts/route.ts`
3. Comment out demo data imports

## 🧭 Navigation

- **Home** (`/`): Landing page with feature overview
- **Dashboard** (`/dashboard`): Main supply chain monitoring dashboard
- **AI Dashboard** (`/ai-dashboard`): Multi-agent AI analysis interface
- **Admin Dashboard** (`/admin-dashboard`): Administrative interface

## 🤖 AI Features

### Multi-Agent System
1. **Risk Monitor Agent**: Detects geopolitical, weather, and trade disruptions
2. **Impact Simulator Agent**: Calculates disruption impact on shipments and costs
3. **Strategy Recommender Agent**: Provides actionable recommendations

### What-If Simulations
Test different supply chain scenarios and get AI-powered impact analysis.

## 📈 Key Metrics

- Real-time shipment tracking
- Risk level assessment
- Cost impact calculations
- Alternative route recommendations
- Strategic action plans

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main dashboard
│   ├── ai-dashboard/      # AI analysis interface
│   ├── admin-dashboard/   # Admin interface
│   └── api/              # API routes
├── components/            # React components
├── lib/                   # Utilities and configurations
│   ├── demo-data/        # Demo data sets
│   └── multi-agent-system.ts
└── models/               # MongoDB models
```

### Adding New Demo Data

1. **Products**: Add to `src/lib/demo-data/products.ts`
2. **Shipments**: Add to `src/lib/demo-data/shipments.ts`
3. **Risk Alerts**: Add to `src/lib/demo-data/risk-alerts.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform supporting Next.js.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.
