#!/bin/bash

# Function to update an .env file
update_env_file() {
  local env_file=$1
  local key=$2
  local value=$3

  # Check if the file exists
  if [ ! -f "${env_file}" ]; then
    print_red "${env_file} not found. Exiting."
    exit 1
  fi

  # Escape special characters in value
  value=$(echo "$value" | sed -e 's/[\/&]/\\&/g')

  # Check if key exists in file
  if grep -q "^${key}=" "${env_file}"; then
    # Key found, update its value
    sed -i "s/^${key}=.*/${key}=${value}/" "${env_file}"
    if [ $? -ne 0 ]; then
      print_red "Failed to update ${key} in ${env_file}. Exiting."
      exit 1
    fi
  else
    # Key not found, do nothing (or you could choose to append it)
    print_yellow "Key ${key} not found in ${env_file}. Skipping."
  fi
}


prepare_env_file() {
  local example_file=$1
  local env_file=$2

  if [ ! -f "${env_file}" ]; then
    if [ -f "${example_file}" ]; then
      cp "${example_file}" "${env_file}"
    else
      print_red "${example_file} not found. Please make sure it exists."
      exit 1
    fi
  fi
}

# Function to update .env with new port
update_db_port_in_env() {
  local new_port=$1
  local database_url=$(grep "DATABASE_URL=" .env | cut -d '=' -f2-)
  local regex="mysql:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+)"
  if [[ $database_url =~ $regex ]]; then
    local new_database_url="mysql://${BASH_REMATCH[1]}:${BASH_REMATCH[2]}@${BASH_REMATCH[3]}:${new_port}/${BASH_REMATCH[5]}"
    update_env_file ".env" "DATABASE_URL" "${new_database_url}"
  else
    echo "Could not parse DATABASE_URL"
  fi
}

read_from_env() {
  local env_file=$1
  local key=$2
  grep "^${key}=" "${env_file}" | cut -d '=' -f2
}

# Function to parse DATABASE_URL from .env file
# Function to parse DATABASE_URL from .env file
parse_database_url() {
  local env_file=$1
  local url=$(grep "DATABASE_URL=" ${env_file} | cut -d '=' -f2-)

  # Extract username, password, host, port, and db name using regex
  local regex="mysql:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+)"
  if [[ $url =~ $regex ]]; then
    echo "${BASH_REMATCH[1]} ${BASH_REMATCH[2]} ${BASH_REMATCH[3]} ${BASH_REMATCH[4]} ${BASH_REMATCH[5]}"
  else
    echo "Could not parse DATABASE_URL"
  fi
}


# Function to print yellow text
print_yellow() {
  echo -e "\e[33m$1\e[0m"
}

# Function to print red text
print_red() {
  echo -e "\e[31m$1\e[0m"
}

# Function to print green text
print_green() {
  echo -e "\e[32m$1\e[0m"
}

# check for root user
if [ "$EUID" -ne 0 ]; then
  print_red "This script must be run as root. Exiting."
  exit 1
fi

# Check for RAM requirements
total_ram=$(free -m | awk '/^Mem:/{print $2}')
if [ "$total_ram" -lt 4096 ]; then
  print_red "Insufficient RAM. You need at least 4GB to proceed."
  exit 1
fi

# NodeJS Installation
if command -v apt > /dev/null 2>&1; then
  # Commands for distributions that use apt package manager (like Ubuntu, Debian)
  sudo apt-get update
  sudo apt-get upgrade -y
  sudo apt-get install -y ca-certificates curl gnupg
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
  sudo apt-get update
  sudo apt-get install nodejs -y

  # Redis Installation for apt
  sudo apt-get install -y redis-server
  sudo systemctl enable redis-server
  sudo systemctl start redis-server

