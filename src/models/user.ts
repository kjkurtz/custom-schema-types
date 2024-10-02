import mongoose, {Schema} from "mongoose";

import { DateOnly } from "../plugins";
import { UserDocument, UserModel, UserSchema } from "../modelInterfaces";

const schema: UserSchema = new Schema(
  {
    name: {type: String, required: true},
    birthdate: {type: DateOnly, required: true},
    createdAt: {type: Date, required: true},
  },
  {strict: "throw"}
);

export const User = mongoose.model<UserDocument, UserModel>(
  "User",
  schema
);
