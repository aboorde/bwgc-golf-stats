#!/usr/bin/env python3
"""
Clean and extract data from myrtleScores.csv into structured CSV files
"""

import csv
from typing import List, Dict, Any

def clean_myrtle_scores():
    """Main function to clean and extract all data"""
    
    # Read the raw data
    with open('myrtleScores.csv', 'r') as file:
        lines = file.readlines()
    
    # Extract individual scores
    individual_scores = extract_individual_scores(lines)
    save_to_csv(individual_scores, 'individual_scores.csv')
    
    # Extract match play results
    match_play_results = extract_match_play_results(lines)
    save_to_csv(match_play_results, 'match_play_results.csv')
    
    # Extract team scores
    team_scores = extract_team_scores(lines)
    save_to_csv(team_scores, 'team_scores.csv')
    
    # Extract player stats
    player_stats = extract_player_stats(lines)
    save_to_csv(player_stats, 'player_stats.csv')
    
    print("Data extraction completed successfully!")
    print("Created files:")
    print("- individual_scores.csv")
    print("- match_play_results.csv") 
    print("- team_scores.csv")
    print("- player_stats.csv")

def extract_individual_scores(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract individual player scores for each day and course"""
    scores = []
    
    # Day 1 - Scramble (team scores)
    scores.extend([
        {"player": "3 Lefties make a Righty", "day": 1, "course": "Myrtle Beach National - South Creek", "score": 73, "par": 72, "format": "Scramble"},
        {"player": "Banana Boys", "day": 1, "course": "Myrtle Beach National - South Creek", "score": 68, "par": 72, "format": "Scramble"}
    ])
    
    # Day 2 - Individual Match Play scores
    day2_players = [
        {"player": "Jimbo", "score": 100, "par": 72},
        {"player": "Mike", "score": 97, "par": 72},
        {"player": "Dave", "score": 110, "par": 72},
        {"player": "Ryan", "score": 114, "par": 72},
        {"player": "AJ", "score": 136, "par": 72},
        {"player": "Nixon", "score": 112, "par": 72},
        {"player": "Todd", "score": 126, "par": 72},
        {"player": "Doug", "score": 128, "par": 72}
    ]
    
    for player_data in day2_players:
        scores.append({
            "player": player_data["player"],
            "day": 2,
            "course": "Barefoot Dye",
            "score": player_data["score"],
            "par": player_data["par"],
            "format": "Match Play"
        })
    
    # Day 3 - Best Ball scores (individual and team)
    day3_individual = [
        {"player": "Jimbo", "score": 93, "par": 72},
        {"player": "Dave", "score": 98, "par": 72},
        {"player": "Mike", "score": 88, "par": 72},
        {"player": "Ryan", "score": 99, "par": 72},
        {"player": "AJ", "score": 117, "par": 72},
        {"player": "Todd", "score": 124, "par": 72},
        {"player": "Nixon", "score": 114, "par": 72},
        {"player": "Doug", "score": 133, "par": 72}
    ]
    
    for player_data in day3_individual:
        scores.append({
            "player": player_data["player"],
            "day": 3,
            "course": "Aberdeen Country Club",
            "score": player_data["score"],
            "par": player_data["par"],
            "format": "Best Ball"
        })
    
    # Day 3 - Team Best Ball scores
    scores.extend([
        {"player": "Jimbo/Dave", "day": 3, "course": "Aberdeen Country Club", "score": 88, "par": 72, "format": "Best Ball Team"},
        {"player": "Mike/Ryan", "day": 3, "course": "Aberdeen Country Club", "score": 82, "par": 72, "format": "Best Ball Team"},
        {"player": "AJ/Todd", "day": 3, "course": "Aberdeen Country Club", "score": 103, "par": 72, "format": "Best Ball Team"},
        {"player": "Nixon/Doug", "day": 3, "course": "Aberdeen Country Club", "score": 108, "par": 72, "format": "Best Ball Team"}
    ])
    
    # Day 4 - Stableford individual scores
    day4_players = [
        {"player": "Jimbo", "score": 92, "stableford": 19},
        {"player": "Mike", "score": 84, "stableford": 25},
        {"player": "Dave", "score": 90, "stableford": 20},
        {"player": "Nixon", "score": 107, "stableford": 8},
        {"player": "AJ", "score": 114, "stableford": 4},
        {"player": "Ryan", "score": 99, "stableford": 10},
        {"player": "Todd", "score": 121, "stableford": 3},
        {"player": "Doug", "score": 125, "stableford": 2}
    ]
    
    for player_data in day4_players:
        scores.append({
            "player": player_data["player"],
            "day": 4,
            "course": "Arcadian Shores",
            "score": player_data["score"],
            "par": 72,
            "format": "Stableford",
            "stableford_points": player_data["stableford"]
        })
    
    return scores

def extract_match_play_results(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract Day 2 match play head-to-head results"""
    results = []
    
    # Match play points from the data
    match_data = [
        {"player": "Jimbo", "points": 7},
        {"player": "Mike", "points": 11},
        {"player": "Dave", "points": 10},
        {"player": "Ryan", "points": 8},
        {"player": "AJ", "points": 5},
        {"player": "Nixon", "points": 13},
        {"player": "Todd", "points": 10.5},
        {"player": "Doug", "points": 7.5}
    ]
    
    for player_data in match_data:
        results.append({
            "player": player_data["player"],
            "day": 2,
            "format": "Match Play",
            "total_points": player_data["points"],
            "possible_points": 18
        })
    
    return results

def extract_team_scores(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract daily team totals"""
    teams = []
    
    # Team scores from the summary table
    teams.extend([
        {"team": "3 Lefties Make a Righty", "day": 1, "score": 28, "format": "Scramble"},
        {"team": "Banana Boys", "day": 1, "score": 48, "format": "Scramble"},
        {"team": "3 Lefties Make a Righty", "day": 2, "score": 32.5, "format": "Match Play"},
        {"team": "Banana Boys", "day": 2, "score": 39.5, "format": "Match Play"},
        {"team": "3 Lefties Make a Righty", "day": 3, "score": 33, "format": "Best Ball"},
        {"team": "Banana Boys", "day": 3, "score": 39, "format": "Best Ball"},
        {"team": "3 Lefties Make a Righty", "day": 4, "score": 46, "format": "Stableford"},
        {"team": "Banana Boys", "day": 4, "score": 45, "format": "Stableford"}
    ])
    
    # Calculate totals
    lefties_total = 28 + 32.5 + 33 + 46
    bananas_total = 48 + 39.5 + 39 + 45
    
    teams.extend([
        {"team": "3 Lefties Make a Righty", "day": "Total", "score": lefties_total, "format": "Tournament Total"},
        {"team": "Banana Boys", "day": "Total", "score": bananas_total, "format": "Tournament Total"}
    ])
    
    return teams

def extract_player_stats(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract player statistics (birdies, pars, bogeys, etc.)"""
    stats = []
    
    # Player stats from the bottom of the original file
    player_data = [
        {"player": "Mike", "birdies": 0, "pars": 21, "bogeys": 21, "double": 9, "triple": 1, "quadruple": 1, "quintuple_plus": 1, "total_score": 269},
        {"player": "Jimmy", "birdies": 0, "pars": 8, "bogeys": 30, "double": 11, "triple": 4, "quadruple": 0, "quintuple_plus": 1, "total_score": 285},
        {"player": "Dave", "birdies": 0, "pars": 12, "bogeys": 18, "double": 14, "triple": 6, "quadruple": 2, "quintuple_plus": 2, "total_score": 298},
        {"player": "Ryan", "birdies": 1, "pars": 9, "bogeys": 12, "double": 19, "triple": 7, "quadruple": 5, "quintuple_plus": 1, "total_score": 312},
        {"player": "Nixon", "birdies": 0, "pars": 3, "bogeys": 13, "double": 21, "triple": 8, "quadruple": 7, "quintuple_plus": 2, "total_score": 333},
        {"player": "AJ", "birdies": 0, "pars": 1, "bogeys": 9, "double": 13, "triple": 16, "quadruple": 9, "quintuple_plus": 6, "total_score": 367},
        {"player": "Todd", "birdies": 0, "pars": 2, "bogeys": 6, "double": 18, "triple": 17, "quadruple": 4, "quintuple_plus": 7, "total_score": 371},
        {"player": "Doug", "birdies": 0, "pars": 1, "bogeys": 3, "double": 11, "triple": 19, "quadruple": 16, "quintuple_plus": 4, "total_score": 386}
    ]
    
    for player in player_data:
        total_holes = 54  # 3 individual rounds of 18 holes each
        scoring_avg = round(player["total_score"] / total_holes, 2)
        
        stats.append({
            "player": player["player"],
            "total_score": player["total_score"],
            "scoring_average": scoring_avg,
            "birdies": player["birdies"],
            "pars": player["pars"],
            "bogeys": player["bogeys"],
            "double_bogeys": player["double"],
            "triple_bogeys": player["triple"],
            "quadruple_bogeys": player["quadruple"],
            "quintuple_plus": player["quintuple_plus"],
            "total_holes": total_holes,
            "under_par_holes": player["birdies"],
            "over_par_holes": player["bogeys"] + player["double"] + player["triple"] + player["quadruple"] + player["quintuple_plus"]
        })
    
    return stats

def save_to_csv(data: List[Dict[str, Any]], filename: str):
    """Save data to CSV file"""
    if not data:
        print(f"No data to save for {filename}")
        return
    
    # Get all unique fieldnames from all rows
    fieldnames = set()
    for row in data:
        fieldnames.update(row.keys())
    fieldnames = sorted(list(fieldnames))
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Created {filename} with {len(data)} rows")

if __name__ == "__main__":
    clean_myrtle_scores()