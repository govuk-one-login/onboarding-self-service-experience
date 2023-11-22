#!/usr/bin/env bash
aws logs put-subscription-filter \
  --log-group-name "aws-waf-logs-self-service-api-acl" \
  --filter-name "log_subscription" \
  --filter-pattern "" \
  --destination-arn "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython-2"
