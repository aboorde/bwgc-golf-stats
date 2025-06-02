#!/usr/bin/env python3
"""
Calculate advanced golf statistics from cleaned tournament data
"""

import csv
import json
import statistics
from collections import defaultdict
from typing import Dict, List, Any, Tuple

def load_csv_data(filename: str) -> List[Dict[str, Any]]:
    """Load data from CSV file"""
    data = []
    with open(filename, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Convert numeric fields
            if 'score' in row and row['score']:
                row['score'] = int(row['score'])
            if 'par' in row and row['par']:
                row['par'] = int(row['par'])
            if 'day' in row and row['day'] != 'Total':
                row['day'] = int(row['day'])
            if 'total_points' in row and row['total_points']:
                row['total_points'] = float(row['total_points'])
            if 'stableford_points' in row and row['stableford_points']:
                row['stableford_points'] = int(row['stableford_points'])
            data.append(row)
    return data

def calculate_player_statistics():
    """Calculate comprehensive statistics for all players"""
    
    # Load data
    individual_scores = load_csv_data('individual_scores.csv')
    match_play_results = load_csv_data('match_play_results.csv')
    player_stats = load_csv_data('player_stats.csv')
    
    # Get individual players (exclude team entries)
    individual_players = ['Jimbo', 'Mike', 'Dave', 'Ryan', 'AJ', 'Nixon', 'Todd', 'Doug']
    
    results = {
        'tournament_summary': calculate_tournament_summary(individual_scores, individual_players),
        'player_statistics': {},
        'course_analysis': calculate_course_difficulty(individual_scores, individual_players),
        'head_to_head': calculate_head_to_head_records(match_play_results),
        'performance_trends': calculate_performance_trends(individual_scores, individual_players),
        'tournament_insights': generate_tournament_insights(individual_scores, match_play_results, player_stats, individual_players)
    }
    
    # Calculate detailed stats for each player
    for player in individual_players:
        results['player_statistics'][player] = calculate_individual_player_stats(
            player, individual_scores, match_play_results, player_stats
        )
    
    return results

def calculate_tournament_summary(individual_scores: List[Dict], players: List[str]) -> Dict[str, Any]:
    """Calculate overall tournament summary"""
    
    # Get individual rounds only (exclude team formats)
    individual_rounds = [
        score for score in individual_scores 
        if score['player'] in players and score['format'] != 'Scramble'
    ]
    
    # Calculate total scores for final leaderboard
    player_totals = defaultdict(int)
    rounds_played = defaultdict(int)
    
    for score in individual_rounds:
        if score['format'] != 'Best Ball Team':  # Only individual scores
            player_totals[score['player']] += score['score']
            rounds_played[score['player']] += 1
    
    # Create leaderboard
    leaderboard = []
    for player in players:
        if player in player_totals:
            leaderboard.append({
                'player': player,
                'total_score': player_totals[player],
                'rounds_played': rounds_played[player],
                'scoring_average': round(player_totals[player] / rounds_played[player], 2) if rounds_played[player] > 0 else 0
            })
    
    leaderboard.sort(key=lambda x: x['total_score'])
    
    return {
        'winner': leaderboard[0]['player'] if leaderboard else None,
        'winning_score': leaderboard[0]['total_score'] if leaderboard else None,
        'leaderboard': leaderboard,
        'total_rounds': len([s for s in individual_rounds if s['format'] != 'Best Ball Team']),
        'courses_played': len(set(s['course'] for s in individual_rounds))
    }

def calculate_individual_player_stats(player: str, individual_scores: List[Dict], 
                                    match_play_results: List[Dict], player_stats: List[Dict]) -> Dict[str, Any]:
    """Calculate comprehensive statistics for a single player"""
    
    # Get player's individual rounds (exclude team formats)
    player_rounds = [
        score for score in individual_scores 
        if score['player'] == player and score['format'] not in ['Scramble', 'Best Ball Team']
    ]
    
    if not player_rounds:
        return {}
    
    scores = [round_data['score'] for round_data in player_rounds]
    pars = [round_data['par'] for round_data in player_rounds]
    relative_scores = [score - par for score, par in zip(scores, pars)]
    
    # Get detailed stats
    detailed_stats = next((stats for stats in player_stats if stats['player'] == player), {})
    
    # Get match play performance
    match_play = next((mp for mp in match_play_results if mp['player'] == player), {})
    
    # Calculate best and worst rounds
    best_round = min(scores) if scores else None
    worst_round = max(scores) if scores else None
    best_relative = min(relative_scores) if relative_scores else None
    worst_relative = max(relative_scores) if relative_scores else None
    
    # Performance by day
    daily_performance = {}
    for round_data in player_rounds:
        day = round_data['day']
        daily_performance[f'day_{day}'] = {
            'score': round_data['score'],
            'par': round_data['par'],
            'relative_to_par': round_data['score'] - round_data['par'],
            'course': round_data['course'],
            'format': round_data['format']
        }
    
    # Calculate consistency (standard deviation)
    consistency_score = round(statistics.stdev(scores), 2) if len(scores) > 1 else 0
    consistency_relative = round(statistics.stdev(relative_scores), 2) if len(relative_scores) > 1 else 0
    
    return {
        'basic_stats': {
            'total_score': sum(scores),
            'rounds_played': len(scores),
            'scoring_average': round(sum(scores) / len(scores), 2),
            'average_relative_to_par': round(sum(relative_scores) / len(relative_scores), 2),
            'best_round': best_round,
            'worst_round': worst_round,
            'best_relative_round': best_relative,
            'worst_relative_round': worst_relative
        },
        'consistency': {
            'score_standard_deviation': consistency_score,
            'relative_par_standard_deviation': consistency_relative,
            'consistency_rating': 'Excellent' if consistency_score < 5 else 'Good' if consistency_score < 8 else 'Average' if consistency_score < 12 else 'Poor'
        },
        'detailed_performance': {
            'birdies': int(detailed_stats.get('birdies', 0)),
            'pars': int(detailed_stats.get('pars', 0)),
            'bogeys': int(detailed_stats.get('bogeys', 0)),
            'double_bogeys': int(detailed_stats.get('double_bogeys', 0)),
            'triple_bogeys': int(detailed_stats.get('triple_bogeys', 0)),
            'big_numbers': int(detailed_stats.get('quadruple_bogeys', 0)) + int(detailed_stats.get('quintuple_plus', 0)),
            'under_par_percentage': round((int(detailed_stats.get('birdies', 0)) / int(detailed_stats.get('total_holes', 54))) * 100, 1) if detailed_stats.get('total_holes') else 0,
            'par_or_better_percentage': round(((int(detailed_stats.get('birdies', 0)) + int(detailed_stats.get('pars', 0))) / int(detailed_stats.get('total_holes', 54))) * 100, 1) if detailed_stats.get('total_holes') else 0
        },
        'match_play_performance': {
            'total_points': float(match_play.get('total_points', 0)),
            'possible_points': 18,
            'win_percentage': round((float(match_play.get('total_points', 0)) / 18) * 100, 1) if match_play else 0
        },
        'daily_performance': daily_performance,
        'course_performance': calculate_course_performance(player, player_rounds)
    }

def calculate_course_performance(player: str, player_rounds: List[Dict]) -> Dict[str, Any]:
    """Calculate performance by course for a player"""
    course_stats = defaultdict(list)
    
    for round_data in player_rounds:
        course = round_data['course']
        relative_score = round_data['score'] - round_data['par']
        course_stats[course].append({
            'score': round_data['score'],
            'par': round_data['par'],
            'relative': relative_score,
            'day': round_data['day']
        })
    
    course_performance = {}
    for course, rounds in course_stats.items():
        scores = [r['score'] for r in rounds]
        relatives = [r['relative'] for r in rounds]
        
        course_performance[course] = {
            'rounds_played': len(rounds),
            'average_score': round(sum(scores) / len(scores), 2),
            'average_relative_to_par': round(sum(relatives) / len(relatives), 2),
            'best_round': min(scores),
            'performance_rating': 'Excellent' if sum(relatives) / len(relatives) < 0 else 'Good' if sum(relatives) / len(relatives) < 5 else 'Average' if sum(relatives) / len(relatives) < 10 else 'Struggled'
        }
    
    return course_performance

def calculate_course_difficulty(individual_scores: List[Dict], players: List[str]) -> Dict[str, Any]:
    """Analyze course difficulty based on player performance"""
    
    # Get individual rounds only
    individual_rounds = [
        score for score in individual_scores 
        if score['player'] in players and score['format'] not in ['Scramble', 'Best Ball Team']
    ]
    
    course_stats = defaultdict(lambda: {'scores': [], 'relative_scores': []})
    
    for round_data in individual_rounds:
        course = round_data['course']
        relative_score = round_data['score'] - round_data['par']
        course_stats[course]['scores'].append(round_data['score'])
        course_stats[course]['relative_scores'].append(relative_score)
    
    course_analysis = {}
    for course, stats in course_stats.items():
        avg_score = sum(stats['scores']) / len(stats['scores'])
        avg_relative = sum(stats['relative_scores']) / len(stats['relative_scores'])
        
        course_analysis[course] = {
            'average_score': round(avg_score, 2),
            'average_over_par': round(avg_relative, 2),
            'rounds_played': len(stats['scores']),
            'difficulty_rating': 'Very Hard' if avg_relative > 15 else 'Hard' if avg_relative > 10 else 'Moderate' if avg_relative > 5 else 'Manageable',
            'best_score': min(stats['scores']),
            'worst_score': max(stats['scores'])
        }
    
    # Rank courses by difficulty
    sorted_courses = sorted(course_analysis.items(), key=lambda x: x[1]['average_over_par'], reverse=True)
    
    return {
        'course_stats': course_analysis,
        'difficulty_ranking': [{'course': course, 'avg_over_par': stats['average_over_par']} for course, stats in sorted_courses]
    }

def calculate_head_to_head_records(match_play_results: List[Dict]) -> Dict[str, Any]:
    """Calculate head-to-head records from match play day"""
    
    # Sort players by match play points
    sorted_players = sorted(match_play_results, key=lambda x: x['total_points'], reverse=True)
    
    head_to_head = {
        'match_play_leaderboard': [
            {
                'player': player['player'],
                'points': player['total_points'],
                'percentage': round((player['total_points'] / 18) * 100, 1)
            }
            for player in sorted_players
        ],
        'match_play_champion': sorted_players[0]['player'] if sorted_players else None,
        'dominant_performers': [p for p in sorted_players if p['total_points'] >= 10],
        'struggled_performers': [p for p in sorted_players if p['total_points'] <= 7]
    }
    
    return head_to_head

def calculate_performance_trends(individual_scores: List[Dict], players: List[str]) -> Dict[str, Any]:
    """Calculate performance trends across the 4 days"""
    
    # Get individual rounds only
    individual_rounds = [
        score for score in individual_scores 
        if score['player'] in players and score['format'] not in ['Scramble', 'Best Ball Team']
    ]
    
    player_trends = {}
    
    for player in players:
        player_rounds = [r for r in individual_rounds if r['player'] == player]
        player_rounds.sort(key=lambda x: x['day'])
        
        if len(player_rounds) < 2:
            continue
            
        daily_scores = []
        daily_relative = []
        
        for round_data in player_rounds:
            daily_scores.append(round_data['score'])
            daily_relative.append(round_data['score'] - round_data['par'])
        
        # Calculate trend
        if len(daily_scores) > 1:
            score_trend = daily_scores[-1] - daily_scores[0]  # Final day vs first day
            relative_trend = daily_relative[-1] - daily_relative[0]
            
            # Determine trend direction
            if score_trend < -3:
                trend_direction = 'Strong Improvement'
            elif score_trend < 0:
                trend_direction = 'Improvement'
            elif score_trend <= 3:
                trend_direction = 'Consistent'
            else:
                trend_direction = 'Decline'
            
            player_trends[player] = {
                'daily_scores': daily_scores,
                'daily_relative_to_par': daily_relative,
                'score_change': score_trend,
                'relative_change': relative_trend,
                'trend_direction': trend_direction,
                'most_improved_day': find_best_improvement(daily_scores),
                'consistency_across_days': round(statistics.stdev(daily_scores), 2) if len(daily_scores) > 1 else 0
            }
    
    return player_trends

def find_best_improvement(scores: List[int]) -> str:
    """Find the day with the best improvement"""
    if len(scores) < 2:
        return 'N/A'
    
    best_improvement = 0
    best_day = 'N/A'
    
    for i in range(1, len(scores)):
        improvement = scores[i-1] - scores[i]  # Negative score change is improvement
        if improvement > best_improvement:
            best_improvement = improvement
            best_day = f'Day {i+1}'
    
    return best_day if best_improvement > 0 else 'No significant improvement'

def generate_tournament_insights(individual_scores: List[Dict], match_play_results: List[Dict], 
                               player_stats: List[Dict], players: List[str]) -> Dict[str, Any]:
    """Generate fun facts and insights about the tournament"""
    
    # Get individual rounds
    individual_rounds = [
        score for score in individual_scores 
        if score['player'] in players and score['format'] not in ['Scramble', 'Best Ball Team']
    ]
    
    # Calculate various superlatives
    player_totals = defaultdict(int)
    player_rounds_count = defaultdict(int)
    
    for round_data in individual_rounds:
        player_totals[round_data['player']] += round_data['score']
        player_rounds_count[round_data['player']] += 1
    
    # Find various achievements
    lowest_round = min(individual_rounds, key=lambda x: x['score'])
    highest_round = max(individual_rounds, key=lambda x: x['score'])
    
    # Most consistent player (lowest standard deviation)
    most_consistent = None
    lowest_std = float('inf')
    
    for player in players:
        player_scores = [r['score'] for r in individual_rounds if r['player'] == player]
        if len(player_scores) > 1:
            std = statistics.stdev(player_scores)
            if std < lowest_std:
                lowest_std = std
                most_consistent = player
    
    # Match play dominator
    match_play_winner = max(match_play_results, key=lambda x: x['total_points'])
    
    # Most birdies, most big numbers
    most_birdies = max(player_stats, key=lambda x: int(x.get('birdies', 0)))
    most_pars = max(player_stats, key=lambda x: int(x.get('pars', 0)))
    most_big_numbers = max(player_stats, key=lambda x: int(x.get('quadruple_bogeys', 0)) + int(x.get('quintuple_plus', 0)))
    
    return {
        'tournament_champion': min(player_totals.items(), key=lambda x: x[1])[0] if player_totals else None,
        'lowest_single_round': {
            'player': lowest_round['player'],
            'score': lowest_round['score'],
            'course': lowest_round['course'],
            'day': lowest_round['day']
        },
        'highest_single_round': {
            'player': highest_round['player'],
            'score': highest_round['score'],
            'course': highest_round['course'],
            'day': highest_round['day']
        },
        'most_consistent_player': {
            'player': most_consistent,
            'standard_deviation': round(lowest_std, 2) if most_consistent else None
        },
        'match_play_dominator': {
            'player': match_play_winner['player'],
            'points': match_play_winner['total_points']
        },
        'birdie_machine': {
            'player': most_birdies['player'],
            'birdies': int(most_birdies['birdies'])
        },
        'steady_eddie': {
            'player': most_pars['player'],
            'pars': int(most_pars['pars'])
        },
        'big_number_specialist': {
            'player': most_big_numbers['player'],
            'big_numbers': int(most_big_numbers['quadruple_bogeys']) + int(most_big_numbers['quintuple_plus'])
        },
        'fun_facts': generate_fun_facts(individual_rounds, match_play_results, player_stats, players)
    }

def generate_fun_facts(individual_rounds: List[Dict], match_play_results: List[Dict], 
                      player_stats: List[Dict], players: List[str]) -> List[str]:
    """Generate a list of fun facts about the tournament"""
    facts = []
    
    # Total strokes
    total_strokes = sum(r['score'] for r in individual_rounds)
    facts.append(f"The group combined for {total_strokes} total strokes across all individual rounds")
    
    # Course comparisons
    course_averages = defaultdict(list)
    for round_data in individual_rounds:
        course_averages[round_data['course']].append(round_data['score'] - round_data['par'])
    
    easiest_course = min(course_averages.items(), key=lambda x: sum(x[1])/len(x[1]))
    hardest_course = max(course_averages.items(), key=lambda x: sum(x[1])/len(x[1]))
    
    facts.append(f"{easiest_course[0]} was the most player-friendly course (avg +{round(sum(easiest_course[1])/len(easiest_course[1]), 1)})")
    facts.append(f"{hardest_course[0]} proved the most challenging (avg +{round(sum(hardest_course[1])/len(hardest_course[1]), 1)})")
    
    # Birdie drought
    total_birdies = sum(int(p.get('birdies', 0)) for p in player_stats)
    total_holes = len(players) * 54  # 8 players × 54 holes each
    facts.append(f"Only {total_birdies} birdies were made out of {total_holes} total holes played ({round((total_birdies/total_holes)*100, 1)}%)")
    
    # Match play facts
    match_play_total = sum(float(mp['total_points']) for mp in match_play_results)
    facts.append(f"In match play, the group earned {match_play_total} out of {len(players) * 18} possible points")
    
    return facts

def save_results_to_json(results: Dict[str, Any]):
    """Save all calculated statistics to JSON file"""
    with open('advanced_stats.json', 'w') as file:
        json.dump(results, file, indent=2)
    
    print("Advanced statistics saved to advanced_stats.json")
    print(f"Analyzed {len(results['player_statistics'])} players across {results['tournament_summary']['courses_played']} courses")

if __name__ == "__main__":
    print("Calculating advanced golf statistics...")
    results = calculate_player_statistics()
    save_results_to_json(results)
    print("Analysis complete!")