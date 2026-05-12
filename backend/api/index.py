"""Vercel serverless entry point.

Adds the backend root to sys.path so `from server import app` works
regardless of where Vercel's Python runtime sets the working directory,
then exposes the FastAPI ASGI app for Vercel's @vercel/python builder.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from server import app  # noqa: E402,F401
