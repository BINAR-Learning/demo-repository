#!/bin/bash

# FCM Push Notification Deployment Script for Google Cloud Platform

set -e

echo "🚀 Starting FCM Push Notification deployment to Google Cloud..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with Google Cloud. Please run 'gcloud auth login'"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    print_error "No project set. Please run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

print_status "Using project: $PROJECT_ID"

# Check if billing is enabled
print_status "Checking billing account..."
if ! gcloud beta billing projects describe $PROJECT_ID &>/dev/null; then
    print_error "No billing account linked to project $PROJECT_ID"
    print_warning "Please enable billing at: https://console.cloud.google.com/billing/linkedaccount"
    print_warning "Note: Google provides $300 free credit for new accounts"
    exit 1
fi

# Check if billing is enabled
print_status "Checking billing account..."
if ! gcloud beta billing projects describe $PROJECT_ID &>/dev/null; then
    print_error "❌ No billing account linked to project $PROJECT_ID"
    echo ""
    print_warning "📋 To fix this:"
    print_warning "1. Go to: https://console.cloud.google.com/billing/linkedaccount"
    print_warning "2. Select your project and link a billing account"
    print_warning "3. Wait 1-2 minutes for activation"
    print_warning "4. Run this script again"
    echo ""
    print_warning "💡 New Google Cloud users get $300 free credit!"
    exit 1
fi

print_status "✅ Billing account confirmed"

# Enable required APIs (only after billing is confirmed)
print_status "Enabling required Google Cloud APIs..."
if ! gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com run.googleapis.com storage-api.googleapis.com; then
    print_error "Failed to enable APIs. Please check billing and permissions."
    exit 1
fi

# Deploy server to App Engine
print_status "Deploying server to App Engine..."
cd server

# Check if App Engine app exists, create if not
if ! gcloud app describe &>/dev/null; then
    print_status "Creating App Engine application..."
    gcloud app create --region=us-central
fi

# Deploy the server
gcloud app deploy --quiet --stop-previous-version

# Get the server URL
SERVER_URL="https://${PROJECT_ID}.appspot.com"
print_status "Server deployed to: $SERVER_URL"

# Go back to root directory
cd ..

# Update client configuration with server URL
print_status "Updating client configuration..."
sed -i.bak "s|http://localhost:3000|$SERVER_URL|g" client/firebase-config.js
sed -i.bak "s|YOUR_PROJECT_ID|$PROJECT_ID|g" client/firebase.json
sed -i.bak "s|YOUR_PROJECT_ID|$PROJECT_ID|g" client/.firebaserc

# Deploy client to Firebase Hosting
print_status "Deploying client to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Deploy to Firebase Hosting
cd client
firebase deploy --only hosting --project $PROJECT_ID

# Get the client URL
CLIENT_URL="https://${PROJECT_ID}.web.app"
print_status "Client deployed to: $CLIENT_URL"

# Go back to root directory
cd ..

# Test deployment
print_status "Testing deployment..."
print_status "Testing server health endpoint..."
if curl -s "$SERVER_URL/health" | grep -q "healthy"; then
    print_status "✅ Server is healthy"
else
    print_warning "⚠️  Server health check failed"
fi

# Display deployment summary
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your deployed URLs:"
echo "   🖥️  Server:  $SERVER_URL"
echo "   🌐 Client:  $CLIENT_URL"
echo ""
echo "🧪 Testing URLs:"
echo "   🔍 Health:  $SERVER_URL/health"
echo "   📱 Send:    $SERVER_URL/send-notification"
echo ""
echo "📋 Next steps:"
echo "   1. Open $CLIENT_URL in your browser"
echo "   2. Allow notifications when prompted"
echo "   3. Copy the FCM token"
echo "   4. Test sending notifications"
echo ""
echo "📚 View logs:"
echo "   gcloud app logs tail -s default"
echo ""
echo "🔧 Update deployment:"
echo "   ./deploy.sh"
echo ""

print_status "Deployment complete! 🚀"
