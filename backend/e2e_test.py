import urllib.request
import json
from urllib.error import HTTPError

BASE = "http://127.0.0.1:8001"

def post_json(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(BASE + path, data=data, headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode()
    except HTTPError as e:
        body = e.read().decode()
        return f"HTTP {e.code}: {body}"

# Register
print('Registering user...')
print(post_json('/auth/register', {
    'full_name':'Test User',
    'email':'test2@example.com',
    'phone':'1234567890',
    'address':'123 Test St',
    'password':'secret123'
}))

# Login
print('\nLogging in...')
# The login endpoint currently expects query parameters, so call with query string
login_url = BASE + '/auth/login?email=test2@example.com&password=secret123'
try:
    with urllib.request.urlopen(login_url, data=b'') as resp:
        login = resp.read().decode()
except HTTPError as e:
    login = f"HTTP {e.code}: " + e.read().decode()

print(login)

# Parse token
try:
    token = json.loads(login).get('access_token')
except Exception:
    token = None

if token:
    print('\nCalling account endpoint (should be 404 or empty)')
    req = urllib.request.Request(BASE + '/bank/accounts/1', headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as resp:
            print(resp.read().decode())
    except HTTPError as e:
        print(f'HTTP {e.code}: ' + e.read().decode())
else:
    print('Login failed, no token.')
