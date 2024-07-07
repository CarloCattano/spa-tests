from django.shortcuts import render
from django.http import JsonResponse
from .forms import LoginForm
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.decorators import login_required

def index(request):
    data = {
        "user": request.user.username if request.user.is_authenticated else "Guest",
    }
    return render(request, 'index.html', data)

def home_data(request):
    data = {"title": "Home", "content": "Welcome to the Home Page"}
    return JsonResponse(data)

def about_data(request):
    data = {"title": "About", "content": "Welcome to the About Page"}
    return JsonResponse(data)

def contact_data(request):
    data = {"title": "Contact", "content": "Welcome to the Contact Page"}
    return JsonResponse(data)

@login_required
def protected_data(request):
    data = {"title": "Protected", "content": "Welcome to the protected page, accessible only to logged-in users."}
    user = request.user
    data['username'] = user.username
    # render template to string with user data
    html = render_to_string('protected.html', data)
    data['content'] = html
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