elif command -v yum > /dev/null 2>&1; then
  # Commands for distributions that use yum package manager (like CentOS, RHEL, AlmaLinux)
  sudo yum install https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y
  sudo yum install nodejs -y --setopt=nodesource-nodejs.module_hotfixes=1

   # Check if Node.js installation failed
  if [ $? -ne 0 ]; then
    print_red "Node.js installation failed. Attempting to remove conflicting npm package..."
    sudo yum remove npm -y
    # Retry Node.js installation
    sudo yum install nodejs -y --setopt=nodesource-nodejs.module_hotfixes=1
    if [ $? -ne 0 ]; then
      print_red "Node.js installation failed again after removing npm. Exiting."
      exit 1
    fi
  fi

   # Redis Installation for yum
  sudo yum --enablerepo=epel install redis -y
  sudo systemctl enable redis
  sudo systemctl start redis
else
  print_red "Unsupported package manager. Exiting."
  exit 1
fi

# Global requirements
is_npm_package_installed() {
  npm list -g --depth=0 | grep -q "$1"
}

# Array of npm packages to check
npm_packages=("pnpm" "typescript" "ts-node" "pm2")

# Loop to check each package and install if necessary
for package in "${npm_packages[@]}"; do
  if is_npm_package_installed "$package"; then
    print_green "$package is already installed."
  else
    print_yellow "Installing $package..."
    npm install -g "$package"
  fi
done

# Ask for directory path where installer.zip is extracted
if [ -f "./platform.json" ]; then
  print_green "platform.json found in the current directory. Using this directory for installation."
  installer_path="./"
else
  # Ask for directory path where installer.zip is extracted
  while true; do
    read -p "Enter the path to the folder where you extracted installer.zip: " installer_path
    if [ -f "$installer_path/platform.json" ]; then
      cd "$installer_path"
      break
    else
      print_red "platform.json not found in the given directory. Please enter the correct path."
    fi
  done
fi

# Debug: Check if the .env file exists
if [ -f ".env" ]; then
  print_yellow "Debug: .env file found"
else
  print_yellow "Debug: .env file not found, generating .env file."
fi

# Get default MySQL values from .env file
if [ -f ".env" ]; then
  default_app_public_url=$(read_from_env ".env" "APP_PUBLIC_URL")
  default_app_public_site_name=$(read_from_env ".env" "APP_PUBLIC_SITE_NAME")

  # Debug: Check the output of parse_database_url function
  debug_output=$(parse_database_url '.env')
  echo "Debug: Output of parse_database_url function: $debug_output"

  IFS=' ' read -ra default_mysql <<< "$(parse_database_url '.env')"
  default_mysql_username=${default_mysql[0]}
  default_mysql_password=${default_mysql[1]}
  default_mysql_host=${default_mysql[2]}
  default_mysql_port=${default_mysql[3]}
  default_mysql_db_name=${default_mysql[4]}

  # Debug: Print the default MySQL variables
  echo "Debug: default_mysql_username = $default_mysql_username"
  echo "Debug: default_mysql_password = $default_mysql_password"
  echo "Debug: default_mysql_host = $default_mysql_host"
  echo "Debug: default_mysql_port = $default_mysql_port"
  echo "Debug: default_mysql_db_name = $default_mysql_db_name"
else
  default_app_public_url=""
  default_app_public_site_name=""
  default_mysql_username=""
  default_mysql_password=""
  default_mysql_host=""
  default_mysql_port=""
  default_mysql_db_name=""
fi

# Ask for user input with default value
read -p "Enter the APP_PUBLIC_URL (example: http://localhost) [$default_app_public_url]: " APP_PUBLIC_URL
APP_PUBLIC_URL=${APP_PUBLIC_URL:-$default_app_public_url}

read -p "Enter the APP_PUBLIC_SITE_NAME (example: Bicrypto) [$default_app_public_site_name]: " APP_PUBLIC_SITE_NAME
APP_PUBLIC_SITE_NAME=${APP_PUBLIC_SITE_NAME:-$default_app_public_site_name}

