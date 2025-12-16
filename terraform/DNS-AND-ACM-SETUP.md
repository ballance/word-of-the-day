# DNS and ACM Certificate Setup Guide

## Critical Steps for Subdomain Deployment

This document explains the complete DNS and ACM certificate setup required when deploying a subdomain to AWS using Terraform. These steps are **essential** and often overlooked.

---

## Overview

When deploying a subdomain like `wordoftheday.bastionforge.com`, you need:

1. **Route53 Hosted Zone** for the subdomain
2. **ACM SSL/TLS Certificate** for HTTPS
3. **DNS Validation Records** for ACM certificate
4. **NS Delegation Records** in parent domain

**Without these, your site will not be accessible!**

---

## The Two Critical DNS Configurations

### 1. ACM Certificate Validation (Automated in Terraform)

ACM requires DNS validation to prove you control the domain.

#### What Terraform Does Automatically

The Terraform configuration in `main.tf` includes:

```hcl
# Creates certificate validation DNS records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# Waits for validation to complete
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
```

#### What This Creates

For domain `wordoftheday.bastionforge.com`, ACM creates CNAME records like:

```
_abc123.wordoftheday.bastionforge.com CNAME _def456.acm-validations.aws.
```

These records are automatically added to the `wordoftheday.bastionforge.com` hosted zone.

#### Verification

Check certificate validation status:
```bash
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw acm_certificate_arn) \
  --region us-east-1 \
  --query 'Certificate.Status'
```

Should return: `"ISSUED"`

---

### 2. NS Delegation in Parent Domain (MANUAL STEP REQUIRED!)

This is the step that was **missing initially** and prevented the site from being accessible.

#### The Problem

When you create a subdomain hosted zone, Route53 assigns it nameservers:
```
ns-1032.awsdns-01.org
ns-1931.awsdns-49.co.uk
ns-377.awsdns-47.com
ns-567.awsdns-06.net
```

But the parent domain (`bastionforge.com`) doesn't know about this subdomain yet. You must **delegate** the subdomain to these nameservers.

#### The Solution

Add NS records in the **parent domain's hosted zone** pointing to the subdomain's nameservers.

#### How to Do This

**Step 1: Get the subdomain nameservers**
```bash
cd terraform
terraform output route53_name_servers
```

Output:
```
tolist([
  "ns-1032.awsdns-01.org",
  "ns-1931.awsdns-49.co.uk",
  "ns-377.awsdns-47.com",
  "ns-567.awsdns-06.net",
])
```

**Step 2: Get the parent zone ID**
```bash
aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='bastionforge.com.'].Id" \
  --output text
```

Output: `/hostedzone/Z05616888O7BYTCZT9PE`

**Step 3: Create the delegation records**

Create a file `ns-delegation.json`:
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "wordoftheday.bastionforge.com",
        "Type": "NS",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "ns-1032.awsdns-01.org"},
          {"Value": "ns-1931.awsdns-49.co.uk"},
          {"Value": "ns-377.awsdns-47.com"},
          {"Value": "ns-567.awsdns-06.net"}
        ]
      }
    }
  ]
}
```

**Step 4: Apply the delegation**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id /hostedzone/Z05616888O7BYTCZT9PE \
  --change-batch file://ns-delegation.json
```

#### Verification

Check that NS delegation is working:
```bash
# Should return the subdomain's nameservers
dig NS wordoftheday.bastionforge.com +short

# Should return CloudFront IPs
dig wordoftheday.bastionforge.com +short
```

---

## Complete Deployment Checklist

### Before Running Terraform

- [ ] Ensure parent domain (`bastionforge.com`) exists in Route53
- [ ] Have AWS credentials configured (`aws configure`)
- [ ] Have Terraform installed
- [ ] Have `terraform.tfvars` configured

### During Terraform Apply

- [ ] Run `terraform init`
- [ ] Run `terraform plan` (review changes)
- [ ] Run `terraform apply`
- [ ] Wait for completion (15-20 minutes)
- [ ] **Terraform automatically creates ACM validation records** ✅

### After Terraform Apply (MANUAL STEPS)

- [ ] Get subdomain nameservers: `terraform output route53_name_servers`
- [ ] Get parent zone ID: `aws route53 list-hosted-zones`
- [ ] Create NS delegation JSON file
- [ ] Apply NS delegation to parent zone
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Verify DNS resolution: `dig wordoftheday.bastionforge.com`
- [ ] Deploy site content: `./deploy.sh`
- [ ] Test site access: `https://wordoftheday.bastionforge.com`

---

## Common Issues and Solutions

### Issue 1: ACM Certificate Stuck in "Pending Validation"

**Symptoms:**
```bash
aws acm describe-certificate --certificate-arn [ARN] --region us-east-1
# Status: PENDING_VALIDATION
```

**Causes:**
1. Validation CNAME records not created in Route53
2. Wrong hosted zone for validation records
3. DNS propagation delay

