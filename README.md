## Summary

A simple npm project for testing a subset of the GitHub API using REST
requests. It is implemented in Javascript with axios and Jest library. The test
results are in Allure format.

### Local setup

- Add `github-pat=<your-github-pat>` to `tests/resources/.env`
- Run `npm run test` to execute the tests
- Run `npm run allure` to view Allure report
