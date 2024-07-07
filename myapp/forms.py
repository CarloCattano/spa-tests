# make login forms here for django login
from django import forms

# serializable form that can be converted to json
class LoginForm(forms.Form):
    username = forms.CharField(label='Username', max_length=100)
    password = forms.CharField(label='Password', max_length=100)

