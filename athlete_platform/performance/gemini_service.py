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

    # Prepare the data string for the AI
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
        # We use gemini-2.5-flash as it is fast and highly cost-effective for these text tasks
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"⚠️ **An error occurred during AI generation**: {str(e)}"
