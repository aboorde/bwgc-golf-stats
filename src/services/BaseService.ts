import { data as rawData } from '../utils/data'
import { RawTournamentData } from '../models/tournament.types'

/**
 * Base service class that provides access to raw tournament data
 * All other services extend this class to access the data
 */
export abstract class BaseService {
  protected data: RawTournamentData

  constructor() {
    this.data = rawData as RawTournamentData
  }

  /**
   * Get the raw tournament data
   */
  protected getRawData(): RawTournamentData {
    return this.data
  }

  /**
   * Check if data is loaded and valid
   */
  protected isDataValid(): boolean {
    return !!(
      this.data &&
      this.data.tournament_summary &&
      this.data.player_statistics &&
      this.data.course_analysis
    )
  }

  /**
   * Safe getter for nested data properties
   */
  protected safeGet<T>(
    path: string[],
    defaultValue: T
  ): T {
    let current: any = this.data
    
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current as T
  }
}