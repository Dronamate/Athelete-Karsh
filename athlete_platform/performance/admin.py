from django.contrib import admin
from .models import DailyLog, CricketPerformance

@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'date', 'sleep_hours', 'fatigue_level', 'perceived_exertion', 'training_duration_mins')
    list_filter = ('date', 'athlete')
    search_fields = ('athlete__username', 'athlete__email')

@admin.register(CricketPerformance)
class CricketPerformanceAdmin(admin.ModelAdmin):
    list_display = ('athlete', 'matches_played', 'innings', 'runs_made', 'batting_average', 'strike_rate', 'centuries', 'half_centuries', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('athlete__username', 'athlete__first_name', 'athlete__last_name')
