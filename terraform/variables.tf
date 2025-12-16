variable "aws_region" {
  description = "AWS region for resources (S3, Route53, etc.)"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the website (e.g., wordoftheday.bastionforge.com)"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}
