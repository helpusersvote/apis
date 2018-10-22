// defaults requiring interpolation
locals {
  render_dir    = "${var.render_dir=="" ? local.default_render_dir : var.render_dir}"
  config_path   = "${var.config_path=="" ? local.default_config_path : var.config_path}"
  manifests_dir = "${var.manifests_dir=="" ? local.default_manifests_dir : var.manifests_dir}"

  default_render_dir    = "${dirname(path.module)}/dist/manifests"
  default_config_path   = "${dirname(path.module)}/manifests/config.yaml"
  default_manifests_dir = "${dirname(path.module)}/manifests"
}

module "config" {
  source = "git::https://github.com/helpusersvote/terraform-kubernetes-helpusersvote.git//modules/config?ref=339ee572b13d7dca0f136d694fb94da288f9196b"

  components   = ["election-api", "go-helpusersvote", "events-api"]
  render_dir   = "${local.render_dir}"
  config       = "${local.config_path}"
  manifest_dir = "${local.manifests_dir}"

  git_dir = "${path.module}"

  vars = {
    domain     = "${var.domain}"
    tls_secret = "${var.tls_secret}"

    api_read_key   = "${var.events_api_read_key}"
    google_api_key = "${var.google_api_key}"
    environment    = "${var.environment}"
  }
}

module "kubernetes" {
  source = "git::https://github.com/helpusersvote/terraform-kubernetes-helpusersvote.git//modules/kubernetes?ref=339ee572b13d7dca0f136d694fb94da288f9196b"

  manifest_dirs = "${module.config.dirs}"
  kubeconfig    = "${var.kubeconfig}"
  last_resource = "${join(",", module.config.manifest_state)}"
}
