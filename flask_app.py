from flask import Flask, redirect, url_for, session, request, render_template, jsonify, send_from_directory
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime, timedelta
import uuid
import random
import re
from threading import Lock

# Initialize Flask app and CORS (for cross-origin requests)
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a more secure secret key
CORS(app)

app.permanent_session_lifetime = timedelta(days=365)  # Session lasts for 1 year

@app.before_request
def make_session_permanent():
    session.permanent = True
    
app.config.update(
    SESSION_COOKIE_SECURE=True,  # Enforces HTTPS
    SESSION_COOKIE_HTTPONLY=True,  # Prevents JavaScript access
    SESSION_COOKIE_SAMESITE='Lax'  # Restricts cross-site cookie usage
)


# Initialize Firebase Admin SDK for database interaction
cred = credentials.Certificate('firebase.json')  # Replace with your actual Firebase credentials file
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Setup Google OAuth with Authlib for authentication
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id='',  # Enter your Google OAuth client ID
    client_secret='',  # Enter your Google OAuth client secret
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={'scope': 'openid profile email'},
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs'
)

# Home page route
@app.route('/')
def home():
    if 'google_token' not in session:
        return redirect(url_for('login_page'))
    
    # Check if the username is set
    users_file = 'users.json'
    users = []
    
    # Load existing users
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            users = json.load(f)
    
    user_info = session.get('user_info')
    if not user_info:
        return redirect(url_for('login_page'))

    user_email = user_info['email']
    user = next((u for u in users if u['email'] == user_email), None)
    
    if user and not user.get('username_set', False):
        return redirect(url_for('set_username'))
    
    return render_template('index.html') # Render the homepage template

# Create a post page route
@app.route('/create_post')
def create_post():
    if 'google_token' not in session:
        return redirect(url_for('login_page'))
    return render_template('create_post.html')  # Render the page for creating a confession

# Profile page route
@app.route('/profile')
def profile():
    if 'google_token' not in session:
        return redirect(url_for('login_page'))
    
    user_info = session.get('user_info')
    user_email = user_info.get('email', 'Unknown') if user_info else 'Unknown'
    
    users = load_users()
    user = next((u for u in users if u['email'] == user_email), None)
    user_username = user['username'] if user and 'username' in user else 'Unknown'
    
    return render_template('profile.html', user_email=user_email, user_username=user_username)


# Login page route
@app.route('/loginpage')
def login_page():
    return render_template('login.html')

# Google OAuth login route
@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)  # Redirect to the callback route
    return google.authorize_redirect(redirect_uri)

# Google OAuth authorization callback route
@app.route('/login/authorized')
def authorize():
    token = google.authorize_access_token()
    user_info = google.parse_id_token(token)
    session['google_token'] = token
    session['user_info'] = user_info

    # Append new user to users.json
    users_file = 'users.json'
    users = []
    
    # Load existing users
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            users = json.load(f)
    
    # Check if user already exists
    user_emails = [user['email'] for user in users]
    if user_info['email'] not in user_emails:
        new_user = {
            'id': str(uuid.uuid4()),  # Generate unique ID
            'email': user_info['email'],
            'username': None,  # No username by default
            'username_set': False  # Flag to indicate username hasn't been set
        }
        users.append(new_user)
    
    # Save updated users list
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=4)
    
    return redirect(url_for('home'))

# Logout route
@app.route('/logout')
def logout():
    session.pop('google_token', None)  # Remove token from session
    session.pop('user_info', None)  # Remove user info from session
    return redirect(url_for('login_page'))

# Get all confessions route
@app.route('/confessions', methods=['GET'])
def get_confessions():
    confessions = db.collection('confessions').stream()  # Fetch confessions from Firestore
    confessions_list = [conf.to_dict() for conf in confessions]
    return jsonify(confessions_list)

@app.route('/confess', methods=['POST'])
def confess():
    if 'google_token' in session:
        user_info = session.get('user_info')
        confession = request.json.get('confession')
        timestamp = datetime.utcnow().isoformat()  # Get current UTC time in ISO format
        db.collection('confessions').add({
            'text': confession, 
            'user': user_info['email'],
            'timestamp': timestamp
        })
        return jsonify({'status': 'success'}), 200
    return jsonify({'status': 'unauthorized'}), 401

