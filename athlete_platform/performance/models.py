from django.db import models
from accounts.models import CustomUser

class DailyLog(models.Model):
    athlete = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField()
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=1, help_text="Hours of sleep last night")
    fatigue_level = models.IntegerField(help_text="1 (Very Fresh) to 10 (Exhausted)")
    training_duration_mins = models.IntegerField(default=0, help_text="Total minutes of training today")
    perceived_exertion = models.IntegerField(default=0, help_text="RPE from 1 (Very Light) to 10 (Max Effort)")
    
    # Recovery & Readiness
    muscle_soreness = models.IntegerField(default=1, help_text="1 (None) to 10 (Extreme)")
    stress_level = models.IntegerField(default=1, help_text="1 (Very Low) to 10 (Very High)")
    
    # Health Metrics
    resting_heart_rate = models.IntegerField(blank=True, null=True, help_text="Resting Heart Rate in BPM")
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Weight in KG")
    
    # Nutrition
    diet_quality = models.IntegerField(default=5, help_text="1 (Poor) to 10 (Excellent)")
    hydration_liters = models.DecimalField(max_digits=4, decimal_places=1, default=2.0, help_text="Liters of water consumed")

    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('athlete', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.athlete.username} - {self.date}"


class CricketPerformance(models.Model):
    """
    Performance statistics for cricket athletes (batsman/bowler), including
    overall match/innings stats and granular Pace (Medium Fast) vs. Spin breakdown.
    Can be manually entered and updated as requested by client.
    """
    athlete = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cricket_stats')
    
    # 1. Overall Batsman Match Stats
    matches_played = models.PositiveIntegerField(default=0, help_text="Total matches played")
    innings = models.PositiveIntegerField(default=0, help_text="Total innings batted")
    runs_made = models.PositiveIntegerField(default=0, help_text="Total runs scored")
    wickets = models.PositiveIntegerField(default=0, help_text="Wickets taken (if secondary bowling)")
    batting_average = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="Batting average")
    centuries = models.PositiveIntegerField(default=0, help_text="100s scored")
    half_centuries = models.PositiveIntegerField(default=0, help_text="50s scored")
    fours = models.PositiveIntegerField(default=0, help_text="4s hit")
    sixes = models.PositiveIntegerField(default=0, help_text="6s hit")
    strike_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="Batting strike rate")
    highest_score = models.CharField(max_length=15, default='0', blank=True, help_text="e.g. 112* or 84")
    not_outs = models.PositiveIntegerField(default=0, help_text="Times not out")

    # 2. Granular Splits: Against Medium Fast / Pace Bowlers
    balls_faced_medium_fast = models.PositiveIntegerField(default=0, help_text="Balls faced against Medium Fast bowlers")
    runs_scored_medium_fast = models.PositiveIntegerField(default=0, help_text="Runs scored against Medium Fast bowlers")
    dismissals_medium_fast = models.PositiveIntegerField(default=0, help_text="Dismissals against Medium Fast bowlers")

    # 3. Granular Splits: Against Spin Bowlers
    balls_faced_spin = models.PositiveIntegerField(default=0, help_text="Balls faced against Spin bowlers")
    runs_scored_spin = models.PositiveIntegerField(default=0, help_text="Runs scored against Spin bowlers")
    dismissals_spin = models.PositiveIntegerField(default=0, help_text="Dismissals against Spin bowlers")

    notes = models.TextField(blank=True, null=True, help_text="Coach notes or season targets")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Cricket Stats: {self.athlete.username} - Runs: {self.runs_made}, Avg: {self.batting_average}"

    def save(self, *args, **kwargs):
        # Auto-compute average if 0 and innings > 0
        dismissals_total = self.dismissals_medium_fast + self.dismissals_spin
        effective_dismissals = max(dismissals_total, (self.innings - self.not_outs))
        if self.batting_average == 0 and effective_dismissals > 0 and self.runs_made > 0:
            self.batting_average = round(self.runs_made / effective_dismissals, 2)
        
        # Auto-compute strike rate if 0 and balls faced > 0
        total_balls = self.balls_faced_medium_fast + self.balls_faced_spin
        if self.strike_rate == 0 and total_balls > 0 and self.runs_made > 0:
            self.strike_rate = round((self.runs_made / total_balls) * 100, 2)

        super().save(*args, **kwargs)

    @property
    def total_balls_faced(self):
        return self.balls_faced_medium_fast + self.balls_faced_spin

    @property
    def sr_medium_fast(self):
        if self.balls_faced_medium_fast > 0:
            return round((self.runs_scored_medium_fast / self.balls_faced_medium_fast) * 100, 2)
        return 0.00

    @property
    def sr_spin(self):
        if self.balls_faced_spin > 0:
            return round((self.runs_scored_spin / self.balls_faced_spin) * 100, 2)
        return 0.00

    @property
    def avg_medium_fast(self):
        if self.dismissals_medium_fast > 0:
            return round(self.runs_scored_medium_fast / self.dismissals_medium_fast, 2)
        return float(self.runs_scored_medium_fast)

    @property
    def avg_spin(self):
        if self.dismissals_spin > 0:
            return round(self.runs_scored_spin / self.dismissals_spin, 2)
        return float(self.runs_scored_spin)
