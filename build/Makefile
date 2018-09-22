DEPLOYMENT=deployment/$(NAME)
GOCMD=go
GET_HASH=git rev-parse HEAD
HASH:=$(shell $(GET_HASH))
GCP_PROJECT=usermirror-staging
GCR_REPO=us.gcr.io/$(GCP_PROJECT)/$(NAME)
DOCKERHUB_ORG=helpusersvote
DOCKERHUB_IMAGE=$(DOCKERHUB_ORG)/$(NAME)

build:
	@make docker-build docker-push

release:
	@make docker-build
	@docker tag $(GCR_REPO):$(HASH) $(GCR_REPO):$(TAG)
	@docker push $(GCR_REPO):$(TAG)

docker-build:
	@echo "Building... ($(HASH))"
	@docker build -t $(DOCKERHUB_IMAGE):$(HASH) -t $(GCR_REPO):$(HASH) -t $(DOCKERHUB_IMAGE):latest  .
	@echo "Built complete ($(HASH))"

docker-push:
	@echo "🛫 Docker Hub · $(HASH)"
	@docker push $(DOCKERHUB_IMAGE):$(HASH)
	@docker push $(DOCKERHUB_IMAGE):latest
	@echo "🛬 Docker Hub · $(DOCKERHUB_IMAGE):$(HASH)"

gcr-push:
	@echo "🛫 GCR · $(HASH)"
	@gcloud docker -- push $(GCR_REPO) > /dev/null
	@echo "🛬 GCR · $(GCR_REPO):$(HASH)"
