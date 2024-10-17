variable "aws_region" {
  description = "The AWS region for the custom image"
  type        = string
  default     = "us-east-1"
}

variable "source_ami" {
  description = "Ubuntu 24.04 LTS AMI ID"
  type        = string
  default     = "ami-0866a3c8686eaeeba"
}

variable "ami_name" {
  description = "Name of the custom image"
  type        = string
  default     = "csye6225-ami-{{timestamp}}"
}

variable "instance_type" {
  description = "Instance type for building the custom image"
  type        = string
  default     = "t2.small"
}


variable "app_path" {
  description = "Path where the application artifacts are stored"
  type        = string
  default     = "/home/csye6225/my_app"
}

variable "service_name" {
  description = "Name of the systemd service for the app"
  type        = string
  default     = "my_app_service"
}

variable "subnet_id" {
  description = "The subnet ID for the custom image"
  type        = string
  default     = "subnet-0d931cdafd933baac"
}

variable "ssh_username" {
  description = "The SSH username for the custom image"
  type        = string
  default     = "ubuntu"
}

variable "port" {
  description = "Port the application will run on"
  type        = string
  default     = "8080"
}

variable "db_host" {
  description = "Database host"
  type        = string
  default     = "localhost"
}

variable "db_port" {
  description = "Database port"
  type        = string
  default     = "5432"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "root@123"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "cloud"
}

packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  region                      = var.aws_region
  source_ami                  = var.source_ami
  instance_type               = var.instance_type
  ssh_username                = var.ssh_username
  ami_name                    = var.ami_name
  associate_public_ip_address = true

  launch_block_device_mappings {
    device_name = "/dev/sda1"
    volume_size = 8
    volume_type = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/tmp/my_app.zip"
  }

  provisioner "file" {
    source      = "./my_app_service.service"
    destination = "/tmp/my_app_service.service"
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]

    inline = [
      "echo 'debconf debconf/frontend select Noninteractive' | sudo debconf-set-selections",
      # Create the group and user
      "echo 'Creating group and user...'",
      "sudo groupadd csye6225",
      "sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225",

      # Ensure the application path exists
      "echo 'Ensuring application path exists...'",
      "sudo mkdir -p ${var.app_path}",
      "sudo chown -R csye6225:csye6225 ${var.app_path}",

      # Move the service file
      "echo 'Moving service file...'",
      "sudo mv /tmp/my_app_service.service /etc/systemd/system/${var.service_name}.service",
      "sudo chown root:root /etc/systemd/system/${var.service_name}.service",

      # Update and install PostgreSQL
      "echo 'Installing PostgreSQL...'",
      "sudo apt update",
      "sudo apt install -y postgresql postgresql-contrib",

      # Enable and start PostgreSQL
      "sudo systemctl enable postgresql",
      "sudo systemctl start postgresql",


      # Install unzip
      "echo 'Installing unzip...'",
      "sudo apt install -y unzip",
      # Unzip the application and move files to the application directory
      "sudo unzip /tmp/my_app.zip -d ${var.app_path}",
      "sudo chown -R csye6225:csye6225 ${var.app_path}",

      # Install Node.js
      "echo 'Installing Node.js...'",
      "curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
      "sudo apt install -y nodejs",
      "node -v", # Verify Node.js version
      "npm -v",  # Verify npm version,

      # Install the application dependencies
      "echo 'Current path: ' $(pwd)", # Echo the current working directory
      "echo 'Listing files in the application directory...'",
      "ls -al ${var.app_path}", # List all files in long format
      "echo 'Installing application dependencies...'",
      "cd ${var.app_path}/webapp",
      "sudo npm install",
      "sudo npm install -g ts-node",

      # Create the .env file and add environment variables
      "sudo touch ${var.app_path}/webapp/ .env",
      "echo 'ENV'",
      "ls -al ${var.app_path}", # List all files in long format
      "echo 'PORT=${var.port}' | sudo tee -a ${var.app_path}/webapp/.env",
      "echo 'DB_HOST=${var.db_host}' | sudo tee -a ${var.app_path}/webapp/.env",
      "echo 'DB_PORT=${var.db_port}' | sudo tee -a ${var.app_path}/webapp/.env",
      "echo 'DB_USERNAME=${var.db_username}' | sudo tee -a ${var.app_path}/webapp/.env",
      "echo 'DB_PASSWORD=${var.db_password}' | sudo tee -a ${var.app_path}/webapp/.env",
      "echo 'DB_NAME=${var.db_name}' | sudo tee -a ${var.app_path}/webapp/.env",
      #printing the .env file
      "cat ${var.app_path}/webapp/.env",



      # Create the PostgreSQL user and database
      "sudo -u postgres psql -c \"ALTER USER ${var.db_username} WITH PASSWORD '${var.db_password}';\"",
      "sudo -u postgres psql -c \"CREATE DATABASE ${var.db_name};\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${var.db_name} TO ${var.db_username};\"",

      # Reload and enable the systemd service
      "echo 'Enabling and starting the application service...'",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable ${var.service_name}.service"
    ]
  }
}

