import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  CachePolicy,
  Distribution,
  Function,
  FunctionCode,
  LambdaEdgeEventType,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { exec } from "child_process";
import { Construct } from "constructs";
import { writeFileSync } from "fs";
import { join } from "path";
import { createDefaultHandlerManifest } from "../helpers/manifestBundler";

export class NextJSStack extends Stack {
  private mainNextBucket: Bucket;
  private nextCloudfront: Distribution;
  private defaultCachePolicy: CachePolicy;
  private defaultHandler: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    private nextAppRoot: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    this.defaultHandler = this.prepareDefaultHandler();

    this.mainNextBucket = new Bucket(this, "NextJSMainStorage", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.defaultCachePolicy = new CachePolicy(
      this,
      "NextJSDefaultCachePolicy",
      {
        defaultTtl: Duration.minutes(10),
      }
    );

    const longCachePolicy = new CachePolicy(this, "NextJSLongCachePolicy", {
      defaultTtl: Duration.days(30),
    });

    this.nextCloudfront = new Distribution(this, "NextJSDistribution", {
      enableLogging: true,
      defaultBehavior: {
        origin: new S3Origin(this.mainNextBucket),
        cachePolicy: this.defaultCachePolicy,
        edgeLambdas: [
          {
            eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: this.defaultHandler.currentVersion,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 500,
          responsePagePath: "/serverless/pages/500.html",
        },
      ],
    });

    this.nextCloudfront.addBehavior(
      "_next/*",
      new S3Origin(this.mainNextBucket),
      {
        cachePolicy: longCachePolicy,
      }
    );

    new BucketDeployment(this, "NextJSAssetsDeployment", {
      destinationBucket: this.mainNextBucket,
      destinationKeyPrefix: "serverless",
      sources: [Source.asset(join(nextAppRoot, ".next/serverless"))],
      distribution: this.nextCloudfront,
      distributionPaths: ["/*"],
    });

    new BucketDeployment(this, "NextJSStaticDeployment", {
      destinationBucket: this.mainNextBucket,
      destinationKeyPrefix: "_next/static",
      sources: [Source.asset(join(nextAppRoot, ".next/static"))],
      distribution: this.nextCloudfront,
      distributionPaths: ["/_next/static/*"],
    });
  }

  private prepareDefaultHandler() {
    const defaultHandlerFolder = join(__dirname, "../handlers/default");

    const pagesManifest = require(join(
      this.nextAppRoot,
      ".next/serverless/pages-manifest.json"
    ));
    const routesManifest = require(join(
      this.nextAppRoot,
      ".next/routes-manifest.json"
    ));

    const runtimeManifest = createDefaultHandlerManifest(
      pagesManifest,
      routesManifest
    );

    writeFileSync(
      join(defaultHandlerFolder, "manifest.json"),
      JSON.stringify(runtimeManifest)
    );

    return new NodejsFunction(this, "NextJSDefault", {
      entry: join(defaultHandlerFolder, "index.ts"),
      logRetention: RetentionDays.ONE_DAY,
    });
  }
}
