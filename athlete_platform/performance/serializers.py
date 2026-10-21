from rest_framework import serializers
from .models import DailyLog, CricketPerformance

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = [
            'id', 'athlete', 'date', 'sleep_hours', 'fatigue_level',
            'training_duration_mins', 'perceived_exertion', 'notes',
            'muscle_soreness', 'stress_level', 'resting_heart_rate', 
            'weight_kg', 'diet_quality', 'hydration_liters'
        ]
        read_only_fields = ['athlete']

class CricketPerformanceSerializer(serializers.ModelSerializer):
    athlete_username = serializers.ReadOnlyField(source='athlete.username')
    athlete_name = serializers.SerializerMethodField()
    athlete_avatar = serializers.SerializerMethodField()
    athlete_details = serializers.SerializerMethodField()

    total_balls_faced = serializers.ReadOnlyField()
    sr_medium_fast = serializers.ReadOnlyField()
    sr_spin = serializers.ReadOnlyField()
    avg_medium_fast = serializers.ReadOnlyField()
    avg_spin = serializers.ReadOnlyField()

    class Meta:
        model = CricketPerformance
        fields = [
            'id', 'athlete', 'athlete_username', 'athlete_name', 'athlete_avatar', 'athlete_details',
            'matches_played', 'innings', 'runs_made', 'wickets', 'batting_average',
            'centuries', 'half_centuries', 'fours', 'sixes', 'strike_rate',
            'highest_score', 'not_outs',
            'balls_faced_medium_fast', 'runs_scored_medium_fast', 'dismissals_medium_fast',
            'balls_faced_spin', 'runs_scored_spin', 'dismissals_spin',
            'total_balls_faced', 'sr_medium_fast', 'sr_spin', 'avg_medium_fast', 'avg_spin',
            'notes', 'updated_at', 'created_at'
        ]
        read_only_fields = ['athlete']

    def get_athlete_name(self, obj):
        name = f"{obj.athlete.first_name} {obj.athlete.last_name}".strip()
        return name if name else obj.athlete.username

    def get_athlete_avatar(self, obj):
        if obj.athlete.avatar:
            return obj.athlete.avatar.url
        return None

    def get_athlete_details(self, obj):
        if hasattr(obj.athlete, 'athlete_profile'):
            p = obj.athlete.athlete_profile
            return {
                'primary_role': p.playing_role,
                'secondary_role': p.secondary_role,
                'club_name': p.club_name,
                'age': p.age,
                'height': p.height,
                'weight': p.weight,
                'batting_hand': p.batting_hand,
                'bowling_style': p.bowling_style,
                'preferred_position': p.preferred_position,
            }
        return {}
