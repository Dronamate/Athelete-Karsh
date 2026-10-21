import os
import google.generativeai as genai
from django.conf import settings

# Configure the API key from environment variables
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def generate_performance_analysis(logs):
    """
    Takes a list of DailyLog instances and generates an AI performance analysis.
    """
    if not os.environ.get("GEMINI_API_KEY"):
        return "⚠️ **AI Analysis Unavailable**: Gemini API Key is missing from the server environment."

    data_text = "Here is the athlete's recent daily log data:\n\n"
    for log in logs:
        data_text += f"- Date: {log.date}\n"
        data_text += f"  Sleep: {log.sleep_hours} hrs, Fatigue: {log.fatigue_level}/10, Exertion: {log.perceived_exertion}/10\n"
        data_text += f"  Soreness: {log.muscle_soreness}/10, Stress: {log.stress_level}/10\n"
        data_text += f"  Diet Quality: {log.diet_quality}/10, Hydration: {log.hydration_liters}L\n"
        data_text += f"  Training Duration: {log.training_duration_mins} mins\n\n"

    prompt = f"""
You are an elite, world-class Cricket performance coach and sports nutritionist.
Analyze the following daily logs of a cricket athlete over the last several days.

{data_text}

Provide your analysis in clean Markdown format with the following sections:
### 📈 Match Readiness & Recovery
(Analyze their sleep, fatigue, and stress. Determine if they are ready for a high-intensity nets session or match)

### 💡 Cricket-Specific Advice
(Provide 2-3 actionable tips based on their recent metrics, tailored to cricket training)

### 🥗 Fueling Plan (Next 24 Hours)
(Provide a specific meal plan focusing on recovery or match-day fueling based on their current fatigue and diet quality)

### 🏏 Suggested Nets/Training Plan
(Suggest a tailored cricket practice or recovery routine for today, keeping their soreness and exertion in mind. Specify batting, bowling, or fielding focus if applicable.)

Be encouraging, highly professional, and direct. Use bullet points where appropriate.
"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"⚠️ **An error occurred during AI generation**: {str(e)}"


def generate_cricket_batsman_analysis(stats, details=None):
    """
    Takes a CricketPerformance instance and optional athlete profile details,
    generating an elite cricket batsman tactical and analytical report.
    """
    if not os.environ.get("GEMINI_API_KEY"):
        return "⚠️ **AI Analysis Unavailable**: Gemini API Key is missing from the server environment."

    player_info = ""
    if details:
        player_info = f"""
Player Profile:
- Batting Hand: {details.get('batting_hand', 'Right-hand bat')}
- Primary Role: {details.get('primary_role', 'Batsman')}
- Secondary Role: {details.get('secondary_role', 'None')}
- Preferred Position: {details.get('preferred_position', 'Top-Order')}
- Club/Academy: {details.get('club_name', 'Not specified')}
- Age: {details.get('age', 'N/A')}, Height: {details.get('height', 'N/A')}, Weight: {details.get('weight', 'N/A')}
"""

    stats_summary = f"""
Batting Stats:
- Matches: {stats.matches_played}, Innings: {stats.innings}, Runs: {stats.runs_made}
- Average: {stats.batting_average}, Strike Rate: {stats.strike_rate}
- Centuries (100s): {stats.centuries}, Fifties (50s): {stats.half_centuries}
- Boundaries: {stats.fours} Fours, {stats.sixes} Sixes, Highest Score: {stats.highest_score}

Pace / Medium Fast Breakdown:
- Balls Faced: {stats.balls_faced_medium_fast}
- Runs Scored: {stats.runs_scored_medium_fast}
- Dismissals: {stats.dismissals_medium_fast}
- Strike Rate vs Pace: {stats.sr_medium_fast}
- Average vs Pace: {stats.avg_medium_fast}

Spin Breakdown:
- Balls Faced: {stats.balls_faced_spin}
- Runs Scored: {stats.runs_scored_spin}
- Dismissals: {stats.dismissals_spin}
- Strike Rate vs Spin: {stats.sr_spin}
- Average vs Spin: {stats.avg_spin}
"""

    prompt = f"""
You are a master Cricket batting coach and performance analyst (think of coaching at international and IPL academy levels).
Analyze the batsman's data and provide a tactical coaching report tailored to improve their scoring areas, strike rotation, and dismissal resistance.

{player_info}

{stats_summary}

Provide your analysis in clean, inspiring Markdown with the following sections:
### 🎯 Executive Batting Assessment
(Brief evaluation of scoring efficiency, strike rate balance, and boundary-to-dot ratio)

### ⚡ Pace vs. Spin Comparative Analysis
(Compare performance against Medium Fast vs Spin: scoring rate, control, and vulnerability. Highlight where the batter thrives and where they leak wickets.)

### 🏏 Tactical Drills for Nets & Range-Hitting
(3 specific net drills targeting their identified weaknesses against pace or spin, including shot selection and footwork cues)

### 📋 Match Situational Strategy
(How they should pace their innings based on their preferred playing position: Powerplay vs Middle Overs vs Death, strike rotation against spin, handling the new ball)

Keep the tone encouraging, technical yet accessible, and structured with bullet points.
"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"⚠️ **An error occurred during AI analysis**: {str(e)}"
