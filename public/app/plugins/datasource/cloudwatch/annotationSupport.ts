import { AnnotationQuery } from '@grafana/data';
import { AnnotationQueryEditor } from './components/AnnotationQueryEditor';
import { isCloudWatchAnnotation } from './guards';
import { CloudWatchAnnotationQuery, CloudWatchQuery, LegacyAnnotationQuery } from './types';

export const CloudWatchAnnotationSupport = {
  // converts legacy angular style queries to new format. Also sets the same default values as what used to be set in the deprecated angular directive
  prepareAnnotation: (
    query: LegacyAnnotationQuery | AnnotationQuery<CloudWatchAnnotationQuery>
  ): AnnotationQuery<CloudWatchAnnotationQuery> => {
    if (isCloudWatchAnnotation(query)) {
      return query;
    }

    return {
      datasource: query.datasource,
      enable: query.enable,
      iconColor: query.iconColor,
      name: query.name,
      builtIn: query.builtIn,
      hide: query.hide,
      target: {
        ...query.target,
        ...query,
        statistic: query.statistic || 'Average',
        region: query.region || 'default',
        queryMode: 'Annotations',
        refId: query.refId || 'annotationQuery',
      },
    };
  },
  // return undefined if query is not complete so that annotation query execution is quietly skipped
  prepareQuery: (anno: AnnotationQuery<CloudWatchAnnotationQuery>): CloudWatchQuery | undefined => {
    if (!anno.target) {
      return undefined;
    }

    const {
      prefixMatching,
      actionPrefix,
      alarmNamePrefix,
      statistic,
      namespace,
      metricName,
      dimensions = {},
    } = anno.target;
    const validPrefixMatchingQuery = !!prefixMatching && !!actionPrefix && !!alarmNamePrefix;
    const validMetricStatQuery =
      !prefixMatching && !!namespace && !!metricName && !!statistic && !!Object.values(dimensions).length;

    if (validPrefixMatchingQuery || validMetricStatQuery) {
      return anno.target;
    }

    return undefined;
  },
  QueryEditor: AnnotationQueryEditor,
};
