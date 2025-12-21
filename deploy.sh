#!/bin/bash

# Word of the Day - Deployment Script
# Uploads built static site to S3 and invalidates CloudFront cache

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (set these after running terraform apply)
BUCKET="${BUCKET:-wordoftheday.bastionforge.com}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-EUMK92SHRVSDL}"
BUILD_DIR="out"

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory '$BUILD_DIR' not found!"
    print_info "Run 'npm run build' first to generate the static site."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed!"
    print_info "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured!"
    print_info "Run 'aws configure' to set up your credentials."
    exit 1
fi

print_info "Starting deployment to S3 bucket: $BUCKET"
echo ""

# Upload files to S3
print_info "Uploading files to S3..."

# Sync the entire build directory
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET/" \
    --delete \
    --exact-timestamps \
    --metadata-directive REPLACE \
    --exclude ".DS_Store" \
    --exclude "*.map"

if [ $? -eq 0 ]; then
    print_success "Files uploaded successfully"
else
    print_error "Failed to upload files to S3"
    exit 1
fi

echo ""

# Invalidate CloudFront cache
if [ -n "$DISTRIBUTION_ID" ]; then
    print_info "Invalidating CloudFront cache..."

    INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --output json)

    if [ $? -eq 0 ]; then
        INVALIDATION_ID=$(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*"' | cut -d'"' -f4)
        print_success "CloudFront invalidation created: $INVALIDATION_ID"
        print_info "Cache will be cleared within a few minutes"
    else
        print_warning "Failed to create CloudFront invalidation"
        print_info "You may need to manually invalidate the cache"
    fi
else
    print_warning "DISTRIBUTION_ID not set - skipping CloudFront invalidation"
    print_info "Set DISTRIBUTION_ID environment variable or update this script"
    print_info "Get it from: terraform output cloudfront_distribution_id"
fi

echo ""
print_success "Deployment complete!"
print_info "Website URL: https://$BUCKET"
