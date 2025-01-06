from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('chat_with_ai/', views.chat_with_ai, name='chat_with_ai'),
    path('run_flow/', views.run_flow, name='run_flow'),
]
