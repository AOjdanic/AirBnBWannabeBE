import { Model, Types, HydratedDocument } from 'mongoose';
import { ParsedQs } from 'qs';

export interface TAppError {
  status: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
}

export type UserType = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  username: string;
  password: string;
  active?: boolean;
  birthdate: string;
  role: 'admin' | 'user';
  passwordConfirm?: string;
  changedPasswordAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: number;
};

export type UserStaticMethods = {
  comparePasswords: (inputPass: string, userPass: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
  changedPasswordAfterIssuedToken: (jwtTimestamp: number) => boolean;
};

export type UserModel = Model<UserType, object, UserStaticMethods>;

export type UserDocument = HydratedDocument<UserType, UserStaticMethods>;

export type Listing = {
  _id: string;
  listing_url: string;
  name: string;
  summary: string;
  space: string;
  description: string;
  neighborhood_overview: string;
  notes: string;
  transit: string;
  access: string;
  interaction: string;
  house_rules: string;
  property_type: string;
  room_type: string;
  bed_type: string;
  minimum_nights: string;
  maximum_nights: string;
  cancellation_policy: string;
  last_scraped: Date;
  calendar_last_scraped: Date;
  first_review: Date;
  last_review: Date;
  accommodates: number;
  bedrooms: number;
  beds: number;
  number_of_reviews: number;
  bathrooms: number;
  amenities: string[];
  price: number;
  security_deposit: number;
  cleaning_fee: number;
  extra_people: number;
  guests_included: number;
  images: object;
  host: object;
  address: object;
  availability: object;
  review_scores: object;
  reviews: object[];
};

type featuresQuery = {
  sort?: string;
  limit?: string;
  page?: string;
  fields?: string;
};
export type RequestQuery = ParsedQs & featuresQuery;