**Solutions:**

Check validation records exist:
```bash
aws route53 list-resource-record-sets \
  --hosted-zone-id $(terraform output -raw route53_zone_id) \
  --query "ResourceRecordSets[?Type=='CNAME']"
```

Should show validation CNAMEs like `_abc123.wordoftheday.bastionforge.com`

If missing, Terraform may have failed. Re-run:
```bash
terraform apply -target=aws_route53_record.cert_validation
```

### Issue 2: Site Not Accessible After Deployment

**Symptoms:**
```bash
curl https://wordoftheday.bastionforge.com
# curl: (6) Could not resolve host
```

**Cause:**
NS delegation missing in parent domain.

**Solution:**
Follow "NS Delegation in Parent Domain" steps above.

**Verify:**
```bash
# Check if NS records exist in parent zone
aws route53 list-resource-record-sets \
  --hosted-zone-id /hostedzone/Z05616888O7BYTCZT9PE \
  --query "ResourceRecordSets[?Name=='wordoftheday.bastionforge.com.' && Type=='NS']"
```

### Issue 3: CloudFront Works but Domain Doesn't

**Symptoms:**
```bash
# This works
curl https://d1idge0jvkliml.cloudfront.net/

# This doesn't
curl https://wordoftheday.bastionforge.com/
```

**Cause:**
DNS not resolving - either NS delegation missing or DNS cache.

**Solutions:**

1. Check DNS resolution:
```bash
dig wordoftheday.bastionforge.com +short
# Should show IPs, not empty
```

2. If empty, NS delegation is missing (see Issue 2)

3. If IPs shown but site still unreachable, flush DNS cache:
```bash
# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

### Issue 4: Certificate Invalid or Untrusted

**Symptoms:**
Browser shows "Certificate Error" or "Not Secure"

**Causes:**
1. Certificate not yet issued (stuck in validation)
2. CloudFront not using correct certificate
3. Domain name mismatch

**Solutions:**

Check certificate status:
```bash
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw acm_certificate_arn) \
  --region us-east-1
```

Verify CloudFront is using the certificate:
```bash
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_distribution_id) \
  --query 'Distribution.DistributionConfig.ViewerCertificate'
```

### Issue 5: DNS Works Globally But Not Locally

**Symptoms:**
```bash
# Works on Google DNS
dig @8.8.8.8 wordoftheday.bastionforge.com +short
# Returns IPs

# Doesn't work locally
dig wordoftheday.bastionforge.com +short
# Empty or old IPs
```

**Cause:**
Local DNS cache or ISP DNS cache outdated.

**Solution:**
1. Flush local DNS cache (see commands above)
2. Change DNS server to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)
3. Wait 30-60 minutes for ISP cache to expire

---

## DNS Propagation Timeline

| Time | Expected Status |
|------|----------------|
| 0 min | Terraform apply completes |
| 1-5 min | ACM validation records active |
| 5-10 min | Certificate issued |
| 10-15 min | NS delegation propagates to major DNS servers |
| 15-30 min | Most DNS servers worldwide have records |
| 30-60 min | ISP DNS caches expire |
| 24-48 hrs | Complete global propagation (conservative) |

**Pro tip:** Use `dig @8.8.8.8 [domain]` to test against Google DNS, which updates fastest.

---

## Automated Solution (Future Enhancement)

To avoid manual NS delegation, you could:

### Option 1: Terraform Data Source

If parent zone is also managed by Terraform in the same account:

```hcl
# In main.tf
data "aws_route53_zone" "parent" {
  name = "bastionforge.com"
}

resource "aws_route53_record" "subdomain_ns" {
  zone_id = data.aws_route53_zone.parent.zone_id
  name    = var.domain_name
  type    = "NS"
  ttl     = 300
  records = aws_route53_zone.main.name_servers
}
```

### Option 2: Separate Terraform Module

Create a separate Terraform configuration for parent zone management:

```
parent-zone/
  main.tf          # Manages bastionforge.com zone
  subdomains.tf    # NS delegations for all subdomains
```

Then update `subdomains.tf` whenever adding a new subdomain.

### Option 3: Script Automation

Create a script `scripts/setup-dns-delegation.sh`:

```bash
#!/bin/bash
set -e

PARENT_ZONE_ID="Z05616888O7BYTCZT9PE"
SUBDOMAIN="wordoftheday.bastionforge.com"

# Get nameservers from Terraform output
NS_SERVERS=$(cd terraform && terraform output -json route53_name_servers | jq -r '.[]')

# Generate JSON
cat > /tmp/ns-delegation.json << EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$SUBDOMAIN",
      "Type": "NS",
      "TTL": 300,
      "ResourceRecords": [
        $(echo "$NS_SERVERS" | awk '{print "{\"Value\": \""$1"\"}"}' | paste -sd, -)
      ]
    }
  }]
}
EOF

