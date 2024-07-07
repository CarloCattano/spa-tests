from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='index'),
    path('home_data', views.home_data, name='home_data'),
    path('about_data', views.about_data, name='about_data'),
    path('contact_data', views.contact_data, name='contact_data'),

    path('login', views.login, name='login'),
    path('protected_data', views.protected_data, name='protected_data'),

    # accounts login for handling login    
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
]
