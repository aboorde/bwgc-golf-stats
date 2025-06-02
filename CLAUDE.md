# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **fully functional golf analytics web application** for BWGC (Banana Boys Golf Club) featuring comprehensive tournament data and interactive visualizations for a 4-day Myrtle Beach golf trip. The project has evolved from raw data processing into a complete Next.js web application with dark mode UI, interactive charts, and detailed analytics dashboards.

## Critical Rules - DO NOT VIOLATE

- **NEVER create mock data** unless explicitly told to do so
- **ALWAYS find and fix the root cause** of issues instead of creating workarounds
- When debugging issues, focus on fixing the existing implementation, not replacing it
- When something doesn't work, debug and fix it - don't start over with a simple version

**MANDATORY BEHAVIOR:**
1. **Acknowledge limitations**: Always state explicitly when files are too large to read completely. Never pretend to have read the entire file if you couldn't.
2. **Always explain WHY before suggesting changes** - provide clear reasoning for any proposed improvements

**ALLOWED:** 
- Suggesting improvements IF you explain the specific benefits and risks clearly
- Asking "I notice X, would it be beneficial to fix this because Y?"

1. **Evidence-based responses only**: Never claim arelationship without direct evidence from the code.
 
2. **Clear source tracking**: Always cite line numbers and file paths for any statements about code structure.
 
3. **Query limitations**: State what you were not able to check, and what searches might still be needed for complete confidence.
 
4. **Confidence levels**: Use explicit confidence indicators:
   - "Confirmed" (when directly observed in code)
   - "Likely" (when inferred from strong evidence)
   - "Possible" (when suggested by partial evidence)
   - "Unknown" (when no evidence was found)

## Development Commands

### Web Application (Primary)
```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Data Processing (if data needs updating)
```bash
# Clean and extract structured data from raw tournament scores
python3 clean_data.py

