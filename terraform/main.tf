terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Main provider (for S3, Route53, CloudFront)
provider "aws" {
  region = var.aws_region
}

# US East 1 provider (required for ACM certificates used with CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ============================================================================
# S3 BUCKET FOR STATIC WEBSITE HOSTING
# ============================================================================

resource "aws_s3_bucket" "website" {
  bucket = var.domain_name

  tags = {
    Name        = "Word of the Day Website"
    Environment = var.environment
    Project     = "word-of-the-day"
  }
}

# Configure public access settings for the website bucket
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy to allow public read access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# ============================================================================
# ACM CERTIFICATE (SSL/TLS)
# ============================================================================

resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1 # Certificate must be in us-east-1 for CloudFront

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "Word of the Day Certificate"
    Environment = var.environment
    Project     = "word-of-the-day"
  }
}

# DNS validation records for ACM certificate
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

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ============================================================================
# CLOUDFRONT DISTRIBUTION (CDN)
# ============================================================================

# CloudFront Function to rewrite directory URLs to index.html
resource "aws_cloudfront_function" "url_rewrite" {
  name    = "wordoftheday-url-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrites directory URLs to append index.html"
  publish = true
  code    = file("${path.module}/cloudfront-function.js")
}

# Response headers policy for security
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "wordoftheday-security-headers-policy"
  comment = "Security headers for Word of the Day website"

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }

  custom_headers_config {
    items {
      header   = "permissions-policy"
      value    = "geolocation=(), microphone=(), camera=()"
      override = true
    }
  }
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations (cost-effective)
  comment             = "Word of the Day - Static Website CDN"

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.website.id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  # Default cache behavior for all content
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.website.id

    # Use managed cache policy for optimized caching
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Attach CloudFront Function for URL rewriting
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.url_rewrite.arn
    }
  }

  # Custom error responses for SPA-like behavior
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404/index.html"
  }

  # Handle 403 errors (AccessDenied from S3) as 404
  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.website.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "Word of the Day CDN"
    Environment = var.environment
    Project     = "word-of-the-day"
  }

  depends_on = [aws_acm_certificate_validation.website]
}

# ============================================================================
# ROUTE53 DNS
# ============================================================================

# Hosted zone for the domain
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name        = "Word of the Day Domain"
    Environment = var.environment
    Project     = "word-of-the-day"
  }
}

# A record pointing to CloudFront (root domain)
resource "aws_route53_record" "website" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# AAAA record for IPv6 support (root domain)
resource "aws_route53_record" "website_ipv6" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# A record pointing to CloudFront (www subdomain)
resource "aws_route53_record" "website_www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# AAAA record for IPv6 support (www subdomain)
resource "aws_route53_record" "website_www_ipv6" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
