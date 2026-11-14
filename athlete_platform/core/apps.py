from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Initialize Firebase Admin SDK from environment if configured
        try:
            from core.firebase import initialize_firebase
            initialize_firebase()
        except Exception as e:
            logger.debug(f"Firebase auto-initialization deferred: {e}")

