.PHONY: all quasar backend

all: backend quasar 


quasar:
	cd quasar-project && quasar dev

backend:
	cd backend/login-backend/ && ts-node userAuth.ts

