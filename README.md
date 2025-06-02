# BWGC Golf Stats Dashboard

A modern, responsive web application for analyzing golf tournament data from the BWGC Myrtle Beach tournament.

## 🏆 Features

- **Tournament Overview**: Complete leaderboard and tournament highlights
- **Player Statistics**: Individual performance analysis and trends
- **Course Analysis**: Difficulty comparison and best performances
- **Match Play Results**: Head-to-head competition results
- **Responsive Design**: Optimized for desktop and mobile
- **Interactive Charts**: Built with Recharts for engaging visualizations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom golf-themed colors
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bwgc-golf-stats.git
cd bwgc-golf-stats
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Data Pipeline

The application uses a comprehensive data processing pipeline:

1. **Raw Data** (`myrtleScores.csv`) 
2. **Data Cleaning** (`python3 clean_data.py`)
3. **Advanced Analytics** (`python3 calculate_stats.py`)
4. **Web Dashboard** (This Next.js app)

## 🎯 Tournament Data

- **8 Players**: Jimbo, Mike, Dave, Ryan, AJ, Nixon, Todd, Doug
- **4 Days**: Multiple tournament formats
- **3 Courses**: Myrtle Beach National, Barefoot Dye, Aberdeen CC, Arcadian Shores
- **Multiple Formats**: Scramble, Match Play, Best Ball, Stableford

## 📱 Responsive Design

The dashboard is fully responsive with:
- Mobile-first design approach
- Touch-friendly navigation
- Optimized chart displays for all screen sizes
- Progressive enhancement

## 🚢 Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

This will build the application and deploy it to the `gh-pages` branch.

## 📁 Project Structure

```
src/
├── components/
│   ├── charts/          # Reusable chart components
│   ├── layout/          # Layout and page components
│   └── ui/              # UI components (cards, tabs, etc.)
├── pages/               # Next.js pages
├── styles/              # Global styles and Tailwind config
└── utils/               # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🏌️ About BWGC

BWGC (Banana Boys Golf Club) is a group of golf enthusiasts who love data, analytics, and friendly competition. This dashboard transforms our tournament data into engaging visualizations and insights.

---

*Built with ❤️ and lots of golf data*