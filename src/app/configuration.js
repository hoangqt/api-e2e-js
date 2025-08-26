const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../tests/resources/.env') });

class Configuration {
  constructor() {
    this.owner = process.env["owner"];
  }

  getToken() {
    if (process.env.GITHUB_PAT) {
      this.githubPat = process.env.GITHUB_PAT;
    } else {
      this.githubPat = process.env["github-pat"];
    }
    return this.githubPat;
  }

  getOwner() {
    return this.owner;
  }
}

module.exports = Configuration;
