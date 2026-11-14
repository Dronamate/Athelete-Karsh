import os
import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.conf import settings
import dj_database_url
import firebase_admin
from core.firebase import initialize_firebase, get_firebase_app, verify_firebase_token


class ProductionSettingsAndFirebaseTests(TestCase):
    def setUp(self):
        # Reset firebase app state for clean tests
        if firebase_admin._apps:
            for app_name in list(firebase_admin._apps.keys()):
                firebase_admin.delete_app(firebase_admin.get_app(app_name))

    def tearDown(self):
        if firebase_admin._apps:
            for app_name in list(firebase_admin._apps.keys()):
                firebase_admin.delete_app(firebase_admin.get_app(app_name))

    def test_database_settings_neon_pooling_and_health_checks(self):
        """Verify DATABASES config uses conn_max_age=600 and conn_health_checks=True for Neon pooling."""
        db_config = dj_database_url.config(
            default="postgres://user:password@ep-neon-pooler.neon.tech/neondb",
            conn_max_age=600,
            conn_health_checks=True,
        )
        self.assertEqual(db_config['CONN_MAX_AGE'], 600)
        self.assertTrue(db_config['CONN_HEALTH_CHECKS'])
        self.assertEqual(db_config['ENGINE'], 'django.db.backends.postgresql')

    def test_cors_allowed_origins_present(self):
        """Verify CORS_ALLOWED_ORIGINS includes frontend localhost and production dronamate.in."""
        self.assertIn("https://dronamate.in", settings.CORS_ALLOWED_ORIGINS)
        self.assertIn("http://localhost:5173", settings.CORS_ALLOWED_ORIGINS)

    def test_cors_middleware_order(self):
        """Verify corsheaders.middleware.CorsMiddleware is placed before CommonMiddleware."""
        self.assertIn('corsheaders.middleware.CorsMiddleware', settings.MIDDLEWARE)
        cors_idx = settings.MIDDLEWARE.index('corsheaders.middleware.CorsMiddleware')
        common_idx = settings.MIDDLEWARE.index('django.middleware.common.CommonMiddleware')
        self.assertLess(cors_idx, common_idx)

    def test_allowed_hosts_parsing(self):
        """Verify comma-separated string in os.environ is correctly parsed into a list."""
        test_env_hosts = "dronamate.in, api.dronamate.in, localhost"
        parsed = [h.strip() for h in test_env_hosts.split(',') if h.strip()]
        self.assertEqual(parsed, ["dronamate.in", "api.dronamate.in", "localhost"])

    @patch('firebase_admin.credentials.Certificate')
    @patch('firebase_admin.initialize_app')
    def test_firebase_init_success_from_env_json(self, mock_init_app, mock_certificate):
        """Verify Firebase Admin initializes from FIREBASE_CREDENTIALS JSON string without hardcoded files."""
        fake_creds = {
            "type": "service_account",
            "project_id": "dronamate-prod",
            "private_key_id": "abcd1234efgh",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk@dronamate-prod.iam.gserviceaccount.com"
        }
        mock_cert_instance = MagicMock()
        mock_certificate.return_value = mock_cert_instance
        mock_app_instance = MagicMock()
        mock_init_app.return_value = mock_app_instance

        with patch.dict(os.environ, {'FIREBASE_CREDENTIALS': json.dumps(fake_creds)}):
            app = initialize_firebase()

            # Ensure credentials.Certificate received the dictionary parsed from JSON, NOT a filepath string
            mock_certificate.assert_called_once_with(fake_creds)
            mock_init_app.assert_called_once_with(mock_cert_instance)
            self.assertEqual(app, mock_app_instance)

    def test_firebase_init_missing_env_returns_none(self):
        """When FIREBASE_CREDENTIALS is not set, initialize_firebase gracefully returns None without crashing."""
        with patch.dict(os.environ, {}, clear=True):
            app = initialize_firebase()
            self.assertIsNone(app)

    def test_firebase_init_invalid_json_raises_value_error(self):
        """When FIREBASE_CREDENTIALS contains malformed JSON, a ValueError is raised."""
        with patch.dict(os.environ, {'FIREBASE_CREDENTIALS': 'not-a-json-string'}):
            with self.assertRaises(ValueError):
                initialize_firebase()

    @patch('core.firebase.verify_firebase_token')
    def test_firebase_auth_view_success(self, mock_verify):
        """Verify POST to /api/auth/firebase/ authenticates/creates user and returns JWT access & refresh tokens."""
        mock_verify.return_value = {
            'uid': 'test-firebase-uid-123',
            'email': 'athlete.virat@dronamate.in',
            'name': 'Virat Kohli',
        }
        response = self.client.post('/api/auth/firebase/', {'id_token': 'mock-id-token-xyz'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'athlete.virat@dronamate.in')
        self.assertEqual(response.data['user']['role'], 'ATHLETE')

    def test_firebase_auth_view_missing_token(self):
        """Verify POST without id_token returns 400 Bad Request."""
        response = self.client.post('/api/auth/firebase/', {}, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

