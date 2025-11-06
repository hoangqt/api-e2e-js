import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../tests/resources/.env") });

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

export default Configuration;
