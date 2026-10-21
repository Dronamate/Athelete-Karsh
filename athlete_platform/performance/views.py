from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DailyLog, CricketPerformance
from .serializers import DailyLogSerializer, CricketPerformanceSerializer
from .gemini_service import generate_performance_analysis, generate_cricket_batsman_analysis

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'ATHLETE':
            return DailyLog.objects.filter(athlete=user)
            
        if user.role == 'PROFESSIONAL':
            athlete_id = self.request.query_params.get('athlete_id')
            if athlete_id:
                return DailyLog.objects.filter(athlete_id=athlete_id)
            return DailyLog.objects.all()
            
        return DailyLog.objects.none()

    def perform_create(self, serializer):
        serializer.save(athlete=self.request.user)

    @action(detail=False, methods=['get'])
    def ai_analysis(self, request):
        """
        Generates an AI recovery analysis based on the athlete's last 7 logs.
        """
        if request.user.role != 'ATHLETE':
            return Response({"error": "Only athletes can generate personal AI analysis."}, status=status.HTTP_403_FORBIDDEN)
            
        recent_logs = DailyLog.objects.filter(athlete=request.user).order_by('-date')[:7]
        
        if not recent_logs:
            return Response({"analysis": "You don't have any daily logs yet. Please fill out your daily performance tracker first!"})
            
        analysis_markdown = generate_performance_analysis(recent_logs)
        
        return Response({
            "analysis": analysis_markdown
        })


class CricketPerformanceViewSet(viewsets.ModelViewSet):
    """
    Handles Cricket Performance metrics (manual entry, pace vs spin splits, batsman analytics).
    """
    serializer_class = CricketPerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ATHLETE':
            return CricketPerformance.objects.filter(athlete=user)
        if user.role in ['PROFESSIONAL', 'ADMIN']:
            athlete_id = self.request.query_params.get('athlete_id')
            if athlete_id:
                return CricketPerformance.objects.filter(athlete_id=athlete_id)
            return CricketPerformance.objects.all()
        return CricketPerformance.objects.none()

    @action(detail=False, methods=['get', 'post', 'patch'], url_path='my_stats')
    def my_stats(self, request):
        """
        Fetch or update current athlete's manual cricket performance metrics.
        """
        if request.user.role != 'ATHLETE':
            return Response({"error": "Only athletes have personal cricket stats."}, status=status.HTTP_403_FORBIDDEN)

        stats, created = CricketPerformance.objects.get_or_create(athlete=request.user)

        if request.method == 'GET':
            serializer = CricketPerformanceSerializer(stats)
            return Response(serializer.data)

        # POST / PATCH update
        serializer = CricketPerformanceSerializer(stats, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='athlete/(?P<athlete_id>[^/.]+)')
    def get_by_athlete(self, request, athlete_id=None):
        """
        Allow coaches/professionals to view an athlete's cricket performance metrics.
        """
        try:
            stats, _ = CricketPerformance.objects.get_or_create(athlete_id=athlete_id)
            serializer = CricketPerformanceSerializer(stats)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='ai_batsman_analysis')
    def ai_batsman_analysis(self, request):
        """
        Generate AI tactical analysis for a batsman's performance stats.
        """
        user = request.user
        target_user = user
        if user.role in ['PROFESSIONAL', 'ADMIN'] and request.data.get('athlete_id'):
            from accounts.models import CustomUser
            try:
                target_user = CustomUser.objects.get(id=request.data.get('athlete_id'))
            except CustomUser.DoesNotExist:
                return Response({"error": "Athlete not found."}, status=status.HTTP_404_NOT_FOUND)

        stats, _ = CricketPerformance.objects.get_or_create(athlete=target_user)
        
        details = {}
        if hasattr(target_user, 'athlete_profile'):
            p = target_user.athlete_profile
            details = {
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

        analysis_md = generate_cricket_batsman_analysis(stats, details)
        return Response({"analysis": analysis_md})
