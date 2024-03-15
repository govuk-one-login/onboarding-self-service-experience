#!/bin/bash

# Declarations
declare inside_aws_template=false
declare inside_data_protection_section=false
declare inside_sid_section=false
declare inside_data_identifier_section=false

declare start_data_protection_section
declare start_sid_section
declare start_data_identifier_section

declare has_errors=false
declare file_being_processed
declare identifier_array

declare files_to_scan
declare ignore_files_list
declare skip_parts_list

# Functions
function usage() {
  if [[ ! "$1" == "" ]]; then
    echo "$1"
    echo ""
  fi

  echo "Usage: pii_scan -p pathname to scan for [-i ignorefile] [-s skipfile]"
  echo ""
  echo -e "Where: \t-p = Pathname of Files to Scan"
  echo -e "\t-i ignorefile = Has optional file containing list of Files to Ignore (i.e. no scanning is performed on file)"
  echo -e "\t-s skipfile = Has optional file containing list of Files with lines to skip over (i.e. don't scan sections of file)"
  echo -e "\t-h = Show this Help Text"
  echo ""
  echo "e.g. pii-scan *template*.yml -i infrastructure/config/pii_scan_ignore.txt -s infrastructure/config/pii_scan_skip.txt"
  echo ""
  echo "Ignore File Format is 'Pathname to ignore'"
  echo "e.g. ./infrastructure/ci/development/deployment-config.template.yml would not perform any scanning in the specified file at all."
  echo ""
  echo ""
  echo "Skip File Format is 'File to Skip In:StartSkippingFrom-StopSkippingAt,...StartSkippingFrom-StopSkippingAt'"
  echo "e.g. ./backend/api/api.template.yml:113-127 will skip any checking on the lines 113-127 in the specified file."
  echo ""
  echo "This Script scans for inclusion of the follow Data Identifiers:"
  echo -e "\tEmailAddress"
  echo -e "\tIpAddress"
  echo -e "\tAddress"
  echo -e "\tAwsSecretKey"
  echo -e "\tOpenSshPrivateKey"
  echo -e "\tPgpPrivateKey"
  echo -e "\tPkcsPrivateKey"
  echo -e "\tPuttyPrivateKey"
  echo ""

  exit 1
}

function report() {
  has_errors=true

  if [[ ! "$1" == "" ]]; then
    echo "$1"
  fi
}

function process_results() {
  if [ "$inside_data_protection_section" == true ] && [ "$inside_sid_section" == true ] && [ "$inside_data_identifier_section" == false ]; then
    report "Missing Data Identifier Section at SID Line $start_sid_section"
  elif [ "$inside_data_protection_section" == true ] && [ "$inside_sid_section" == false ]; then
    report "Missing SID Policy at Data Protection Line $start_data_protection_section"
  elif [ "$inside_data_protection_section" == true ] && [ "$inside_sid_section" == true ] && [ "$inside_data_identifier_section" == false ]; then
    report "Missing Data Identifier Section at SID Policy Line $start_sid_section"
  elif [ $inside_data_protection_section == true ] && [ $inside_sid_section == true ] && [ $inside_data_identifier_section == true ]; then
    local counter=0

    for i in "${identifier_array[@]}"; do
      if [ "$i" == "0" ]; then
        case "$counter" in
          "0")
            report "Missing PII Identifier:EmailAddress after Line $start_data_identifier_section"
            ;;

          "1")
            report "Missing PII Identifier:IpAddress after Line $start_data_identifier_section"
            ;;

          "2")
            report "Missing PII Identifier:Address after Line: $start_data_identifier_section"
            ;;

          "3")
            report "Missing PII Identifier:AwsSecretKey after Line: $start_data_identifier_section"
            ;;

          "4")
            report "Missing PII Identifier:OpenSshPrivateKey after Line: $start_data_identifier_section"
            ;;

          "5")
            report "Missing PII Identifier:PgpPrivateKey after Line: $start_data_identifier_section"
            ;;

          "6")
            report "Missing PII Identifier:PkcsPrivateKey after Line: $start_data_identifier_section"
            ;;

          "7")
            report "Missing PII Identifier:PuttyPrivateKey after Line: $start_data_identifier_section"
            ;;
        esac
      fi

      counter=$((counter += 1))
    done
  fi
}

