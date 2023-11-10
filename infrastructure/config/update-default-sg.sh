#!/usr/bin/env bash
# shellcheck disable=SC2086
networkConfigVpcId=$(aws ec2 describe-vpcs --query "Vpcs[*].[VpcId]" --output text --filters "Name=cidr,Values=10.0.0.0/16")
networkConfigSGId=$(aws ec2 describe-security-groups --query "SecurityGroups[*].[GroupId]" --output text --filters Name=group-name,Values=default Name=vpc-id,Values=$networkConfigVpcId Name=description,Values='default VPC security group')

# Removing inbound rules for default security group
aws ec2 revoke-security-group-ingress --group-id $networkConfigSGId --protocol -1 --source-group $networkConfigSGId --output text

# Removing outbound rules for default security group
SGRuleId=$(aws ec2 describe-security-group-rules --filters Name="group-id",Values=$networkConfigSGId --query "SecurityGroupRules[*].[SecurityGroupRuleId]" --output text)
aws ec2 revoke-security-group-egress --group-id $networkConfigSGId --security-group-rule-ids $SGRuleId --output text
