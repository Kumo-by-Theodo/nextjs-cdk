import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  LambdaEdgeEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { join } from 'path';

import { prepareApiHandler } from './apiLambda';
import { prepareDefaultHandler } from './defaultLambda';

export class NextJSStack extends Stack {
  private mainNextBucket: Bucket;
  private nextCloudfront: Distribution;
  private defaultCachePolicy: CachePolicy;
  private defaultHandler: NodejsFunction;
  private apiHandler: NodejsFunction;

  constructor(scope: Construct, id: string, private nextAppRoot: string, props?: StackProps) {
    super(scope, id, props);

    this.defaultHandler = prepareDefaultHandler(this.nextAppRoot, this);

    this.apiHandler = prepareApiHandler(this.nextAppRoot, this);

    this.mainNextBucket = new Bucket(this, 'NextJSMainStorage', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.defaultCachePolicy = new CachePolicy(this, 'SLSNextJSDefaultCachePolicy', {
      defaultTtl: Duration.minutes(10),
    });

    const longCachePolicy = new CachePolicy(this, 'SLSNextJSLongCachePolicy', {
      defaultTtl: Duration.days(30),
    });
    const noCachePolicy = new CachePolicy(this, 'SLSNextJSNoCachePolicy', {
      minTtl: Duration.days(0),
      defaultTtl: Duration.days(0),
      maxTtl: Duration.days(0),
    });

    this.nextCloudfront = new Distribution(this, 'NextJSDistribution', {
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
          responsePagePath: '/serverless/pages/500.html',
        },
      ],
    });

    this.nextCloudfront.addBehavior('_next/*', new S3Origin(this.mainNextBucket), {
      cachePolicy: longCachePolicy,
    });
    this.nextCloudfront.addBehavior('api/*', new S3Origin(this.mainNextBucket), {
      cachePolicy: noCachePolicy,
      edgeLambdas: [
        {
          eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          functionVersion: this.apiHandler.currentVersion,
          includeBody: true,
        },
      ],
      allowedMethods: AllowedMethods.ALLOW_ALL,
    });

    new BucketDeployment(this, 'NextJSAssetsDeployment', {
      destinationBucket: this.mainNextBucket,
      destinationKeyPrefix: 'serverless',
      sources: [Source.asset(join(nextAppRoot, '.next/serverless'))],
      distribution: this.nextCloudfront,
      distributionPaths: ['/*'],
    });

    new BucketDeployment(this, 'NextJSPublicDeployment', {
      destinationBucket: this.mainNextBucket,
      destinationKeyPrefix: 'public',
      sources: [Source.asset(join(nextAppRoot, 'public'))],
      distribution: this.nextCloudfront,
      distributionPaths: ['/*'],
    });

    new BucketDeployment(this, 'NextJSStaticDeployment', {
      destinationBucket: this.mainNextBucket,
      destinationKeyPrefix: '_next/static',
      sources: [Source.asset(join(nextAppRoot, '.next/static'))],
      distribution: this.nextCloudfront,
      distributionPaths: ['/_next/static/*'],
    });
  }
}
