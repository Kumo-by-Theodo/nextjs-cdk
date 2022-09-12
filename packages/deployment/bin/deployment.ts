#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NextJSStack } from "../lib/nextjs-stack";
import { join } from "path";
import { exec } from "child_process";
import { exit, cwd } from "process";
import { existsSync, open, openSync, readFileSync, readSync } from "fs";

const app = new cdk.App();

const nextAppRoot = join(cwd(), "../../example-app");

if (!existsSync(join(nextAppRoot, "next.config.js"))) {
  console.error("next.config.js file not found... Aborting deploy");
  exit(1);
}

try {
  const nextConfig = require(join(nextAppRoot, "next.config.js"));
  if (nextConfig.target !== "serverless") {
    console.error(
      "Please set your next target to `serverless` before attempting a deploy"
    );
    exit(1);
  }
} catch (e) {
  console.error("Something went wrong trying to load next.config.js");
  exit(1);
}

exec(
  `${join(nextAppRoot, "node_modules/.bin/next")} build ${nextAppRoot}`,
  (error, stdout) => {
    if (error) {
      console.error(
        "Something went wrong building your next app... Aborting deploy"
      );
      console.debug(error);
      exit(1);
    } else {
      console.info("Next build completed");
      console.debug(stdout);

      new NextJSStack(app, "NextJSStack", nextAppRoot, {
        env: {
          region: "us-east-1",
        },
      });
    }
  }
);
