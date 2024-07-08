### How to run:

if not on docker first create a virtual env:
```bash
   python3 -m venv testenv
   source testenv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
```

to run the server:

```bash
python manage.py runserver 4222
```


Adding users via script:
   - Neat way to init the db to test things, runs a command in django shell that can do operations, in this case adding an user
```bash
cat createusers.py | python manage.py shell
```
