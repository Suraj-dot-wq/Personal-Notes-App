from django.urls import path

from .views import (
    getRoutes,
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
)

from .auth_views import register, current_user

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)


urlpatterns = [
    path('', getRoutes, name='routes'),

    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', current_user, name='current-user'),

    # Notes
    path('notes/', getNotes, name='notes'),

    # IMPORTANT: create must come BEFORE <str:pk>
    path('notes/create/', createNote, name='create-note'),

    path('notes/<str:pk>/', getNote, name='note'),
    path('notes/<str:pk>/update/', updateNote, name='update-note'),
    path('notes/<str:pk>/delete/', deleteNote, name='delete-note'),
]