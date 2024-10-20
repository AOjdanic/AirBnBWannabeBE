import { ParsedQs } from 'qs';
import { Query } from 'mongoose';
import { UserType } from '../types/types';

export class ApiFilteringService {
  mongooseQuery: Query<UserType[], UserType>;
  requestQuery: ParsedQs;

  constructor(
    mongooseQuery: Query<UserType[], UserType>,
    requestQuery: ParsedQs,
  ) {
    this.mongooseQuery = mongooseQuery;
    this.requestQuery = requestQuery;
  }

  filter() {
    const requestQueryObj = { ...this.requestQuery };
    const excludedFields = ['limit', 'sort', 'fields', 'page'];
    excludedFields.forEach((field) => delete requestQueryObj[field]);

    let requestQueryObjString = JSON.stringify(requestQueryObj);
    requestQueryObjString = requestQueryObjString.replaceAll(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );

    this.mongooseQuery = this.mongooseQuery.find(
      JSON.parse(requestQueryObjString),
    );

    return this;
  }

  sort() {
    if (this.requestQuery.sort) {
      // @ts-expect-error toeuhtoehu
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-last_scraped');
    }
    return this;
  }

  paginate() {
    const page = Number(this.requestQuery.page) || 1;
    const limit = Number(this.requestQuery.limit) || 50;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }

  select() {
    if (this.requestQuery.fields) {
      // @ts-expect-error toeuhtoehu
      const fields = this.requestQuery.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-calendar_last_scraped');
    }

    return this;
  }
}