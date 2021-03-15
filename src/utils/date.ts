import moment, { MomentInput } from 'moment';

export const TimestampToDate = (timestamp: MomentInput): String => {
  const timestamp_year = moment(timestamp).format('Y');
  return moment(timestamp).format(
    timestamp_year === moment().year().toString() ? 'MMM D' : 'MMM D Y'
  );
};
