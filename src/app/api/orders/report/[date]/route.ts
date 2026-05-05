import { z } from "zod";
import dayjs from "@/lib/dayjs";
import {
  generateOrderReport,
  getOrderReportByDate,
} from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";

type Params = { params: Promise<{ date: string }> };

const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

function parseDate(raw: string): Date {
  dateParam.parse(raw);
  return dayjs.utc(raw).startOf("day").toDate();
}

export const GET = authRouteHandler(async (_, { params }) => {
  const { date } = await (params as Params["params"]);
  const report = await getOrderReportByDate(parseDate(date));
  return Response.json(report);
});

export const POST = authRouteHandler(async (_, { params }) => {
  const { date } = await (params as Params["params"]);
  const report = await generateOrderReport(parseDate(date));
  return Response.json(report);
});
