# BWGC Golf Stats - Architecture Documentation

## Overview

This project has been refactored to implement a clean, service-oriented architecture with proper separation of concerns between data processing and UI presentation. The architecture follows Domain-Driven Design principles with TypeScript interfaces and centralized service management.

## Architecture Layers

### 1. Models Layer (`/src/models/`)
- **Purpose**: Define TypeScript interfaces and types for all data structures
- **Key File**: `tournament.types.ts`
- **Contains**: Comprehensive type definitions for players, teams, courses, tournaments, achievements, and UI presentation data

### 2. Services Layer (`/src/services/`)
- **Purpose**: Business logic and data processing
- **Pattern**: Service classes that extend BaseService
- **Key Components**:
  - `BaseService`: Abstract base providing safe data access
  - `PlayerService`: Player statistics, achievements, leaderboards
  - `TeamService`: Team calculations, comparisons, member contributions
  - `CourseService`: Course analysis, difficulty rankings, performance data
  - `TournamentService`: Overall tournament insights, trends, highlights
  - `ServiceContainer`: Singleton managing all service instances

### 3. Hooks Layer (`/src/hooks/`)
- **Purpose**: React hooks providing clean data interfaces to components
- **Key File**: `useTournamentData.ts`
- **Benefits**: Memoized calculations, consistent data access patterns

### 4. Components Layer (`/src/components/`)
- **Purpose**: Pure presentation components
- **Goal**: Components should focus on rendering, not data processing
- **Integration**: Use hooks to consume processed data from services

## Service Architecture

### BaseService
```typescript
abstract class BaseService {
  protected data: RawTournamentData
  protected getRawData(): RawTournamentData
  protected isDataValid(): boolean
  protected safeGet<T>(path: string[], defaultValue: T): T
}
```

### PlayerService
- **Responsibilities**: Individual player statistics, achievements, leaderboard generation
- **Key Methods**:
  - `getPlayerStatistics(playerName)`: Complete player data
  - `getLeaderboard(sortConfig?)`: Sortable leaderboard
  - `getPlayerAchievements(playerName)`: Achievement system
- **Caching**: Player data cached for performance

### TeamService
- **Responsibilities**: Team statistics, member contributions, team comparisons
- **Key Methods**:
  - `getTeamStatistics(teamName)`: Complete team data
  - `getTeamComparison()`: Head-to-head team analysis
  - `getTeamExtremes(teamName)`: Best/worst performers per team

### CourseService
- **Responsibilities**: Course difficulty analysis, player performance by course
- **Key Methods**:
  - `getCourseStatistics(courseName)`: Course difficulty and statistics
  - `getCourseLeaderboard(courseName)`: Best performers per course
  - `getCourseDifficultyAnalysis()`: Comparative course analysis

### TournamentService
- **Responsibilities**: Overall tournament insights, trends, achievements
- **Key Methods**:
  - `getTournamentSummary()`: High-level tournament info
  - `getTournamentInsights()`: Fun facts and insights
  - `getTournamentStatistics()`: Key tournament statistics

## Data Flow

```
Raw Data (advanced_stats.json) 
    ↓
BaseService (safe data access)
    ↓
Domain Services (business logic)
    ↓
React Hooks (memoized processing)
    ↓
Components (pure presentation)
```

## Benefits of This Architecture

### 1. DRY (Don't Repeat Yourself)
- **Before**: Match play calculations duplicated across 4+ components
- **After**: Single `PlayerService.getMatchPlayPerformance()` method

### 2. Single Source of Truth
- **Before**: Different components might calculate the same metric differently
- **After**: All calculations centralized in services with consistent logic

### 3. Performance
- **Caching**: Service results cached to avoid recalculation
- **Memoization**: React hooks memoize expensive operations
- **Selective Updates**: Only affected components re-render on data changes

### 4. Maintainability
- **Centralized Logic**: Business rules in one place
- **Type Safety**: Comprehensive TypeScript interfaces
- **Testability**: Services can be unit tested independently

### 5. Separation of Concerns
- **Services**: Data processing and business logic
- **Hooks**: React-specific data consumption patterns
- **Components**: Pure presentation and user interaction

## Usage Examples

### Using Services Directly
```typescript
import { services } from '../services'

// Get all player statistics
const players = services.players.getAllPlayerStatistics()

// Get team comparison
const comparison = services.teams.getTeamComparison()

// Get course difficulty analysis
const difficulty = services.courses.getCourseDifficultyAnalysis()
```

### Using React Hooks (Recommended)
```typescript
import { usePlayerData, useTeamData, useMatchPlayData } from '../hooks'

const MyComponent = () => {
  const { allPlayers } = usePlayerData()
  const { allTeams, comparison } = useTeamData()
  const { individualLeaderboard, champion } = useMatchPlayData()
  
  // Pure presentation logic here
  return <div>...</div>
}
```

## Migration Strategy

### Phase 1: Core Services (Completed)
- ✅ Created service layer with all business logic
- ✅ Defined comprehensive TypeScript interfaces
- ✅ Created React hooks for data consumption

### Phase 2: Component Refactoring (In Progress)
- 🔄 Refactor components to use hooks instead of inline calculations
- 🔄 Remove duplicated logic from components
- 🔄 Make components purely presentational

### Phase 3: Advanced Features (Future)
- ⏳ Add real-time data updates
- ⏳ Implement data validation and error handling
- ⏳ Add service-level caching strategies

## Backward Compatibility

The `data-legacy.ts` file provides backward compatibility for components not yet refactored:

```typescript
// Legacy usage (still works)
import { getPlayerList, getTeamData } from '../utils/data-legacy'

// New usage (recommended)
import { usePlayerData, useTeamData } from '../hooks'
```

## Service Container Pattern

The `ServiceContainer` implements a singleton pattern to manage service instances:

```typescript
import { services } from '../services/ServiceContainer'

// All services available through single interface
services.players.getLeaderboard()
services.teams.getTeamComparison()
services.courses.getDifficultyAnalysis()
services.tournament.getInsights()
```

## Best Practices

### For Components
1. **Use hooks for data access** instead of calling services directly
2. **Keep components pure** - no business logic in render functions
3. **Leverage memoization** for expensive rendering operations

### For Services
1. **Cache expensive calculations** in service instances
2. **Use TypeScript interfaces** for all method signatures
3. **Handle edge cases** with safe defaults

### For Data Processing
1. **Centralize calculations** in appropriate service classes
2. **Use immutable data patterns** to prevent accidental mutations
3. **Validate data integrity** at service boundaries

This architecture provides a solid foundation for scalable, maintainable golf tournament analytics while maintaining excellent developer experience and type safety.