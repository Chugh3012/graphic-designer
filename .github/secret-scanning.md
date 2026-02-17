# Secret scanning custom patterns for this repository
# GitHub secret scanning is enabled by default for public repos
# This file configures additional custom patterns specific to this project

# Note: Secret scanning is automatically enabled for:
# - GitHub tokens
# - AWS credentials
# - Azure credentials
# - Many other service credentials
# See: https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns

# Custom patterns can be added in repository Settings > Security > Code security and analysis > Secret scanning
# Common patterns for this project:

# PayloadCMS Secret (32-char hex)
# Pattern: PAYLOAD_SECRET=[a-f0-9]{32,}

# Azure Connection Strings
# Pattern: DefaultEndpointsProtocol=https;AccountName=

# Resend API Keys
# Pattern: re_[a-zA-Z0-9]{40,}

# Database URIs with embedded credentials
# Pattern: postgresql://[^:]+:[^@]+@
