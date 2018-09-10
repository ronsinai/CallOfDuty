PROJECT = Call Of Duty

.PHONY: clean install test run

clean:
	@echo Cleaning $(PROJECT)
	@rm -rf node_modules/

install:
	@echo Installing $(PROJECT)
	@npm i

test:
	@echo Testing $(PROJECT)
	@./node_modules/.bin/mocha --recursive

run:
	@echo Starting $(PROJECT)
	@node ./start.js