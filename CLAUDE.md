# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a golf analytics project for BWGC (Banana Boys Golf Club) containing tournament data and analysis tools for a 4-day Myrtle Beach golf trip. The project has evolved from raw data into a comprehensive analytics pipeline with plans for a web dashboard.

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

### Data Processing
```bash
# Clean and extract structured data from raw tournament scores
python3 clean_data.py

# Calculate advanced statistics and analytics
python3 calculate_stats.py
```

### Future Commands (once web app is built)
```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Current File Structure

```
bwgc-golf-stats/
├── myrtleScores.csv              # Raw tournament data
├── myrtleScores.pdf              # PDF version of scores
├── clean_data.py                 # Data extraction script
├── calculate_stats.py            # Advanced analytics script
├── steps.md                      # Development roadmap
├── CLAUDE.md                     # This file
│
├── Cleaned Data Files:
├── individual_scores.csv         # Player scores by day/course
├── match_play_results.csv        # Day 2 head-to-head results  
├── team_scores.csv               # Daily team totals
├── player_stats.csv              # Player statistics summary
└── advanced_stats.json           # Comprehensive analytics
```

## Data Pipeline Architecture

The project follows a clear data processing pipeline:

1. **Raw Data** (`myrtleScores.csv`) → **Data Cleaning** (`clean_data.py`) → **Structured CSVs**
2. **Structured CSVs** → **Analytics Engine** (`calculate_stats.py`) → **Advanced Analytics** (`advanced_stats.json`)  
3. **Advanced Analytics** → **Web Dashboard** (future) → **GitHub Pages** (future)

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

### Next Development Phase
Follow the detailed roadmap in `steps.md` which outlines:
- **Phase 2**: Web application setup with React/Chart.js
- **Phase 3**: Interactive visualizations and dashboards  
- **Phase 4**: Mobile optimization and user experience
- **Phase 5**: GitHub Pages deployment
- **Phase 6**: Advanced features and social sharing

## Tech Stack

- **Data Processing**: Python 3 (csv, json, statistics modules)
- **Future Web App**: React/Next.js, Chart.js/D3.js, Tailwind CSS
- **Deployment**: GitHub Pages
- **Version Control**: Git

## Development Notes

- All data processing scripts are self-contained with no external dependencies
- The analytics JSON structure is designed for easy consumption by web frameworks
- Individual player names are standardized across all data files
- Course names and formats are consistent for reliable filtering/grouping
- The project maintains clean separation between data processing and future web application code