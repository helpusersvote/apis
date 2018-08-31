DEPLOYMENT=deployment/$(NAME)
GOCMD=go
GET_HASH=$(GOCMD) run $(GOPATH)/src/github.com/segmentio/ksuid/cmd/ksuid/main.go
HASH:=$(shell $(GET_HASH))
DOCKERHUB_ORG=helpusersvote
DOCKERHUB_IMAGE=$(DOCKERHUB_ORG)/$(NAME)

build:
	@make docker-build docker-push

docker-build:
	@echo "Building... ($(HASH))"
	@docker build -t $(DOCKERHUB_IMAGE):$(HASH) -t $(DOCKERHUB_IMAGE):latest  .
	@echo "Built complete ($(HASH))"

docker-push:
	@echo "🛫 Docker Hub · $(HASH)"
	@docker push $(DOCKERHUB_IMAGE):$(HASH)
	@docker push $(DOCKERHUB_IMAGE):latest
	@echo "🛬 Docker Hub · $(DOCKERHUB_IMAGE):$(HASH)"