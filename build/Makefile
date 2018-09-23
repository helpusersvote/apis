GOCMD=go
GET_HASH=git rev-parse HEAD
HASH ?= $(GET_HASH)
REPO ?= helpusersvote
IMAGE ?= $(REPO)/$(NAME)

build:
	@make build-image push-image

release:
	@make build-image
	@docker tag $(IMAGE):$(HASH) $(IMAGE):$(TAG)
	@docker push $(IMAGE):$(TAG)

build-image:
	@echo "Building as $(IMAGE):$(HASH)"
	@docker build -t $(IMAGE):$(HASH) -t $(IMAGE):latest  .

push-image:
	@echo "Pushing as $(IMAGE):$(HASH)"
	@docker push $(IMAGE):$(HASH)
	@docker push $(IMAGE):latest

run-image: build-image
	@echo "Running... ($(HASH))"
	docker run -it -v `pwd`/tmp:/usr/src/tmp $(IMAGE):$(HASH)
