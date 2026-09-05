import type { PublicProfileParamList } from './publicProfile';

export type JobsFlowParamList = {
  JobDetail: {
    jobId: string;
  };
  ApplyToJob: {
    jobId: string;
    jobTitle: string;
  };
  JobApplicants: {
    jobId: string;
    jobTitle: string;
  };
  JobApplicantDetail: {
    jobId: string;
    jobTitle: string;
    applicationId: string;
  };
} & PublicProfileParamList;
