"""
Firebase Admin SDK Initialization Module for DronaMate Backend.

Security Requirement:
Retrieves the Firebase Service Account credentials as a JSON string from the
FIREBASE_CREDENTIALS environment variable, parses it into a dictionary via json.loads(),
and initializes firebase_admin using credentials.Certificate().
No hardcoded paths or credential files on disk are used.
"""

import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, auth

logger = logging.getLogger(__name__)

_firebase_app = None


def initialize_firebase():
    """
    Initializes and returns the Firebase Admin SDK application instance.
    Safe against multiple initialization calls.
    """
    global _firebase_app

    # Check if already initialized to prevent duplicate app errors
    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app

    # Retrieve credentials strictly from environment variable
    raw_credentials = os.environ.get('FIREBASE_CREDENTIALS')
    if not raw_credentials:
        logger.warning(
            "FIREBASE_CREDENTIALS environment variable is not set. "
            "Firebase Admin SDK skipped. Set FIREBASE_CREDENTIALS on Railway/environment to enable."
        )
        return None

    try:
        # Parse the JSON string from environment variable into dictionary
        cred_dict = json.loads(raw_credentials)
        cred = credentials.Certificate(cred_dict)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully from environment variable.")
        return _firebase_app
    except json.JSONDecodeError as exc:
        logger.error(f"Failed to parse FIREBASE_CREDENTIALS environment variable as valid JSON: {exc}")
        raise ValueError(
            "FIREBASE_CREDENTIALS must be a valid JSON string of the Firebase service account key."
        ) from exc
    except Exception as exc:
        logger.error(f"Failed to initialize Firebase Admin SDK: {exc}")
        raise


def get_firebase_app():
    """Returns the current Firebase app instance, initializing if necessary."""
    global _firebase_app
    if not _firebase_app and not firebase_admin._apps:
        return initialize_firebase()
    return _firebase_app or firebase_admin.get_app()


def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token sent from the React frontend.
    Returns decoded token dictionary on success, or raises an exception.
    """
    app = get_firebase_app()
    if not app:
        raise RuntimeError("Firebase Admin SDK is not initialized. Ensure FIREBASE_CREDENTIALS is set.")
    return auth.verify_id_token(id_token, app=app)