function process_file() {
  local line_counter=0
  local line
  local skip_file_list
  local is_skipping

  inside_aws_template=false

  while IFS= read -r line; do
    line_counter=$((line_counter += 1))

    if [[ "$line" =~ AWSTemplateFormatVersion ]]; then
      inside_aws_template=true

      for i in "${skip_parts_list[@]}"; do
        if [[ "$i" =~ $file_being_processed ]]; then
          skip_file_list="$i"
        fi
      done
    fi

    if [[ $inside_aws_template == true ]]; then
      # shellcheck disable=SC2076
      if [[ "$skip_file_list" =~ ":$line_counter-" ]]; then
        is_skipping=true
      fi

      # shellcheck disable=SC2076
      if [[ "$skip_file_list" =~ "-$line_counter" ]]; then
        is_skipping=false
      fi

      if [[ $is_skipping == true ]]; then
        echo "Skipping Line:$line_counter => $line"
      else
        if [[ -z "$line" ]]; then
          process_results

          inside_data_protection_section=false
          inside_sid_section=false
          inside_data_identifier_section=false
        elif [[ "$line" =~ DataProtectionPolicy ]]; then
          inside_data_protection_section=true
          start_data_protection_section="$line_counter"
        elif [[ $inside_data_protection_section == true && "$line" =~ Sid ]]; then
          inside_sid_section=true
          start_sid_section="$line_counter"
        elif [[ $inside_sid_section == true && "$line" =~ "DataIdentifier:" ]]; then
          inside_data_identifier_section=true
          start_data_identifier_section="$line_counter"
          identifier_array=("0" "0" "0" "0" "0" "0" "0" "0")
        elif [[ $inside_data_identifier_section == true ]]; then
          if [[ "$line" =~ EmailAddress ]]; then
            identifier_array[0]="1"
          elif [[ "$line" =~ IpAddress ]]; then
            identifier_array[1]="1"
          elif [[ "$line" =~ Address ]]; then
            identifier_array[2]="1"
          elif [[ "$line" =~ AwsSecretKey ]]; then
            identifier_array[3]="1"
          elif [[ "$line" =~ OpenSshPrivateKey ]]; then
            identifier_array[4]="1"
          elif [[ "$line" =~ PgpPrivateKey ]]; then
            identifier_array[5]="1"
          elif [[ "$line" =~ PkcsPrivateKey ]]; then
            identifier_array[6]="1"
          elif [[ "$line" =~ PuttyPrivateKey ]]; then
            identifier_array[7]="1"
          elif [[ "$line_counter" == "$((start_data_identifier_section + 9))" ]]; then
            # Reached end of Data Identifier Section so check what PII Filters have been set and report errors
            process_results
          fi
        fi
      fi
    fi
  done < "$file_being_processed"

  # Reached end of File so check results
  process_results
}

# Initialise
if [ $# == 0 ]; then
  usage "No Arguments supplied"
else
  while getopts ':p:i:s:h' opt; do
    case "$opt" in
      h)
        usage
        ;;

      p)
        files_to_scan=${OPTARG}
        ;;

      i)
        while IFS= read -r line; do
          ignore_files_list+="$line;"
        done < "${OPTARG}"
        ;;

      s)
        while IFS= read -r line; do
          skip_parts_list+="$line;"
        done < "${OPTARG}"
        ;;

      :)
        usage "Option requires an argument."
        ;;

      ?)
        usage "Invalid command option."
        ;;
    esac
  done

  if [ "$files_to_scan" == "" ]; then
    usage File Path to be scanned has not been specified
  fi
fi

# Main
echo "*** Scan for Missing PII Identifiers in AWS Template Config Files ***"
files=$(find . -type f -name "$files_to_scan")

for file in $files; do
  file_being_processed="$file"
  echo ""

  # shellcheck disable=SC2199
  if [[ ! ${ignore_files_list[@]} =~ $file_being_processed ]]; then
    echo "Processing File => $file_being_processed"
    process_file
  else
    echo "Ignoring File => $file_being_processed"
  fi
done

echo ""

if [ "$has_errors" == true ]; then
  exit 1
else
  exit 0
fi
