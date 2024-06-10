# TFLint config file to be used by all CI builds
# This file is maintained in the Qontigo/core-coding-standards repo and that copy will overwrite any changes made in any repo using the file

plugin "terraform" {
  enabled = true
  preset  = "all"
}

plugin "azurerm" {
  enabled = true
  version = "0.20.0"
  source  = "github.com/terraform-linters/tflint-ruleset-azurerm"
}

plugin "google" {
    enabled = true
    version = "0.22.2"
    source  = "github.com/terraform-linters/tflint-ruleset-google"
}