# Loop to get correct MySQL credentials and test the connection
while true; do
  read -p "Enter MySQL database name [$default_mysql_db_name]: " MYSQL_DB_NAME
  MYSQL_DB_NAME=${MYSQL_DB_NAME:-$default_mysql_db_name}

  read -p "Enter MySQL username [$default_mysql_username]: " MYSQL_USERNAME
  MYSQL_USERNAME=${MYSQL_USERNAME:-$default_mysql_username}

  read -p "Enter MySQL password [$default_mysql_password]: " MYSQL_PASSWORD
  MYSQL_PASSWORD=${MYSQL_PASSWORD:-$default_mysql_password}

  read -p "Enter MySQL host (default is localhost) [$default_mysql_host]: " MYSQL_HOST
  MYSQL_HOST=${MYSQL_HOST:-${default_mysql_host:-'localhost'}}

  read -p "Enter MySQL port (default is 3306) [$default_mysql_port]: " MYSQL_PORT
  MYSQL_PORT=${MYSQL_PORT:-${default_mysql_port:-'3306'}}

  # Construct DATABASE_URL
  DATABASE_URL="mysql://${MYSQL_USERNAME}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB_NAME}"

  # Test MySQL Connection
  mysql -u $MYSQL_USERNAME -p$MYSQL_PASSWORD -h $MYSQL_HOST -P $MYSQL_PORT -e 'exit'
  if [ $? -eq 0 ]; then
    print_green "Successfully connected to MySQL."
    break
  else
    print_red "Failed to connect to MySQL. Please check your database credentials."
  fi
done

# Generate token secrets
APP_ACCESS_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
APP_REFRESH_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
APP_RESET_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
APP_VERIFY_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Concatenate APP_PUBLIC_SITE_NAME with the description
APP_PUBLIC_SITE_DESCRIPTION="${APP_PUBLIC_SITE_NAME} is a cryptocurrency exchange platform, where you can trade Bitcoin, Ethereum, Litecoin, and other cryptocurrencies."

# Ask for additional variables for frontend .env
prepare_env_file ".env.example" ".env"
prepare_env_file ".app/.env.example" ".app/.env"

# Update .env file (backend)
update_env_file ".env" "APP_PUBLIC_URL" "${APP_PUBLIC_URL}"
update_env_file ".env" "APP_PUBLIC_SITE_NAME" "${APP_PUBLIC_SITE_NAME}"
update_env_file ".env" "DATABASE_URL" "${DATABASE_URL}"
update_env_file ".env" "APP_ACCESS_TOKEN_SECRET" "${APP_ACCESS_TOKEN_SECRET}"
update_env_file ".env" "APP_REFRESH_TOKEN_SECRET" "${APP_REFRESH_TOKEN_SECRET}"
update_env_file ".env" "APP_RESET_TOKEN_SECRET" "${APP_RESET_TOKEN_SECRET}"
update_env_file ".env" "APP_VERIFY_TOKEN_SECRET" "${APP_VERIFY_TOKEN_SECRET}"

# Update .env file (frontend)
update_env_file ".app/.env" "APP_PUBLIC_URL" "${APP_PUBLIC_URL}"
update_env_file ".app/.env" "APP_PUBLIC_SITE_NAME" "${APP_PUBLIC_SITE_NAME}"
update_env_file ".app/.env" "APP_PUBLIC_SITE_DESCRIPTION" "${APP_PUBLIC_SITE_DESCRIPTION}"

# Check if pnpm is installed
if command -v pnpm > /dev/null 2>&1; then
  print_green "pnpm is already installed."
else
  print_yellow "pnpm is not installed. Attempting to install..."
  npm install -g pnpm
  # Check if the installation was successful
  if [ $? -ne 0 ]; then
    print_red "Failed to install pnpm. Exiting."
    exit 1
  else
    print_green "pnpm successfully installed."
  fi
fi

# Assuming you're now in the directory where installer.zip is extracted
pnpm install
pnpm build
pnpm build:server

# Check for new Prisma versions
new_prisma_version=$(pnpm show prisma version)
current_prisma_version=$(grep '"prisma":' package.json | sed 's/.*: "\(.*\)",/\1/')

