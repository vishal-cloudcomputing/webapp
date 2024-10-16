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
  default     = "csye6225-ami"
}

variable "instance_type" {
  description = "Instance type for building the custom image"
  type        = string
  default     = "t2.small"
}

variable "app_path" {
  description = "Path where the application artifacts are stored"
  type        = string
  default     = "/home/ubuntu/my_app"
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
  ami_name                    = var.ami_name + "-{{timestamp}}"
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

      # Move the service file to the appropriate location
      "echo 'Moving service file...'",
      "sudo mv /tmp/my_app_service.service /etc/systemd/system/${var.service_name}.service",
      "sudo chown root:root /etc/systemd/system/${var.service_name}.service", # Correct ownership for service file

      # Update and install PostgreSQL
      "echo 'Installing PostgreSQL...'",
      "sudo apt update",
      "sudo apt install -y postgresql postgresql-contrib",

      # Enable and start PostgreSQL
      "sudo systemctl enable postgresql",
      "sudo systemctl start postgresql",

      # Reload and enable the systemd service
      "echo 'Enabling and starting the application service...'",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable ${var.service_name}.service"
    ]
  }
}
