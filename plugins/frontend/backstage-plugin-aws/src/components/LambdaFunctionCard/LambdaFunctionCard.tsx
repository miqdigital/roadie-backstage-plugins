/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';
import {
  InfoCard,
  InfoCardVariants,
  StructuredMetadataTable,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { awsApiRef } from '../../api/AwsApi';
import { LAMBDA_FUNCTION_ARN_ANNOTATION } from '../../constants';
import { parse as parseArn } from '@aws-sdk/util-arn-parser';
import { useAsync } from 'react-use';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2, 1, 2, 2),
    },
    '& td': {
      whiteSpace: 'normal',
    },
  },
}));

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
  variant?: InfoCardVariants;
};

export const LambdaFunctionCard = (props: Props) => {
  const { entity } = useEntity();
  const awsApi = useApi(awsApiRef);
  const [lambdaDetails, setLambdaDetails] = useState<any | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [annotationError, setAnnotationError] = useState<string | undefined>();

  useAsync(async () => {
    if (!lambdaDetails) {
      if (
        entity.metadata.annotations &&
        entity.metadata.annotations[LAMBDA_FUNCTION_ARN_ANNOTATION]
      ) {
        setLoading(true);

        const lambdaArn =
          entity.metadata.annotations[LAMBDA_FUNCTION_ARN_ANNOTATION];

        const { region, accountId, resource } = parseArn(lambdaArn);
        const [_, resourceId] = resource.split(/\/|:/);

        const lambdaFunctionDetails = await awsApi.getResource({
          AccountId: accountId,
          TypeName: 'AWS::Lambda::Function',
          Identifier: resourceId,
          Region: region,
        });
        setLambdaDetails(lambdaFunctionDetails);
        setLoading(false);
      } else {
        setAnnotationError(LAMBDA_FUNCTION_ARN_ANNOTATION);
        setLoading(false);
      }
    }
    return undefined;
  }, [entity, setLambdaDetails, lambdaDetails]);

  const classes = useStyles();

  if (loading) {
    return <CircularProgress />;
  }

  if (annotationError) {
    return (
      <>
        <MissingAnnotationEmptyState annotation={annotationError} />
      </>
    );
  }

  return (
    <InfoCard
      title="AWS Lambda Function Details"
      className={classes.infoCard}
      variant={props.variant}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Box position="relative">
          <StructuredMetadataTable metadata={lambdaDetails} />
        </Box>
      )}
    </InfoCard>
  );
};
