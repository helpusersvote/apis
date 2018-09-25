variable "render_dir" {
  description = "Path to directory where templated manifests can be outputted (defaults to path within module)"
  type        = "string"
  default     = ""
}

variable "config_path" {
  description = "Path to ConfigMap describing configuration for config-api (defaults to path within module)"
  type        = "string"
  default     = ""
}

variable "manifests_dir" {
  description = "Directory containing manifests used for deployment (defaults to path within module)"
  type        = "string"
  default     = ""
}

variable "kubeconfig" {
  description = "Path to kubeconfig used to authenticate with Kubernetes API server"
  type        = "string"
}

variable "domain" {
  description = "Domain which is used in configuring ingresses"
  type        = "string"
  default     = "staging.helpusersvote.com"
}

variable "google_api_key" {
  description = "Google API Key to use the Civic Information API"
  type        = "string"
  default     = ""
}

variable "events_api_read_key" {
  description = "Events API read key for the Dashboard"
  type        = "string"
  default     = ""
}

variable "last_resource" {
  description = "Allows dependency to be expressed to module"
  type        = "string"
  default     = ""
}
