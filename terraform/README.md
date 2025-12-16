# Word of the Day - Terraform Infrastructure

This directory contains Terraform configuration for deploying the Word of the Day static website to AWS with CloudFront CDN, S3 hosting, and Route53 DNS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Route53 DNS                   │
        │  wordoftheday.bastionforge.com │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │   CloudFront CDN               │
        │  - Global edge locations       │
        │  - HTTPS only (TLS 1.2+)       │
        │  - Gzip compression            │
        │  - Security headers            │
        │  - Optimized caching           │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ S3 Static Website Bucket       │
        │                                │
        │ - index.html                   │
        │ - Next.js static export        │
        │ - All word pages (200 routes)  │
        └────────────────────────────────┘
```

## AWS Resources Created

1. **S3 Bucket** - Static website hosting
2. **CloudFront Distribution** - Global CDN with HTTPS
3. **Route53 Hosted Zone** - DNS management
4. **Route53 Records** - A and AAAA records for domain and www subdomain
5. **ACM Certificate** - SSL/TLS certificate (auto-validated via DNS)
6. **CloudFront Response Headers Policy** - Security headers

## Prerequisites

### 1. Install Required Tools

- **Terraform** >= 1.0
  ```bash
  brew install terraform  # macOS
  # OR download from: https://www.terraform.io/downloads
  ```

- **AWS CLI** >= 2.0
  ```bash
  brew install awscli  # macOS
  # OR download from: https://aws.amazon.com/cli/
  ```

### 2. Configure AWS Credentials

```bash
aws configure
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Output format: `json`

### 3. Domain Setup

The domain `wordoftheday.bastionforge.com` should be:
- Either already registered in Route53, OR
- Ready to have its nameservers updated to point to Route53

## Setup Instructions

### Step 1: Configure Variables

1. Copy the example variables file:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your values:
   ```hcl
   aws_region  = "us-east-1"
   domain_name = "wordoftheday.bastionforge.com"
   environment = "production"
   ```

### Step 2: Initialize Terraform

```bash
cd terraform
terraform init
```

This will:
- Download the AWS provider
- Set up the Terraform backend
- Initialize the working directory

### Step 3: Review the Plan

```bash
terraform plan
```

Review the resources that will be created:
- 1 S3 bucket
- 1 S3 bucket policy
- 1 S3 public access block configuration
- 1 ACM certificate
- 3 Route53 validation records
- 1 CloudFront distribution
- 1 CloudFront response headers policy
- 1 Route53 hosted zone
- 4 Route53 DNS records (A and AAAA for root and www)

**Total: ~15 resources**

### Step 4: Apply the Configuration

```bash
terraform apply
```

Type `yes` when prompted.

**This will take 15-20 minutes** due to:
- ACM certificate validation (~5 min)
- CloudFront distribution creation (~10-15 min)

### Step 5: Update Domain Nameservers

After `terraform apply` completes, get the Route53 nameservers:

```bash
terraform output route53_name_servers
```

Update your domain registrar (where bastionforge.com is registered) to use these nameservers for the subdomain.

**For subdomain delegation**, add NS records in the parent zone (`bastionforge.com`):
```
wordoftheday.bastionforge.com NS ns-xxx.awsdns-xx.com
wordoftheday.bastionforge.com NS ns-xxx.awsdns-xx.co.uk
wordoftheday.bastionforge.com NS ns-xxx.awsdns-xx.org
wordoftheday.bastionforge.com NS ns-xxx.awsdns-xx.net
```

### Step 6: Get Deployment Information

```bash
terraform output
```

You'll see:
- `website_url` - Your live website URL
- `cloudfront_distribution_id` - For cache invalidation
- `s3_bucket_name` - Where to upload files
- `deployment_command` - AWS CLI command to upload files
- `invalidation_command` - AWS CLI command to clear cache

### Step 7: Deploy Your Website

1. Build the static site:
   ```bash
   cd ..  # Back to project root
   npm run build
   ```

2. Deploy using the deployment script:
   ```bash
   export DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
   ./deploy.sh
   ```

   Or manually:
   ```bash
   BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)
   DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)

   # Upload files
   aws s3 sync out/ s3://$BUCKET/ --delete

   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
   ```

## Deployment Workflow

### Initial Deployment
```bash
npm run build
export DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
./deploy.sh
```

### Updating Content
After making changes to words or code:
```bash
npm run build
./deploy.sh
```

The deployment script:
1. Syncs files to S3 (only uploads changed files)
2. Deletes files that no longer exist locally
3. Invalidates CloudFront cache so changes appear immediately

## Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| S3 Storage (1 GB) | ~$0.02 |
| S3 Requests (10K) | ~$0.01 |
| CloudFront (1 GB transfer) | ~$0.09 |
| Route53 Hosted Zone | $0.50 |
| ACM Certificate | **FREE** |
| **TOTAL** | **~$0.62/month** |

**Note**: Costs may vary based on traffic. The above assumes minimal traffic (< 1GB/month).

## Security Features

### HTTPS Enforcement
- All HTTP traffic redirects to HTTPS
- TLS 1.2+ only
- SNI-only certificate (no extra cost)

### Security Headers
The CloudFront distribution automatically adds:
- `Content-Security-Policy` - Prevents XSS attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Strict-Transport-Security` - Forces HTTPS (HSTS)
- `X-XSS-Protection` - Legacy XSS protection
- `Permissions-Policy` - Restricts browser features

### CloudFront Caching
- Cached at 150+ edge locations worldwide
- Reduces origin requests
- Improves performance globally
- Compression enabled (Gzip)

## Useful Commands

### View all outputs
```bash
terraform output
```

### Get specific output
```bash
terraform output website_url
terraform output cloudfront_distribution_id
```

### Check current state
```bash
terraform show
```

### Refresh state from AWS
```bash
terraform refresh
```

### Format Terraform files
```bash
terraform fmt
```

### Validate configuration
```bash
terraform validate
```

### Destroy infrastructure (CAREFUL!)
```bash
terraform destroy
```

## Troubleshooting

### Certificate Validation Stuck

If the ACM certificate validation is stuck:

1. Check Route53 records were created:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id $(terraform output -raw route53_zone_id)
   ```

2. Check certificate status:
   ```bash
   aws acm describe-certificate --certificate-arn $(terraform output -raw acm_certificate_arn) --region us-east-1
   ```

3. If needed, manually add CNAME records from certificate validation

### CloudFront Not Updating

If changes aren't appearing:

1. Invalidate the CloudFront cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_distribution_id) \
     --paths "/*"
   ```

2. Wait 3-5 minutes for invalidation to complete

3. Clear your browser cache or use incognito mode

### DNS Not Resolving

1. Verify nameservers are updated:
   ```bash
   dig NS wordoftheday.bastionforge.com
   ```

2. Check if Route53 records exist:
   ```bash
   terraform output route53_name_servers
   ```

3. DNS propagation can take 24-48 hours

### S3 Upload Failing

1. Check AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Verify bucket exists:
   ```bash
   aws s3 ls s3://$(terraform output -raw s3_bucket_name)
   ```

3. Check bucket policy allows uploads

## Maintenance

### Updating Infrastructure

1. Make changes to `main.tf`, `variables.tf`, or other `.tf` files

2. Review changes:
   ```bash
   terraform plan
   ```

3. Apply changes:
   ```bash
   terraform apply
   ```

### Backing Up State

Terraform state is stored locally in `terraform.tfstate`. **Back this up!**

```bash
cp terraform.tfstate terraform.tfstate.backup
```

For production, consider using remote state:
- S3 backend with DynamoDB locking
- Terraform Cloud
- GitLab/GitHub with state management

### Updating Terraform Providers

```bash
terraform init -upgrade
```

## File Structure

```
terraform/
├── main.tf                    # Main infrastructure configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example variables file
├── terraform.tfvars           # Your actual variables (gitignored)
├── .terraform/                # Terraform working directory (gitignored)
├── terraform.tfstate          # Current state (gitignored)
├── terraform.tfstate.backup   # Previous state (gitignored)
└── README.md                  # This file
```

## Next Steps

After infrastructure is deployed:

1. ✅ Verify website is accessible: `https://wordoftheday.bastionforge.com`
2. ✅ Test www subdomain: `https://www.wordoftheday.bastionforge.com`
3. ✅ Verify HTTP redirects to HTTPS
4. ✅ Check security headers with: https://securityheaders.com
5. ✅ Test performance with: https://pagespeed.web.dev
6. ✅ Set up monitoring in CloudWatch (optional)
7. ✅ Configure budget alerts in AWS (optional)

## Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route53 Documentation](https://docs.aws.amazon.com/route53/)
- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)

## Support

For issues with:
- **Terraform**: Check the [Terraform documentation](https://www.terraform.io/docs)
- **AWS**: Check the [AWS documentation](https://docs.aws.amazon.com/)
- **This project**: Open an issue in the repository