# Apply
aws route53 change-resource-record-sets \
  --hosted-zone-id "$PARENT_ZONE_ID" \
  --change-batch file:///tmp/ns-delegation.json

echo "✅ NS delegation configured!"
```

---

## Security Considerations

### ACM Certificate

- ✅ Automatically renews before expiration
- ✅ Validation records remain in Route53
- ✅ Covers both root and www subdomain
- ✅ Uses modern TLS 1.2+

### DNS Security

- ✅ DNSSEC can be enabled on Route53 zones
- ✅ NS delegation uses multiple nameservers (redundancy)
- ✅ TTL of 300 seconds allows quick updates

### Best Practices

1. **Never delete validation records** - ACM needs them for auto-renewal
2. **Keep NS delegation records** - Required for subdomain to work
3. **Use low TTL initially** (300s) - Allows quick fixes if needed
4. **Increase TTL later** (3600s+) - Reduces DNS queries after stable
5. **Document your zones** - Keep a map of all hosted zones and delegations

---

## Monitoring and Maintenance

### Check ACM Certificate Status

```bash
# View certificate details
aws acm describe-certificate \
  --certificate-arn $(cd terraform && terraform output -raw acm_certificate_arn) \
  --region us-east-1

# Monitor expiration (should auto-renew)
aws acm describe-certificate \
  --certificate-arn $(cd terraform && terraform output -raw acm_certificate_arn) \
  --region us-east-1 \
  --query 'Certificate.NotAfter'
```

### Check DNS Health

```bash
# Verify nameservers
dig NS wordoftheday.bastionforge.com +short

# Verify A records
dig wordoftheday.bastionforge.com +short

# Check DNS from multiple locations
dig @8.8.8.8 wordoftheday.bastionforge.com +short  # Google
dig @1.1.1.1 wordoftheday.bastionforge.com +short  # Cloudflare
dig @208.67.222.222 wordoftheday.bastionforge.com +short  # OpenDNS
```

### Monitor CloudFront

```bash
# Check distribution status
aws cloudfront get-distribution \
  --id $(cd terraform && terraform output -raw cloudfront_distribution_id) \
  --query 'Distribution.Status'

# Should return "Deployed"
```

---

## Reference: What Terraform Creates

### In Subdomain Zone (wordoftheday.bastionforge.com)

```
# Automatically created by Terraform
_abc123.wordoftheday.bastionforge.com CNAME _def456.acm-validations.aws.
wordoftheday.bastionforge.com         A     ALIAS to CloudFront
wordoftheday.bastionforge.com         AAAA  ALIAS to CloudFront
www.wordoftheday.bastionforge.com     A     ALIAS to CloudFront
www.wordoftheday.bastionforge.com     AAAA  ALIAS to CloudFront
```

### In Parent Zone (bastionforge.com) - MANUAL

```
# Must be manually created
wordoftheday.bastionforge.com NS ns-1032.awsdns-01.org
wordoftheday.bastionforge.com NS ns-1931.awsdns-49.co.uk
wordoftheday.bastionforge.com NS ns-377.awsdns-47.com
wordoftheday.bastionforge.com NS ns-567.awsdns-06.net
```

---

## Summary: The Two Essential DNS Steps

### ✅ Step 1: ACM Validation (Automated)
- **What**: CNAME records for certificate validation
- **Where**: Subdomain hosted zone
- **Who**: Terraform (automatic)
- **When**: During `terraform apply`
- **Why**: Proves you own the domain

### ⚠️ Step 2: NS Delegation (Manual Required!)
- **What**: NS records pointing to subdomain nameservers
- **Where**: Parent domain hosted zone
- **Who**: You (manual step)
- **When**: After `terraform apply`
- **Why**: Tells DNS where to find your subdomain

**Both steps are required for the site to work!**

---

## Quick Reference Commands

```bash
# Get subdomain nameservers
terraform output route53_name_servers

# Get parent zone ID
aws route53 list-hosted-zones --query "HostedZones[?Name=='bastionforge.com.'].Id" --output text

# Create NS delegation
aws route53 change-resource-record-sets --hosted-zone-id /hostedzone/[PARENT_ID] --change-batch file://ns-delegation.json

# Verify DNS
dig NS wordoftheday.bastionforge.com +short
dig wordoftheday.bastionforge.com +short

# Check certificate
aws acm describe-certificate --certificate-arn [ARN] --region us-east-1 --query 'Certificate.Status'

# Test site
curl -I https://wordoftheday.bastionforge.com/
```

---

## Conclusion

The complete DNS and ACM setup requires:

1. ✅ **ACM validation records** - Automated by Terraform in `main.tf`
2. ⚠️ **NS delegation in parent zone** - Manual step required
3. ⏱️ **DNS propagation time** - 10-60 minutes
4. 🔍 **Verification** - Test DNS and certificate before declaring success

By following this guide, you'll avoid the common pitfalls and ensure your subdomain is properly configured and accessible from the start.