@app.route('/user_posts', methods=['GET'])
def user_posts():
    if 'google_token' in session:
        user_info = session.get('user_info')
        user_email = user_info['email']
        user_posts = db.collection('confessions').where('user', '==', user_email).stream()
        user_posts_list = []
        for post in user_posts:
            post_data = post.to_dict()
            post_data['id'] = post.id
            # Format the timestamp if it exists
            if 'timestamp' in post_data:
                post_data['timestamp'] = post_data['timestamp']
            user_posts_list.append(post_data)
        return jsonify(user_posts_list)
    return jsonify({'status': 'unauthorized'}), 401

# Delete a specific post route
@app.route('/delete_post/<string:post_id>', methods=['DELETE'])
def delete_post(post_id):
    if 'google_token' in session:
        user_info = session.get('user_info')
        user_email = user_info['email']
        post_ref = db.collection('confessions').document(post_id)
        post = post_ref.get()
        if post.exists and post.to_dict().get('user') == user_email:
            post_ref.delete()  # Delete the post if the user owns it
            return jsonify({'status': 'success'}), 200
        return jsonify({'status': 'error', 'message': 'Post not found or not authorized'}), 404
    return jsonify({'status': 'unauthorized'}), 401

# Admin check function
def is_admin():
    # Check if the user is an admin
    if 'user_info' in session:
        user_info = session['user_info']
        return user_info['email'] == 'your_email@gmail.com'  # Replace with your admin email
    return False

# Get all users (admin only) route
@app.route('/admin/users', methods=['GET'])
def get_users():
    if not is_admin():  # Check if the user is an admin
        return jsonify({'status': 'unauthorized'}), 401
    users_file = 'users.json'
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            users = json.load(f)
    else:
        users = []
    return jsonify(users)

# Download page route
@app.route('/download')
def download_page():
    return render_template('download.html')

# Route for downloading APK
@app.route('/download_apk')
def download_apk():
    return send_from_directory(directory='static', filename='app.apk', as_attachment=True)

# Admin panel route
@app.route('/admin')
def admin_panel():
    if not is_admin():  # Check if the user is an admin
        return redirect(url_for('home'))
    return render_template('admin.html')

# Get all posts (admin only) route
@app.route('/admin/posts', methods=['GET'])
def get_posts():
    if not is_admin():  # Check if the user is an admin
        return jsonify({'status': 'unauthorized'}), 401
    posts = db.collection('confessions').stream()  # Get all posts from the database
    posts_list = [{'id': post.id, **post.to_dict()} for post in posts]
    return jsonify(posts_list)

users_file = 'users.json'
users_file_lock = Lock()

def load_users():
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            return json.load(f)
    return []

def save_users(users):
    with users_file_lock:
        with open(users_file, 'w') as f:
            json.dump(users, f, indent=4)

def is_valid_username(username):
    """Validate the username (3-20 characters, alphanumeric with underscores)."""
    return bool(re.match("^[a-zA-Z0-9_]{3,20}$", username))

@app.route('/set_username', methods=['GET', 'POST'])
def set_username():
    users = load_users()
    user_info = session.get('user_info')
    if not user_info:
        return redirect(url_for('login_page'))  # Ensure user is logged in

    user_email = user_info['email']
    user = next((u for u in users if u['email'] == user_email), None)

    # Redirect if username is already set
    if user and user.get('username_set', False):
        return redirect(url_for('home'))

    if request.method == 'POST':
        username = request.form['username'].strip()

        # Validate username
        if not is_valid_username(username):
            return render_template('set_username.html', error="Invalid username! Please use 3-20 alphanumeric characters and underscores only.")

        # Check for unique username
        if any(u.get('username') == username for u in users):
            return render_template('set_username.html', error="Username already taken!")

        # Set username
        if user:
            user['username'] = username
            user['username_set'] = True
        else:
            new_user = {
                'id': str(uuid.uuid4()),
                'email': user_email,
                'username': username,
                'username_set': True
            }
            users.append(new_user)

        # Save updated users list
        save_users(users)

        return redirect(url_for('home'))

    # Render username setup page
    return render_template('set_username.html')


# Main entry point
if __name__ == '__main__':
    app.run(debug=True)  # Run the app in debug mode
