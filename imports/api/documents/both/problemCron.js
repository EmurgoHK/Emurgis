import { checkForStaleProblems } from './problemMethods'

SyncedCron.add({
	name: 'Check for stale problems',
  	schedule: parser => parser.text('every 1 days'),
  	job: () => checkForStaleProblems.call({})
})