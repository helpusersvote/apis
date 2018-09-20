DEPLOYMENTS = $(shell /bin/ls ./packages)

TERRAFORM_VERSION = 0.11.8
KUBECTL_VERSION = v1.11.2

# Default to downloaded dependencies (if available)
export PATH := $(dir $(realpath $(firstword $(MAKEFILE_LIST))))/bin:$(PATH)

build:
	@for i in $(DEPLOYMENTS); do \
		echo "Building $${i}..."; \
		( cd ./packages/$${i} && make docker-build ) \
	done

push:
	@for i in $(DEPLOYMENTS); do \
		echo "Pushing $${i}..."; \
		( cd ./packages/$${i} && make gcr-push ) \
	done

deploy:
	cd terraform && terraform apply -auto-approve

destroy:
	cd terraform && terraform destroy -auto-approve

check:
	cd terraform && terraform init
	cd terraform && terraform plan

setup-env: bin/kubectl bin/terraform

bin/kubectl: bin
	curl -L https://storage.googleapis.com/kubernetes-release/release/$(KUBECTL_VERSION)/bin/linux/amd64/kubectl >$@
	chmod +x $@

bin/terraform: bin
	curl -L https://releases.hashicorp.com/terraform/$(TERRAFORM_VERSION)/terraform_$(TERRAFORM_VERSION)_linux_amd64.zip | funzip >$@
	chmod +x $@

bin:
	mkdir -p $@

.PHONY: build push deploy destroy check setup-env