if [ "$new_prisma_version" != "$current_prisma_version" ]; then
  print_yellow "New version of Prisma available. Updating..."

  # Update Prisma and Prisma Client
  pnpm update prisma @prisma/client

  print_green "Prisma and Prisma Client have been updated to the latest version."
else
  print_red "Prisma is already up to date."
fi

# Loop to keep retrying the migration until successful
while true; do
  pnpm migrate:dev
  if [ $? -eq 0 ]; then
    print_green "Migration successful."
    break
  else
    print_red "Prisma migration failed. Please make sure the database user has permission to create databases."

    # Prompt the user for a new MySQL username and password
    read -p "Enter a MySQL username with sufficient permissions: " NEW_MYSQL_USERNAME
    read -p "Enter the password for the new MySQL username: " NEW_MYSQL_PASSWORD

    # Update DATABASE_URL in .env
    NEW_DATABASE_URL="mysql://${NEW_MYSQL_USERNAME}:${NEW_MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB_NAME}"
    update_env_file ".env" "DATABASE_URL" "${NEW_DATABASE_URL}"

    # Inform the user that the script will retry the migration
    print_yellow "Retrying migration with new credentials..."
  fi
done

pnpm generate

# Check for MySQL error
if [ "$?" -ne "0" ]; then
  sudo mysql_upgrade -u root -p
fi

# Attempt to seed the database
while true; do
  pnpm seed
  if [ $? -eq 0 ]; then
    print_green "Database seeding successful."
    break
  else
    print_red "Database seeding failed."
    print_red "The provided database string is invalid. Error parsing connection string: invalid port number in database URL."
    read -p "Enter the correct MySQL port: " new_mysql_port
    update_db_port_in_env "${new_mysql_port}"
  fi
done
pnpm seed



# Check if Apache is installed and running
apache_check=$(systemctl list-units --type=service | grep -E 'apache2.service|httpd.service')

# Check if Nginx is installed and running
nginx_check=$(systemctl list-units --type=service | grep nginx.service)

if [ -n "$apache_check" ]; then
  print_green "Apache is installed."
  if command -v apt > /dev/null 2>&1; then
    # Ubuntu/Debian
    sudo add-apt-repository ppa:ondrej/apache2
    sudo apt update
    sudo apt upgrade apache2
    sudo systemctl restart apache2

    # Enable Apache modules
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    sudo a2enmod proxy_http2
    sudo a2enmod proxy_wstunnel
    sudo a2enmod ssl
    sudo a2enmod rewrite
    sudo systemctl restart apache2

  elif command -v yum > /dev/null 2>&1; then
    # CentOS/RHEL/AlmaLinux/WHM
    print_yellow  "For Red Hat based systems, please enable the necessary Apache modules manually."
    print_yellow  "You'll need to enable the following Apache modules:"
    print_yellow  "- mod_proxy"
    print_yellow  "- mod_proxy_http"
    print_yellow  "- mod_proxy_wstunnel"
    print_yellow  "- mod_ssl"
    print_yellow  "- mod_rewrite"
    print_yellow  "Typically, you'll edit /etc/httpd/conf/httpd.conf or files under /etc/httpd/conf.d/ or in WHM Easyapache4 interface."
  fi

else
  print_red "Neither Apache nor Nginx is installed."
  exit 1
fi

print_green "Installation and setup complete."
print_yellow "##################################"
print_green "Now you have Super Admin with the following details:"
print_green "Email: superadmin@example.com"
print_green "Password: 12345678"
print_green "You can access the admin panel here: \e[4m${APP_PUBLIC_URL}\e[0m"
print_yellow "##################################"
print_green "Please change the password after logging in."
print_yellow "##################################"
print_green "To start the server, run the following command:"
print_green "pnpm start"
print_yellow "##################################"
print_green "To stop the server, run the following command:"
print_green "pnpm stop"
print_yellow "##################################"