# Calculate advanced statistics and analytics
python3 calculate_stats.py
```

## Current File Structure

```
bwgc-golf-stats/
├── CLAUDE.md                     # This guidance file
├── README.md                     # Project documentation
├── package.json                  # Node.js dependencies and scripts
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.js             # PostCSS configuration
│
├── Data Files:
├── advanced_stats.json           # Primary data source (comprehensive analytics)
├── myrtleScores.csv              # Raw tournament data
├── individual_scores.csv         # Player scores by day/course
├── match_play_results.csv        # Day 2 head-to-head results  
├── team_scores.csv               # Daily team totals
├── player_stats.csv              # Player statistics summary
├── clean_data.py                 # Data extraction script
├── calculate_stats.py            # Advanced analytics script
│
├── src/
│   ├── components/
│   │   ├── charts/               # Chart components (Recharts-based)
│   │   │   ├── BarChart.tsx
│   │   │   ├── CourseDifficultyChart.tsx
│   │   │   ├── CoursePerformanceChart.tsx
│   │   │   ├── FunFacts.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── MatchPlayMatrix.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── PlayerProfileCards.tsx
│   │   │   ├── PlayerProgressionChart.tsx
│   │   │   ├── ScoreDistributionChart.tsx
│   │   │   ├── SortableLeaderboard.tsx
│   │   │   └── TeamComparisonChart.tsx
│   │   ├── layout/               # Layout and page components
│   │   │   ├── CourseAnalysis.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── MatchPlayResults.tsx
│   │   │   ├── PlayerStats.tsx
│   │   │   └── TournamentOverview.tsx
│   │   └── ui/                   # Reusable UI components
│   │       ├── Card.tsx
│   │       ├── StatCard.tsx
│   │       └── Tabs.tsx
│   ├── pages/                    # Next.js pages
│   │   ├── _app.tsx              # App wrapper
│   │   └── index.tsx             # Home page
│   ├── styles/
│   │   └── globals.css           # Global styles (dark mode)
│   └── utils/
│       └── data.ts               # Data utilities and TypeScript interfaces
│
└── public/                       # Static assets
```

## Data Pipeline Architecture

The project follows a clear data processing pipeline:

1. **Raw Data** (`myrtleScores.csv`) → **Data Cleaning** (`clean_data.py`) → **Structured CSVs**
2. **Structured CSVs** → **Analytics Engine** (`calculate_stats.py`) → **Advanced Analytics** (`advanced_stats.json`)  
3. **Advanced Analytics** → **Next.js Web Application** → **Interactive Dashboards**

### Primary Data Source
The web application primarily consumes `advanced_stats.json` which contains all processed tournament data. The TypeScript interfaces in `src/utils/data.ts` define the exact structure and provide type safety.

### Cleaned Data Structure

- **individual_scores.csv**: Player performance by day/course with format details
- **match_play_results.csv**: Day 2 match play points and win percentages
- **team_scores.csv**: Daily team totals and tournament standings
- **player_stats.csv**: Hole-by-hole performance statistics (birdies, pars, bogeys, etc.)

## Available Analytics

The `advanced_stats.json` file contains comprehensive statistics including:

### Tournament Summary
- Final leaderboard with total scores and averages
- Tournament winner and winning score
- Course and round count

### Player Statistics (for each of 8 players)
- **Basic Stats**: Total score, scoring average, best/worst rounds
- **Consistency**: Standard deviation and consistency ratings
- **Performance Details**: Birdie/par/bogey breakdowns and percentages  
- **Match Play**: Points earned and win percentage
- **Daily Trends**: Performance across all 4 days
- **Course Performance**: Player performance by specific course

### Course Analysis
- Difficulty rankings based on scoring averages
- Course-specific statistics and performance ratings

### Tournament Insights
- Fun facts and achievements
- Performance superlatives (most consistent, lowest round, etc.)
- Head-to-head match play results

## Tournament Data Overview

- **Teams**: 
  - **"Banana Boys"**: Mike, Ryan, Nixon, Doug (Tournament Winners)
  - **"3 Lefties make a Righty"**: Jimbo, AJ, Todd, Dave
- **Players**: 8 total players competing across both teams
- **Courses**: 4 different courses across 4 days
- **Formats**: Scramble, Match Play, Best Ball, Stableford
- **Individual Winner**: Mike (269 total strokes)
- **Team Winner**: Banana Boys (171.5 team points vs 139.5)

## Team compositions
3 Lefties make a Righty - Jimbo, AJ, Todd, Dave
Banana Boys - Mike, Ryan, Nixon, Doug

## Development Workflow

### Regenerating Analytics
If tournament data changes:
1. Update `myrtleScores.csv` with new data
2. Run `python3 clean_data.py` to extract clean CSVs
3. Run `python3 calculate_stats.py` to update analytics
4. Analytics are automatically saved to `advanced_stats.json`

### Future Enhancement Opportunities
The core web application is complete. Potential future improvements:
- **Mobile Optimization**: Responsive design improvements for mobile devices
- **GitHub Pages Deployment**: Static site deployment for public access
- **Additional Visualizations**: New chart types or analysis features
- **Performance Optimization**: Code splitting, lazy loading, caching
- **Social Features**: Sharing capabilities, export functionality
- **Tournament Comparison**: Support for multiple tournament datasets

## Tech Stack

### Frontend (Current)
- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS with dark mode theme
- **Charts**: Recharts (React-based charting library)
- **Icons**: Lucide React
- **UI Components**: Custom components with consistent design system

### Data Processing
- **Language**: Python 3 (csv, json, statistics modules)
- **Output**: JSON format for web consumption

### Development Tools
- **Type Checking**: TypeScript with strict mode
- **Linting**: ESLint
- **Package Manager**: npm
- **Version Control**: Git

## Component Architecture

### Layout Structure
- **Dashboard.tsx**: Main tabbed interface (Overview, Leaderboard, Players, Courses, Match Play)
- **Layout.tsx**: App shell with Header and Footer
- **Header.tsx**: Navigation and branding
- **Footer.tsx**: Footer with links and attribution

### Chart Components (all use Recharts)
- **SortableLeaderboard.tsx**: Interactive sortable table with all player stats
- **PlayerProgressionChart.tsx**: Line chart showing daily score progression
- **TeamComparisonChart.tsx**: Team performance comparison with statistics
- **PlayerProfileCards.tsx**: Expandable cards with detailed player stats
- **FunFacts.tsx**: Rotating auto-updating tournament insights
- **CoursePerformanceChart.tsx**: Player performance by course
- **CourseDifficultyChart.tsx**: Course difficulty analysis
- **ScoreDistributionChart.tsx**: Score distribution visualization
- **MatchPlayMatrix.tsx**: Head-to-head match play results

### UI Components
- **Card.tsx**: Reusable card container with optional title/subtitle
- **StatCard.tsx**: Specialized card for displaying statistics with icons
- **Tabs.tsx**: Tab navigation component

## Data Structure Details

### Primary Data Source: advanced_stats.json
**Score Ranges**: Individual rounds range from 84 (Mike, Day 4) to 136 (AJ, Day 2)
**Tournament Structure**: 
- Day 1: Scramble (no individual scores)
- Day 2: Match Play at Barefoot Dye (hardest course)
- Day 3: Best Ball at Aberdeen Country Club 
- Day 4: Stableford at Arcadian Shores (easiest course)

### TypeScript Interfaces (src/utils/data.ts)
- **TournamentData**: Root interface for entire dataset
- **PlayerStats**: Individual player statistics and performance
- **CourseStats**: Course-specific data and difficulty metrics
- **PerformanceTrend**: Daily progression and trends

### Key Data Points Per Player
- **Basic Stats**: total_score, scoring_average, best_round, worst_round
- **Consistency**: score_standard_deviation, consistency_rating
- **Match Play**: total_points, win_percentage
- **Daily Performance**: Scores for days 2, 3, 4 with course context
- **Course Performance**: Performance breakdown by specific course

## Dark Mode Implementation

### Global Styling (src/styles/globals.css)
- **Background**: Dark gray (`bg-gray-900`) for main app
- **Text**: Light colors (`text-gray-100` primary, `text-gray-400` secondary)
- **Cards**: Dark gray (`bg-gray-800`) with subtle borders (`border-gray-700`)
- **Interactive Elements**: Hover states use `gray-600`/`gray-700`

### Color System
- **Chart Colors**: Use `-400` variants (e.g., `green-400`, `red-400`, `blue-400`) for visibility
- **Accent Colors**: Golf theme greens maintained with dark mode adaptations
- **Gradients**: Use transparency with dark base colors (e.g., `yellow-900/20`)

## Development Patterns & Best Practices

### Component Patterns
1. **Always include all 8 players** in data processing and visualization
2. **Use TypeScript interfaces** from `src/utils/data.ts` for type safety
3. **Import data utilities** from `src/utils/data.ts` for consistent data access
4. **Apply dark mode styling** to all new components using established color system

### Chart Development
1. **Use Recharts** for all data visualizations
2. **Set appropriate scales** based on actual data ranges (e.g., 75-145 for golf scores)
3. **Include tooltips** with course context and meaningful formatting
4. **Support player selection/filtering** where applicable
5. **Use consistent color palette** across all charts

### Data Access Patterns
```typescript
import { data, getPlayerList, getAllPlayerProgressions } from '../../utils/data'
```

### Styling Patterns
- **Dark backgrounds**: `bg-gray-800`, `bg-gray-900`
- **Light text**: `text-gray-100` (primary), `text-gray-200` (secondary), `text-gray-400` (tertiary)
- **Borders**: `border-gray-700`, `border-gray-600`
- **Interactive elements**: Use `hover:bg-gray-600` states

## Known Limitations & Considerations

1. **Day 1 Data**: No individual scores available (scramble format)
2. **Hole-by-hole Data**: Not available; only round totals exist
3. **Mock Data Warning**: Never create simulated data; use only real tournament data
4. **Player Names**: Must match exactly as they appear in data files
5. **Score Scale**: Golf scores range 84-136; always use appropriate Y-axis scaling
6. **Course Context**: Always include course names and formats for context

## Development Notes

- All data processing scripts are self-contained with no external dependencies
- The analytics JSON structure is designed for easy consumption by web frameworks
- Individual player names are standardized across all data files
- Course names and formats are consistent for reliable filtering/grouping
- **Dark mode is the primary theme** - all components should be dark mode compatible
- **TypeScript strict mode** is enabled - all code must be type-safe
- **All players must be included** in visualizations and analysis