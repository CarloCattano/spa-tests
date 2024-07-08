from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .forms import LoginForm
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth import logout as django_logout  # Import logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.template import RequestContext
from .auth42 import exchange_code_for_token, get_user_data
from django.conf import settings

import secrets
import logging
import random
import string

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'index.html')

def home_data(request):
    data = {"title": "Home", "content": "Welcome to the Home Page"}
    return JsonResponse(data)

def about_data(request):
    data = {"title": "About", "content": "Welcome to the About Page"}
    return JsonResponse(data)

def contact_data(request):
    data = {"title": "Contact", "content": "Welcome to the Contact Page"}
    return JsonResponse(data)

def protected_data(request):

    if not request.user.is_authenticated:
        # render please login view template
        data = render_to_string('registration/needlogin.html', request=request)
        return JsonResponse(data, safe=False)

    #username 
    username = request.user.username

    html = render_to_string('protected.html', request=request, context={"username": username})
    return JsonResponse(html, safe=False) 


def logout(request):
    if request.method == 'POST':
        django_logout(request)
    template = render_to_string('registration/logout.html', request=request)
    data = {
            "title": "Logout",
            "content": template,
            }

    return JsonResponse(data)

def login(request):

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                django_login(request, user)
                data = {"title": "Login", "content": "Login successful"}
                return JsonResponse(data)
            else:
                data = {"title": "Login", "content": "Invalid username or password"}
                return JsonResponse(data, status=400)
        else:
            data = {"title": "Login", "content": "Form validation failed"}
            return JsonResponse(data, status=400)
    else:
        form = LoginForm()
        html_form = render_to_string('partial.html', {'form': form}, request=request)
        data = {
            "title": "Login",
            "content": html_form
        }
        return JsonResponse(data)


def generate_state():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def auth42(request):
    state = generate_state()
    request.session['oauth_state'] = state
    client_id = settings.CLIENT_ID
    redirect_uri = settings.REDIRECT_URI
    auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=public&state={state}"
    return redirect(auth_url)


def redirect_view(request):
    code = request.GET.get('code')
    state = request.GET.get('state')
    session_state = request.session.get('oauth_state')
    logger.info(f"Received state: {state}, session state: {session_state}")

    if state != session_state:
        return HttpResponse('Invalid state parameter', status=400)

    redirect_uri = settings.REDIRECT_URI
    access_token = exchange_code_for_token(code, redirect_uri)
    logger.info(f"Access token: {access_token}")

    if access_token:
        request.session['access_token'] = access_token
        user_data = get_user_data(access_token)
        if user_data:
            request.session['user_data'] = user_data
            return redirect('/')
        else:
            return HttpResponse('No user data returned', status=404)
    else:
        return HttpResponse('Failed to exchange code for access token', status=400)
