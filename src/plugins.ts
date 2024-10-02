import {DateTime} from "luxon";

import mongoose, {
  Error as MongooseError,
  Schema,
  SchemaType,
  SchemaTypeOptions,
} from "mongoose";

export class DateOnly extends SchemaType {
  constructor(key: string, options: SchemaTypeOptions<any>) {
    super(key, options, "DateOnly");
  }

  handleSingle(val: any) {
    return this.cast(val);
  }

  $conditionalHandlers = {
    ...(SchemaType as any).prototype.$conditionalHandlers,
    $gt: this.handleSingle,
    $gte: this.handleSingle,
    $lt: this.handleSingle,
    $lte: this.handleSingle,
  };

  // Based on castForQuery in mongoose/lib/schema/date.js
  // When using $gt, $gte, $lt, $lte, etc, we need to cast the value to a Date
  castForQuery($conditional: any, val: any, context: any): Date | undefined {
    if ($conditional == null) {
      return (this as any).applySetters(val, context);
    }

    const handler = this.$conditionalHandlers[$conditional];

    if (!handler) {
      throw new Error(`Can't use ${$conditional} with DateOnly.`);
    }

    return handler.call(this, val);
  }

  // When either setting a value to a DateOnly or fetching from the DB,
  // we want to strip off the time portion.
  cast(val: any): Date | undefined {
    if (val instanceof Date) {
      const date = DateTime.fromJSDate(val).toUTC().startOf("day");
      if (!date.isValid) {
        throw new MongooseError.CastError(
          "DateOnly",
          val,
          this.path,
          new Error("Value is not a valid date")
        );
      }
      return date.toJSDate();
    } else if (typeof val === "string" || typeof val === "number") {
      const date = DateTime.fromJSDate(new Date(val)).toUTC().startOf("day");
      if (!date.isValid) {
        throw new MongooseError.CastError(
          "DateOnly",
          val,
          this.path,
          new Error("Value is not a valid date")
        );
      }
      return date.toJSDate();
    }
    // Handle $gte, $lte, etc
    if (typeof val === "object") {
      return val;
    }
    throw new MongooseError.CastError(
      "DateOnly",
      val,
      this.path,
      new Error("Value is not a valid date")
    );
  }

  get(val: any): this {
    return val instanceof Date ? DateTime.fromJSDate(val).startOf("day").toJSDate() : val;
  }
}

// Register the schema type with Mongoose
mongoose.Schema.Types.DateOnly = DateOnly;
