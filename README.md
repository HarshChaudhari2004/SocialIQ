# SocialIQ

## What is this project about?
SocialIQ is a Django-based application for analyzing social media engagement data and interacting with an AI chatbot. It provides data visualizations, summaries, and insights for social media posts, all in a user-friendly interface.

## How to set up and run
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/HarshChaudhari2004/SocialIQ.git
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   pip install --no-cache-dir -r requirements.txt
   ```
3. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

## Features
- **Landing Page**: A welcoming landing page with options to visit the dashboard or chat with the AI.
- **Dashboard**: A comprehensive dashboard that provides insights and visualizations of social media engagement data.
- **Chat with AI**: An interactive chat interface to communicate with an AI chatbot for various queries and assistance.
