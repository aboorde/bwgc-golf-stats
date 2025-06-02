import { PlayerService } from './PlayerService'
import { TeamService } from './TeamService'
import { CourseService } from './CourseService'
import { TournamentService } from './TournamentService'

/**
 * Central service container that manages all service instances
 * Provides a unified interface to access all data services
 */
export class ServiceContainer {
  private static instance: ServiceContainer
  
  private _playerService: PlayerService
  private _teamService: TeamService
  private _courseService: CourseService
  private _tournamentService: TournamentService

  private constructor() {
    this._playerService = new PlayerService()
    this._teamService = new TeamService()
    this._courseService = new CourseService()
    this._tournamentService = new TournamentService()
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Get the player service
   */
  public get players(): PlayerService {
    return this._playerService
  }

  /**
   * Get the team service
   */
  public get teams(): TeamService {
    return this._teamService
  }

  /**
   * Get the course service
   */
  public get courses(): CourseService {
    return this._courseService
  }

  /**
   * Get the tournament service
   */
  public get tournament(): TournamentService {
    return this._tournamentService
  }

  /**
   * Clear all caches (useful for testing or data refresh)
   */
  public clearCaches(): void {
    // Services manage their own caches, so we recreate them
    this._playerService = new PlayerService()
    this._teamService = new TeamService()
    this._courseService = new CourseService()
    this._tournamentService = new TournamentService()
  }
}

// Export singleton instance for easy access
export const services = ServiceContainer.getInstance()