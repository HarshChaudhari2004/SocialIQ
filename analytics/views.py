from django.shortcuts import render
from django.http import JsonResponse
import requests
import json

def landing_page(request):
    return render(request, 'analytics/landing_page.html')

def dashboard(request):
    return render(request, 'analytics/dashboard.html')

def chat_with_ai(request):
    if request.method == "POST":
        message = request.POST.get('message')
        if message:
            # Call the AI API
            response = run_flow(message, ENDPOINT)
            
            if "error" in response:
                return JsonResponse({'response_text': f"Error: {response['error']}"})
            else:
                # Extract the message from the response
                if "outputs" in response and isinstance(response["outputs"], list) and response["outputs"]:
                    response_text = response["outputs"][0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "No message returned.")
                    return JsonResponse({'response_text': response_text})
                else:
                    return JsonResponse({'response_text': "No valid outputs in the response."})
                    
    return render(request, 'analytics/chat_with_ai.html')

import requests
from django.shortcuts import render
from django.http import JsonResponse
import os

# Load environment variables
BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = "22d479dc-8114-4f1c-b0b3-4c87a6a166c9"
FLOW_ID = "83597930-bc5d-4fd7-a620-203916d153a6"  # Correct Flow ID
APPLICATION_TOKEN = "AstraCS:qgWLoZFnzFzejSjkNJGUPZDQ:9490852ec006ab5f12ea5f4b8b7c6f899fd0ba73f87dbedeecbe2c6c8853e1ea"
ENDPOINT = FLOW_ID

from django.shortcuts import render
from django.http import JsonResponse
import requests

def run_flow(message: str, endpoint: str) -> dict:
    api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{endpoint}"
    
    payload = {
        "input_value": message,
        "output_type": "chat",
        "input_type": "chat",
    }
    
    headers = {
        "Authorization": f"Bearer {APPLICATION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
